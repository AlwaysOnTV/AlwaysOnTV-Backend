import VideoQueue from '~/queue/VideoQueue.js';

import AbstractEndpoint from '~/api/AbstractEndpoint.js';
import Config from '~/utils/Config.js';

class GetCurrentVideo extends AbstractEndpoint {
	setup () {
		this.add(this.getCurrentVideo);
	}

	async getCurrentVideo (ctx, next) {
		try {
			const video = VideoQueue.getCurrentVideo();

			if (!video) {
				return super.error(ctx, 'No items in the queue');
			}

			const data = {
				...video,
				video_quality: Config.maxVideoQuality,
			};

			return super.success(ctx, next, data);
		}
		catch (error) {
			return super.error(ctx, error);
		}
	}
}

export default new GetCurrentVideo().middlewares();