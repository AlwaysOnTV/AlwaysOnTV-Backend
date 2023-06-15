import Joi from 'joi';
import NodeCache from 'node-cache';

import AbstractEndpoint from '~/api/AbstractEndpoint.js';
import Config from '~/utils/config.js';
import Utils from '~/utils/index.js';
import YTDL from '~/utils/ytdl.js';

const sleep = ms => new Promise(r => setTimeout(r, ms));

class GetProxiedStreamType extends AbstractEndpoint {
	constructor () {
		super();

		this.cache = new NodeCache({
			stdTTL: 60 * 30, // 30 minutes
			// stdTTL: 20, // 20 seconds
			checkperiod: 0,
			deleteOnExpire: false,
			maxKeys: 5,
		});

		this.is_fetching = {};
	}

	clearCache () {
		this.cache.flushAll();
	}

	isCached (videoId) {
		return this.cache.has(videoId);
	}

	isExpired (videoId) {
		return !this.isCached(videoId) || new Date() >= new Date(this.cache.getTtl(videoId));
	}

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
				videoQuality: Joi.number().default(Config.getCachedConfig().max_video_quality),
			}),
		});
	}

	async updateCacheInfo (videoId, videoQuality) {
		if (this.is_fetching[videoId]) return;

		this.is_fetching[videoId] = true;

		const { video, audio } = await YTDL.getBestVideoAndAudio(videoId, videoQuality);

		try {
			this.cache.set(videoId, {
				video: await Utils.proxy(video.url),
				audio: await Utils.proxy(audio.url),
			});

			delete this.is_fetching[videoId];
		}
		catch(error) {
			if (error?.errorcode !== 'ECACHEFULL') return;
			
			this.cache.del(this.cache.keys()[0]);

			delete this.is_fetching[videoId];
			return this.updateCacheInfo(videoId, videoQuality);
		}
	}

	async getVideoQuality (ctx, next) {
		const { videoQuality } = ctx.request.query;

		ctx.videoQuality = videoQuality || Config.getCachedConfig().max_video_quality;

		return next();
	}

	async getProxiedMPDValue (ctx, next) {
		const { videoId, streamType } = ctx.params;
		const { videoQuality } = ctx;

		if (this.isExpired(videoId)) {
			if (!this.isCached(videoId)) {
				await this.updateCacheInfo(videoId, videoQuality);
			}
			else {
				this.updateCacheInfo(videoId, videoQuality);
			}
		}

		const streams = this.cache.get(videoId);

		if (!streams?.video || !streams?.audio) {
			await sleep(100);
			return this.getProxiedMPDValue(ctx, next);
		}

		switch (streamType) {
		case 'video': {
			ctx.redirect(streams.video);
			return next();
		}
		case 'audio': {
			ctx.redirect(streams.audio);
			return next();
		}
		}

		return next();
	}
}

const getProxiedStreamType = new GetProxiedStreamType();

export default getProxiedStreamType.middlewares();
export function clearCache () {
	getProxiedStreamType.clearCache();
}