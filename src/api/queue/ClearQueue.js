import VideoQueue from '~/queue/VideoQueue.js';

import AbstractEndpoint from '~/api/AbstractEndpoint.js';

class ClearQueue extends AbstractEndpoint {
	setup () {
		this.add(this.clearQueue);
	}

	async clearQueue (ctx, next) {
		try {
			await VideoQueue.clear();

			return super.returnStatus(ctx, next, 200, 'Successfully cleared the queue');
		}
		catch (error) {
			return super.returnError(ctx, 400, error);
		}
	}
}

export default new ClearQueue().middlewares();