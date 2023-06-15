import got from 'got';
import Config from '~/utils/config.js';
import pino from '~/utils/pino.js';

class Utils {
	proxy (url) {
		return `${Config.getCachedConfig().server.api_url}/proxy/${url}`;
	}
	
	async sleep (ms) {
		return new Promise(r => setTimeout(r, ms));
	}

	async request (_url, options = {}) {
		try {
			const url = new URL(_url);

			options.headers = options.headers || {};
			options.headers['content-type'] = 'application/json';

			return await got(url, options).json();
		}
		catch (error) {
			pino.error('Error in Utils.request');
			pino.error(error);
			throw error;
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