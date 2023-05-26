import Joi from 'joi';

import AbstractEndpoint from '~/api/AbstractEndpoint.js';
import GameDatabase from '~/db/GameDatabase.js';

class AddGame extends AbstractEndpoint {
	setup () {
		this.add(this.checkGame);
		this.add(this.addGame);
	}

	getSchema () {
		return Joi.object({
			body: Joi.object({
				gameId: Joi.string().required(),
				title: Joi.string().required(),
				thumbnail_url: Joi.string().required(),
			}),
		});
	}

	async checkGame (ctx, next) {
		const { gameId } = ctx.request.body;

		const game = await GameDatabase.getByID(gameId);
		if (game) {
			return super.returnError(ctx, 400, `Game with ID ${gameId} already exists.`);
		}

		return next();
	}

	async addGame (ctx, next) {
		try {
			const { gameId, title, thumbnail_url } = ctx.request.body;

			return super.returnStatus(ctx, next, 200, 'Successfully added game', {
				data: await GameDatabase.createGame(gameId, title, thumbnail_url),
			});
		}
		catch (error) {
			return super.returnError(ctx, 400, error);
		}
	}
}

export default new AddGame().middlewares();