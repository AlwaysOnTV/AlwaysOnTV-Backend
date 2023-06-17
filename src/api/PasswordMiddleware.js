import Config from '~/utils/config.js';

export default async function checkPassword (ctx, next) {
	const { password } = await Config.getConfig();

	if (!password) return next();

	const authorization = ctx.headers.authorization || ctx.cookies.get('password');
	if (!authorization || authorization !== password) {
		ctx.status = 401;
		return;
	}

	return next();
}