import Joi from 'joi';

import VideoDatabase from '~/db/VideoDatabase.js';
import VideoQueue from '~/queue/VideoQueue.js';

import AbstractEndpoint from '~/api/AbstractEndpoint.js';

class AddVideoToQueue extends AbstractEndpoint {
	setup () {
		this.add(this.checkVideo);
		this.add(this.addVideoToQueue);
	}

	getSchema () {
		return Joi.object({
			body: Joi.object({
				videoId: Joi.string().required(),
			}),
		});
	}

	async checkVideo (ctx, next) {
		const { videoId } = ctx.request.body;

		const video = await VideoDatabase.getVideo(videoId);
		if (!video) {
			return super.returnError(ctx, 400, `Couldn't find video with ID ${videoId}`);
		}

		ctx.video = video;

		return next();
	}

	async addVideoToQueue (ctx, next) {
		try {
			const video = ctx.video;

			return super.returnStatus(ctx, next, 200,
				'Successfully added video to the queue',
				{
					data: await VideoQueue.add(video),
				},
			);
		}
		catch (error) {
			return super.returnError(ctx, 400, error);
		}
	}
}

export default new AddVideoToQueue().middlewares();