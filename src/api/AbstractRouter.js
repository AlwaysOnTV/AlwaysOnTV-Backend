export default class AbstractRouter {
	constructor (options = null) {
		this.options = options;
	}

	getRouter (Router) {
		this.setupRouter(Router(this.options));

		return {
			routes: this.router.routes(),
			allowedMethods: this.router.allowedMethods(),
		};
	}

	setupRouter (router) {
		this.router = router;
	}

	async returnStatus (ctx, next, status, message, body = {}) {
		ctx.body = {
			status,
			message,
			...body,
		};

		return next();
	}

	async returnError (ctx, next, error) {
		return this.returnStatus(ctx, next, 400, error?.message || error);
	}
}