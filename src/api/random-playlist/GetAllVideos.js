import AbstractEndpoint from '~/api/AbstractEndpoint.js';

import RandomPlaylistDatabase from '~/db/RandomPlaylistDatabase.js';

class GetAllVideos extends AbstractEndpoint {
	setup () {
		this.add(this.getAllVideos);
	}

	async getAllVideos (ctx, next) {
		try {
			ctx.body = await RandomPlaylistDatabase.getAll();
		}
		catch (error) {
			return super.returnError(ctx, 400, error);
		}

		return next();
	}
}

export default new GetAllVideos().middlewares();