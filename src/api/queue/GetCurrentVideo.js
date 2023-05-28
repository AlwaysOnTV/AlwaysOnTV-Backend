import YTDL from '~/utils/ytdl.js';

import VideoQueue from '~/queue/VideoQueue.js';

import AbstractEndpoint from '~/api/AbstractEndpoint.js';

class GetCurrentVideo extends AbstractEndpoint {
	setup () {
		this.add(this.getCurrentVideo);
	}

	async getCurrentVideo (ctx, next) {
		try {
			const video = await VideoQueue.getFirst();

			if (!video) {
				return super.error(ctx, 'No items in the queue');
			}

			const data = {
				...video,
				...await YTDL.getBestVideoAndAudio(video.id),
			};

			return super.success(ctx, next, data);
		}
		catch (error) {
			return super.error(ctx, error);
		}
	}
}

export default new GetCurrentVideo().middlewares();