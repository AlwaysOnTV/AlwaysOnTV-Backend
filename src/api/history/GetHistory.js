import AbstractEndpoint from '~/api/AbstractEndpoint.js';

import HistoryQueue from '~/queue/HistoryQueue.js';

class GetHistory extends AbstractEndpoint {
	setup () {
		this.add(this.getHistory);
	}

	async getHistory (ctx, next) {
		try {
			ctx.body = await HistoryQueue.getAll();
		}
		catch (error) {
			return super.returnError(ctx, 400, error);
		}

		return next();
	}
}

export default new GetHistory().middlewares();