import Joi from 'joi';

import Config from '~/utils/config.js';

import AbstractEndpoint from '~/api/AbstractEndpoint.js';

class UpdateSettings extends AbstractEndpoint {
	setup () {
		this.add(this.updateSettings);
	}

	getSchema () {
		return Joi.object({
			body: Joi.object({
				twitch_enabled: Joi.bool(),
				client_id: Joi.string().allow(null, ''),
				client_secret: Joi.string().allow(null, ''),
				title_replacement: Joi.string(),
				use_random_playlist: Joi.bool(),
			}).or('twitch_enabled', 'client_id', 'client_secret', 'title_replacement', 'use_random_playlist'),
		});
	}

	async updateSettings (ctx, next) {
		try {
			const {
				twitch_enabled,
				client_id,
				client_secret,
				title_replacement,
				use_random_playlist, 
			} = ctx.request.body;

			await Config.updateTwitchEnabled(twitch_enabled);
			await Config.updateTwitchClientOrSecret(client_id, client_secret);
			await Config.updateTitleReplacement(title_replacement);
			await Config.updateUseRandomPlaylist(use_random_playlist);

			return super.success(ctx, next, {
				updated: {
					twitch_enabled,
					client_id,
					client_secret,
					title_replacement,
					use_random_playlist,
				},
			});
		}
		catch (error) {
			return super.error(ctx, error);
		}
	}
}

export default new UpdateSettings().middlewares();