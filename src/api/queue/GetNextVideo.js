import YTDL from '~/utils/ytdl.js';

import VideoQueue from '~/queue/VideoQueue.js';

import AbstractEndpoint from '~/api/AbstractEndpoint.js';

class GetNextVideo extends AbstractEndpoint {
	setup () {
		this.add(this.getNextVideo);
	}

	async getNextVideo (ctx, next) {
		try {
			const result = await VideoQueue.advanceQueue();

			if (!result) {
				return super.returnError(ctx, 400, 'No items in the queue');
			}

			if (result) {
				const data = {
					...result,
					...await YTDL.getBestVideoAndAudio(result.id),
				};

				ctx.body = data;
			}
			else {
				return super.returnError(ctx, 400, 'No more items in the queue');
			}
		}
		catch (error) {
			return super.returnError(ctx, 400, error);
		}
	
		return next();
	}
}

export default new GetNextVideo().middlewares();