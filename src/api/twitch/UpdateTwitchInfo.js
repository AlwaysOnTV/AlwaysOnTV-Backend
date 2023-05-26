import Joi from 'joi';

import AbstractEndpoint from '~/api/AbstractEndpoint.js';
import Twitch from '~/utils/twitch.js';

class UpdateTwitchInfo extends AbstractEndpoint {
	setup () {
		this.add(this.updateTwitchInfo);
	}

	getSchema () {
		return Joi.object({
			body: Joi.object({
				title: Joi.string().required(),
				game_id: Joi.number().required(),
			}),
		});
	}

	async updateTwitchInfo (ctx, next) {
		try {
			const { title, game_id } = ctx.request.body;
			
			const result = await Twitch.updateChannelInformation({ title, game_id });

			if (!result) {
				return super.returnStatus(ctx, next, 200, 'Successfully updated Twitch title and game');
			}
			else {
				return super.returnError(ctx, 400, result);
			}
		}
		catch (error) {
			return super.returnError(ctx, 400, error);
		}
	}
}

export default new UpdateTwitchInfo().middlewares();