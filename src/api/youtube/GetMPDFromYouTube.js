import Joi from 'joi';

import AbstractEndpoint from '~/api/AbstractEndpoint.js';
import Config from '~/utils/config.js';
import pino from '~/utils/pino.js';
import YTDL from '~/utils/ytdl.js';

class GetMPDFromYouTube extends AbstractEndpoint {
	setup () {
		this.add(this.getVideoQuality);
		this.add(this.getMPDFromYouTube);
	}

	getSchema () {
		return Joi.object({
			query: Joi.object({
				videoId: Joi.string().required(),
				videoQuality: Joi.number().default(Config.getCachedConfig().max_video_quality),
			}),
		});
	}

	async getVideoQuality (ctx, next) {
		const { videoQuality } = ctx.request.query;

		ctx.videoQuality = videoQuality || Config.getCachedConfig().max_video_quality;

		return next();
	}

	async getMPDFromYouTube (ctx, next) {
		try {
			const { videoId } = ctx.request.query;
			const { videoQuality } = ctx;

			const data = await YTDL.getDashMPD(videoId, videoQuality);
			ctx.body = data;
			return next();
		}
		catch (error) {
			pino.error('Error in GetMPDFromYouTube.getMPDFromYouTube');
			pino.error(error);
			return super.error(ctx, error);
		}
	}
}

export default new GetMPDFromYouTube().middlewares();