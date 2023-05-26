import Joi from 'joi';

import YTDL from '~/utils/ytdl.js';

import GameDatabase from '~/db/GameDatabase.js';
import VideoDatabase from '~/db/VideoDatabase.js';
import RandomPlaylistDatabase from '~/db/RandomPlaylistDatabase.js';

import AbstractEndpoint from '~/api/AbstractEndpoint.js';

class AddVideo extends AbstractEndpoint {
	setup () {
		this.add(this.checkGame);
		this.add(this.addVideo);
	}

	getSchema () {
		return Joi.object({
			body: Joi.object({
				videoId: Joi.string().required(),
				gameId: Joi.number().required(),
				addToRandomPlaylist: Joi.bool().optional().default(false),
			}),
		});
	}

	async checkGame (ctx, next) {
		const { gameId } = ctx.request.body;

		const game = await GameDatabase.getByID(gameId);
		if (!game) {
			return super.returnError(ctx, 400, `Couldn't find game with ID ${gameId}`);
		}

		return next();
	}

	async addVideo (ctx, next) {
		try {
			const { videoId, gameId, addToRandomPlaylist } = ctx.request.body;

			const data = await YTDL.getVideoData(videoId);
	
			const dbData = {
				id: data.videoDetails.videoId,
				title: data.videoDetails.title,
				gameId,
				thumbnail_url: data.videoDetails.thumbnails?.reverse()[0]?.url,
			};
		
			if ((await VideoDatabase.getByID(dbData.id))) {
				return super.returnError(ctx, 400, `Video with ID ${dbData.id} already exists`);
			}

			const video = await VideoDatabase.createVideo(dbData);

			let randomPlaylistData = {};
			if (addToRandomPlaylist) {
				randomPlaylistData = await RandomPlaylistDatabase.addVideos(dbData.id);
			}

			return super.returnStatus(ctx, next, 200, 'Successfully added video', {
				data: {
					video,
					randomPlaylistData,
				},
			});
		}
		catch (error) {
			return super.returnError(ctx, 400, error);
		}
	}
}

export default new AddVideo().middlewares();