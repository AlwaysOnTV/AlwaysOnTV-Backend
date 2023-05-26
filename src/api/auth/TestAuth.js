import AbstractEndpoint from '~/api/AbstractEndpoint.js';
import Config from '~/utils/config.js';

class TestAuth extends AbstractEndpoint {
	setup () {
		this.add(this.testAuth);
	}

	async testAuth (ctx, next) {
		const { authorization } = ctx.headers;

		if (!authorization) {
			return super.returnError(ctx, 401, 'Incorrect password');
		}

		const { password } = await Config.getConfig();
		if (password && authorization !== password) {
			return super.returnError(ctx, 401, 'Incorrect password');
		}

		return super.returnStatus(ctx, next, 200, 'Successfully authenticated.');
	}
}

export default new TestAuth().middlewares();