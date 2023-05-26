import Joi from 'joi';

import VideoDatabase from '~/db/VideoDatabase.js';

import AbstractEndpoint from '~/api/AbstractEndpoint.js';

class DeleteVideoByID extends AbstractEndpoint {
	setup () {
		this.add(this.checkVideo);
		this.add(this.deleteVideoByID);
	}

	getSchema () {
		return Joi.object({
			params: Joi.object({
				id: Joi.string().required(),
			}),
			body: Joi.object({
				force: Joi.bool().default(false),
			}),
		});
	}

	async checkVideo (ctx, next) {
		const videoId = ctx.params.id;

		const video = await VideoDatabase.getVideo(videoId);
		if (!video) {
			return super.returnError(ctx, 400, `Couldn't find video with ID ${videoId}`);
		}

		ctx.videoId = videoId;

		return next();
	}

	async deleteVideoByID (ctx, next) {
		try {
			const videoId = ctx.videoId;
			const { force } = ctx.request.body;

			const status = await VideoDatabase.deleteVideo(videoId, force);
			if (status === true) {
				return super.returnStatus(ctx, next, 200, `Successfully deleted video with ID ${videoId}`);
			}
			else {
				return super.returnError(ctx, 400, `Failed to delete video with ID ${videoId}`, {
					errorCode: status.errno,
					errorMessage: status.code,
				});
			}
		}
		catch (error) {
			return super.returnError(ctx, 400, error);
		}
	}
}

export default new DeleteVideoByID().middlewares();