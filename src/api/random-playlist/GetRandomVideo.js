import AbstractEndpoint from '~/api/AbstractEndpoint.js';
import RandomPlaylistDatabase from '~/db/RandomPlaylistDatabase.js';

import YTDL from '~/utils/ytdl.js';

class GetRandomVideo extends AbstractEndpoint {
	setup () {
		this.add(this.getRandomVideo);
	}

	async getRandomVideo (ctx, next) {
		try {
			const randomVideo = await RandomPlaylistDatabase.getRandomVideo();
			if (!randomVideo) {
				return super.returnError(ctx, 400, 'The random playlist is empty.');
			}

			ctx.body = {
				...randomVideo,
				...await YTDL.getBestVideoAndAudio(randomVideo.id),
			};
		}
		catch (error) {
			return super.returnError(ctx, 400, error);
		}

		return next();
	}
}

export default new GetRandomVideo().middlewares();