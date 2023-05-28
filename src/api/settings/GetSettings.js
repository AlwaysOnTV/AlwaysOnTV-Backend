import AbstractEndpoint from '~/api/AbstractEndpoint.js';

import Config from '~/utils/config.js';

class GetSettings extends AbstractEndpoint {
	setup () {
		this.add(this.getSettings);
	}

	async getSettings (ctx, next) {
		return super.success(ctx, next, await Config.getConfig());
	}
}

export default new GetSettings().middlewares();