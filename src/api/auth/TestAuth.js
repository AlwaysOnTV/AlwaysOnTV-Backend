import AbstractEndpoint from '~/api/AbstractEndpoint.js';
import Config from '~/utils/config.js';

class TestAuth extends AbstractEndpoint {
	setup () {
		this.add(this.testAuth);
	}

	async testAuth (ctx, next) {
		const { authorization } = ctx.headers;

		if (!authorization) {
			return super.error(ctx, 'Incorrect password', 401);
		}

		const { password } = await Config.getConfig();
		if (password && authorization !== password) {
			return super.error(ctx, 'Incorrect password', 401);
		}

		return super.success(ctx, next, {
			authenticated: true,
		});
	}
}

export default new TestAuth().middlewares();