import got from 'got';
import Config from '~/utils/config.js';
import logging from '~/utils/logging.js';

class Utils {
	async proxy (url) {
		const { use_cors, cors_url } = (await Config.getConfig()).server;
		if (!use_cors) return url;

		return `${cors_url}/${url}`;
	}
	
	async sleep (ms) {
		return new Promise(r => setTimeout(r, ms));
	}

	async request (_url, options) {
		try {
			const url = new URL(_url);

			options.headers['content-type'] = 'application/json';

			return await got(url, options).json();
		}
		catch (error) {
			logging.error(error);
			return error;
		}
	}

	async getAsJSON (url, options = {}) {
		return this.request(url, {
			...options,
			method: 'GET',
		});
	}

	async postAsJSON (url, options = {}) {
		return this.request(url, {
			...options,
			method: 'POST',
		});
	}

	async patchAsJSON (url, options = {}) {
		return this.request(url, {
			...options,
			method: 'PATCH',
		});
	}
}

export default new Utils();