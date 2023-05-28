import Joi from 'joi';

import AbstractEndpoint from '~/api/AbstractEndpoint.js';
import Twitch from '~/utils/twitch.js';

class GetGameFromTwitch extends AbstractEndpoint {
	setup () {
		this.add(this.getGameFromTwitch);
	}

	getSchema () {
		return Joi.object({
			body: Joi.object({
				id: Joi.number(),
				name: Joi.string(),
				igdb_id: Joi.number(),
			}).or('id', 'name', 'igdb_id'),
		});
	}

	async getGameFromTwitch (ctx, next) {
		try {
			const { id, name, igdb_id } = ctx.request.body;

			return super.success(ctx, next, await Twitch.getGameByData({ id, name, igdb_id }));
		}
		catch (error) {
			return super.error(ctx, error);
		}
	}
}

export default new GetGameFromTwitch().middlewares();