import Joi from 'joi';

import GameDatabase from '~/db/GameDatabase.js';
import VideoDatabase from '~/db/VideoDatabase.js';

import AbstractEndpoint from '~/api/AbstractEndpoint.js';

class UpdateVideoByID extends AbstractEndpoint {
	setup () {
		this.add(this.checkVideo);
		this.add(this.checkGame);
		this.add(this.updateVideoByID);
	}

	getSchema () {
		return Joi.object({
			params: Joi.object({
				id: Joi.string().required(),
			}),
			body: Joi.object({
				title: Joi.string(),
				gameId: Joi.string(),
				thumbnail_url: Joi.string(),
			}).or('title', 'gameId', 'thumbnail_url'),
		});
	}

	async checkVideo (ctx, next) {
		const videoId = ctx.params.id;

		if (!(await VideoDatabase.getByID(videoId))) {
			return super.returnError(ctx, 400, `No video with ID ${videoId} found`);
		}

		ctx.videoId = videoId;

		return next();
	}

	async checkGame (ctx, next) {
		const { gameId } = ctx.request.body;

		if (gameId) {
			if (!(await GameDatabase.getByID(gameId))) {
				return super.returnError(ctx, 400, `No game with ID ${gameId} found`);
			}
		}

		return next();
	}

	async updateVideoByID (ctx, next) {
		try {
			const { title, gameId, thumbnail_url } = ctx.request.body;

			return super.returnStatus(ctx, next, 200, 'Successfully edited video', {
				data: await VideoDatabase.updateVideo(ctx.videoId, {
					title,
					gameId,
					thumbnail_url,
				}),
			});
		}
		catch (error) {
			return super.returnError(ctx, 400, error);
		}
	}
}

export default new UpdateVideoByID().middlewares();