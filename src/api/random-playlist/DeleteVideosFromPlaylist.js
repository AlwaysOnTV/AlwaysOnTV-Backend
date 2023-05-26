import Joi from 'joi';

import AbstractEndpoint from '~/api/AbstractEndpoint.js';
import RandomPlaylistDatabase from '~/db/RandomPlaylistDatabase.js';

class DeleteVideosFromPlaylist extends AbstractEndpoint {
	setup () {
		this.add(this.deleteVideosFromPlaylist);
	}

	getSchema () {
		return Joi.object({
			body: Joi.object({
				videoIds: Joi.alternatives().try(
					Joi.string(),
					Joi.array().items(Joi.string()),
				).required(),
			}),
		});
	}

	async deleteVideosFromPlaylist (ctx, next) {
		try {
			const { videoIds } = ctx.request.body;

			const data = await RandomPlaylistDatabase.deleteVideos(videoIds);

			return super.returnStatus(ctx, next, 200,
				`Successfully removed ${data.deleted.length} videos from the random playlist`,	
				data,
			);
		}
		catch (error) {
			return super.returnError(ctx, 400, error);
		}
	}
}

export default new DeleteVideosFromPlaylist().middlewares();