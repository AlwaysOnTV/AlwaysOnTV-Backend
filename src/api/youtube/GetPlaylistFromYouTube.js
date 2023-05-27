import Joi from 'joi';

import AbstractEndpoint from '~/api/AbstractEndpoint.js';
import YTDL from '~/utils/ytdl.js';

class GetPlaylistFromYouTube extends AbstractEndpoint {
	setup () {
		this.add(this.getPlaylistFromYouTube);
	}

	getSchema () {
		return Joi.object({
			body: Joi.object({
				playlistId: Joi.string().required(),
			}),
		});
	}

	async getPlaylistFromYouTube (ctx, next) {
		try {
			const { playlistId } = ctx.request.body;

			ctx.body = await YTDL.getPlaylist(playlistId, false);
		}
		catch (error) {
			return super.returnError(ctx, 400, error);
		}

		return next();
	}
}

export default new GetPlaylistFromYouTube().middlewares();