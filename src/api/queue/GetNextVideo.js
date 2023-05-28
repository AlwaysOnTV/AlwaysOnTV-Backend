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
				return super.error(ctx, 'No items in the queue');
			}

			if (result) {
				const data = {
					...result,
					...await YTDL.getBestVideoAndAudio(result.id),
				};

				return super.success(ctx, next, data);
			}
			else {
				return super.error(ctx, 'No more items in the queue');
			}
		}
		catch (error) {
			return super.error(ctx, error);
		}
	}
}

export default new GetNextVideo().middlewares();