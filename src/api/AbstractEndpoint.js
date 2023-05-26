import { getValidateAllMw } from 'koa-mw-joi';

export default class AbstractEndpoint {
	constructor () {
		this._middlewares = [];

		this.setup();
	}

	add (fn) {
		this._middlewares.push(fn.bind(this));
	}

	setup () {}
	
	getSchema () {}

	middlewares () {
		const mws = [...this._middlewares];

		const schema = this.getSchema();
		if (schema) {
			mws.unshift(getValidateAllMw(schema));
		}

		return mws;
	}

	async returnStatus (ctx, next, status, message, body = {}) {
		ctx.status = status;

		ctx.body = {
			status,
			message,
			...body,
		};

		return next && next();
	}

	async returnError (ctx, errorCode = 400, messageOrError = '', body = {}) {
		return this.returnStatus(ctx, null, errorCode, messageOrError?.message || messageOrError, body);
	}
}