import VideoQueue from '~/queue/VideoQueue.js';

import AbstractEndpoint from '~/api/AbstractEndpoint.js';

class DeleteVideoFromQueue extends AbstractEndpoint {
	setup () {
		this.add(this.checkIndex);
		this.add(this.deleteVideoFromQueue);
	}

	async checkIndex (ctx, next) {
		const { index } = ctx.params;
			
		const parsedIndex = parseInt(index, 10);

		if (!Number.isFinite(parsedIndex)) {
			return super.returnError(ctx, 400, `Invalid value for index: ${index}`);
		}

		ctx.index = parsedIndex;

		return next();
	}

	async deleteVideoFromQueue (ctx, next) {
		try {
			const index = ctx.index;

			const result = await VideoQueue.remove(index);
			if (!Array.isArray(result)) {
				return super.returnError(ctx, 400, result);
			}

			return super.returnStatus(ctx, next, 200, `Successfully removed video at position ${index + 1} from the queue`);
		}
		catch (error) {
			return super.returnError(ctx, 400, error);
		}
	}
}

export default new DeleteVideoFromQueue().middlewares();