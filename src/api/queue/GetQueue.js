import VideoQueue from '~/queue/VideoQueue.js';

import AbstractEndpoint from '~/api/AbstractEndpoint.js';

class GetQueue extends AbstractEndpoint {
	setup () {
		this.add(this.getQueue);
	}

	async getQueue (ctx, next) {
		try {
			ctx.body = await VideoQueue.getAll();
		}
		catch (error) {
			return super.returnError(ctx, 400, error);
		}

		return next();
	}
}

export default new GetQueue().middlewares();