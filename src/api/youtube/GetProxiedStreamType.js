import Joi from 'joi';

import AbstractEndpoint from '~/api/AbstractEndpoint.js';
import Config from '~/utils/Config.js';
import Utils from '~/utils/index.js';
import YTDL from '~/utils/YTDL.js';

const sleep = ms => new Promise(r => setTimeout(r, ms));

class GetProxiedStreamType extends AbstractEndpoint {
	setup () {
		this.add(this.getVideoQuality);
		this.add(this.getProxiedMPDValue);
	}

	getSchema () {
		return Joi.object({
			params: Joi.object({
				videoId: Joi.string().required(),
				streamType: Joi.string().required().allow('video', 'audio'),
			}),
			query: Joi.object({
				videoQuality: Joi.number().default(Config.maxVideoQuality),
			}),
		});
	}

	async getVideoQuality (ctx, next) {
		const { videoQuality } = ctx.request.query;

		ctx.videoQuality = videoQuality || Config.maxVideoQuality;

		return next();
	}

	async getProxiedMPDValue (ctx, next) {
		const { videoId, streamType } = ctx.params;
		const { videoQuality } = ctx;

		const { video, audio } = await YTDL.getBestVideoAndAudio(videoId, videoQuality);

		if (!video || !audio) {
			await sleep(100);
			return this.getProxiedMPDValue(ctx, next);
		}

		switch (streamType) {
		case 'video': {
			ctx.redirect(Utils.proxy(video.url));
			return next();
		}
		case 'audio': {
			ctx.redirect(Utils.proxy(audio.url));
			return next();
		}
		}

		return next();
	}
}

export default new GetProxiedStreamType().middlewares();