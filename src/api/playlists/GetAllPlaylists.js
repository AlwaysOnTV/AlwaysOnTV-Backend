import AbstractEndpoint from '~/api/AbstractEndpoint.js';

import PlaylistDatabase from '~/db/PlaylistDatabase.js';

class GetAllPlaylists extends AbstractEndpoint {
	setup () {
		this.add(this.getAllPlaylists);
	}

	async getAllPlaylists (ctx, next) {
		try {
			ctx.body = await PlaylistDatabase.getAllPlaylists();
		}
		catch (error) {
			return super.returnError(ctx, 400, error);
		}

		return next();
	}
}

export default new GetAllPlaylists().middlewares();