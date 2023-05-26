import Joi from 'joi';

import VideoQueue from '~/queue/VideoQueue.js';

import AbstractEndpoint from '~/api/AbstractEndpoint.js';

class UpdateQueue extends AbstractEndpoint {
	setup () {
		this.add(this.updateQueue);
	}

	getSchema () {
		return Joi.object({
			body: Joi.object({
				index: Joi.number().required(),
				newIndex: Joi.alternatives().try(
					Joi.number(),
					Joi.string().valid('start', 'end'),
				).required(),
			}),
		});
	}

	async updateQueue (ctx, next) {
		try {
			const { index, newIndex } = ctx.request.body;

			const result = await VideoQueue.move(index, newIndex);
			if (!Array.isArray(result)) {
				return super.returnError(ctx, 400, result);
			}

			return super.returnStatus(ctx, next, 200,
				'Successfully moved video',
				{
					data: result,
				},
			);
		}
		catch (error) {
			return super.returnError(ctx, 400, error);
		}
	}
}

export default new UpdateQueue().middlewares();