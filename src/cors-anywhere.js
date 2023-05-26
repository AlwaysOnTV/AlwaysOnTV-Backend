import corsAnywhere from 'cors-anywhere';
import Config from '~/utils/config.js';
import logging from '~/utils/logging.js';

export default async function setup () {
	const { use_cors, cors_port } = (await Config.getConfig()).server;

	if (!use_cors) return;

	corsAnywhere.createServer({
		originWhitelist: [], // Allow all origins
		requireHeader: ['origin', 'x-requested-with'],
		removeHeaders: ['cookie', 'cookie2'],
	}).listen(cors_port, function () {
		logging.info(`Running CORS Anywhere on localhost:${cors_port}.`);
	});
}
