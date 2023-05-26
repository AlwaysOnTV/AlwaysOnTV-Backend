import AbstractRouter from '~/api/AbstractRouter.js';
import checkPassword from '~/api/PasswordMiddleware.js';
import GetPlaylistFromYouTube from '~/api/youtube/GetPlaylistFromYouTube.js';
import GetVideoFromYouTube from '~/api/youtube/GetVideoFromYouTube.js';

class YouTubeRouter extends AbstractRouter {
	constructor () {
		super({ prefix: '/api/youtube' });
	}

	setupRouter (router) {
		super.setupRouter(router);

		router.use(checkPassword);

		router.post('/get-video', ...GetVideoFromYouTube);
		router.post('/get-playlist', ...GetPlaylistFromYouTube);
	}
}

export default Router => new YouTubeRouter().getRouter(Router);