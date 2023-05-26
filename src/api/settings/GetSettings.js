import AbstractEndpoint from '~/api/AbstractEndpoint.js';

import Config from '~/utils/config.js';

class GetSettings extends AbstractEndpoint {
	setup () {
		this.add(this.getSettings);
	}

	async getSettings (ctx, next) {
		ctx.body = await Config.getConfig();

		return next();
	}
}

export default new GetSettings().middlewares();