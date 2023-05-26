import AbstractRouter from '~/api/AbstractRouter.js';
import checkPassword from '~/api/PasswordMiddleware.js';
import GetGameFromTwitch from '~/api/twitch/GetGameFromTwitch.js';
import UpdateTwitchInfo from '~/api/twitch/UpdateTwitchInfo.js';

class TwitchRouter extends AbstractRouter {
	constructor () {
		super({ prefix: '/api/twitch' });
	}

	setupRouter (router) {
		super.setupRouter(router);

		router.use(checkPassword);

		router.post('/get-game', ...GetGameFromTwitch);
		router.post('/update', ...UpdateTwitchInfo);
	}
}

export default Router => new TwitchRouter().getRouter(Router);