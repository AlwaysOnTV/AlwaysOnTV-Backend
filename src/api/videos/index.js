import AbstractRouter from '~/api/AbstractRouter.js';
import checkPassword from '~/api/PasswordMiddleware.js';

import AddVideo from '~/api/videos/AddVideo.js';
import DeleteVideoByID from '~/api/videos/DeleteVideoByID.js';
import GetAllVideos from '~/api/videos/GetAllVideos.js';
import GetVideoByID from '~/api/videos/GetVideoByID.js';
import UpdateVideoByID from '~/api/videos/UpdateVideoByID.js';

class VideoRouter extends AbstractRouter {
	constructor () {
		super({ prefix: '/api/videos' });
	}

	setupRouter (router) {
		super.setupRouter(router);

		router.use(checkPassword);

		router.get('/', ...GetAllVideos);
		router.get('/:orderBy', ...GetAllVideos);

		router.put('/', ...AddVideo);
			
		router.get('/id/:id', ...GetVideoByID);
		router.post('/id/:id', ...UpdateVideoByID);
		router.post('/id/:id/delete', ...DeleteVideoByID);
	}
}

export default Router => new VideoRouter().getRouter(Router);