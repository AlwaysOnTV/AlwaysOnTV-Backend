import Joi from 'joi';

import AbstractEndpoint from '~/api/AbstractEndpoint.js';
import PlaylistDatabase from '~/db/PlaylistDatabase.js';

class DeletePlaylistByID extends AbstractEndpoint {
	setup () {
		this.add(this.checkPlaylist);
		this.add(this.deletePlaylistByID);
	}

	getSchema () {
		return Joi.object({
			params: Joi.object({
				id: Joi.number().required(),
			}),
			body: Joi.object({
				force: Joi.bool().default(false),
			}),
		});
	}

	async checkPlaylist (ctx, next) {
		const playlistId = ctx.params.id;

		const playlist = await PlaylistDatabase.getPlaylistWithVideosAndGames(playlistId);
		if (!playlist) {
			return super.returnError(ctx, 400, `Couldn't find playlist with ID ${playlistId}`);
		}

		ctx.playlistId = playlistId;

		return next();
	}

	async deletePlaylistByID (ctx, next) {
		const playlistId = ctx.playlistId;
		const { force } = ctx.request.body;

		const status = await PlaylistDatabase.deletePlaylist(playlistId, force);
		if (status === true) {
			return super.returnStatus(ctx, next, 200, `Successfully deleted playlist with ID ${playlistId}`);
		}
		else {
			return super.returnError(ctx, 400, `Failed to delete playlist with ID ${playlistId}`, {
				errorCode: status.errno,
				errorMessage: status.code,
			});
		}
	}
}

export default new DeletePlaylistByID().middlewares();