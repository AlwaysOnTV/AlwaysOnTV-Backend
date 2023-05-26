import Joi from 'joi';

import AbstractEndpoint from '~/api/AbstractEndpoint.js';
import PlaylistDatabase from '~/db/PlaylistDatabase.js';

class UpdatePlaylistByID extends AbstractEndpoint {
	setup () {
		this.add(this.checkPlaylist);
		this.add(this.updatePlaylistByID);
	}

	getSchema () {
		return Joi.object({
			body: Joi.object({
				title: Joi.string().required(),
			}),
		});
	}

	async checkPlaylist (ctx, next) {
		const playlistId = ctx.params.id;

		if (!(await PlaylistDatabase.getByID(playlistId))) {
			return super.returnError(ctx, 400, `No playlist with ID ${playlistId} found`);
		}

		ctx.playlistId = playlistId;

		return next();
	}

	async updatePlaylistByID (ctx, next) {
		try {
			const { title } = ctx.request.body;

			ctx.body = await PlaylistDatabase.updatePlaylist(ctx.playlistId, title);
		}
		catch (error) {
			return super.returnError(ctx, 400, error);
		}

		return next();
	}
}

export default new UpdatePlaylistByID().middlewares();