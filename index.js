import Config from '~/utils/config.js';
import { initializeDatabase } from '~/db/index.js';
import setupKoa from '~/koa.js';
import setupCorsAnywhere from '~/cors-anywhere.js';

async function start () {
	await Config.init();

	await initializeDatabase();

	await setupKoa();

	await setupCorsAnywhere();

	// Initialize queue and history
	await import('~/queue/VideoQueue.js');
	await import('~/queue/HistoryQueue.js');
}

start();