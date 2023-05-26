import Joi from 'joi';

import AbstractEndpoint from '~/api/AbstractEndpoint.js';
import YTDL from '~/utils/ytdl.js';

class GetVideoFromYouTube extends AbstractEndpoint {
	setup () {
		this.add(this.getVideoFromYouTube);
	}

	getSchema () {
		return Joi.object({
			body: Joi.object({
				videoId: Joi.string().required(),
			}),
		});
	}

	async getVideoFromYouTube (ctx, next) {
		try {
			const { videoId } = ctx.request.body;

			const data = await YTDL.getVideoData(videoId);
		
			const ytdlData = {
				id: data.videoDetails.videoId,
				title: data.videoDetails.title,
				thumbnail_url: data.videoDetails.thumbnails?.reverse()[0]?.url,
			};
	
			ctx.body = ytdlData;
		}
		catch (error) {
			return super.returnError(ctx, 400, error);
		}
	
		return next();
	}
}

export default new GetVideoFromYouTube().middlewares();