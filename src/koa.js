import Koa from 'koa';
import responseTime from 'koa-response-time';
import { koaBody } from 'koa-body';
import conditional from 'koa-conditional-get';
import etag from 'koa-etag';
import json from 'koa-json';
import cors from '@koa/cors';
import serve from 'koa-static';

import session from 'koa-session';
import mount from 'koa-mount';
import grant from '~/grant.js';

// --- Setup Koa

import path from 'node:path';
import { readFile } from 'node:fs/promises';
import logging from '~/utils/logging.js';

async function setupKoa () {
	const app = new Koa();
	
	app.use(responseTime({ hrtime: true }));
	app.use(koaBody({
		multipart: true,
		jsonLimit: '3mb',
	}));
	app.use(conditional());
	app.use(etag());
	app.use(cors({
		origin: '*',
	}));
	app.use(json());

	app.use(mount(serve('./public')));
	app.use(async (ctx, next) => {
		const requestUrl = ctx.request.url;

		// Check if the request URL does not contain a period or does not end with a file extension
		if (
			requestUrl.includes('.') ||
			path.extname(requestUrl) ||
			requestUrl.startsWith('/api') ||
			requestUrl.startsWith('/auth')
		) {
			return next();
		}
		
		ctx.set('Content-Type', 'text/html');
		ctx.body = await readFile('./public/index.html', 'utf-8');
	});
	
	app.keys = ['grant_alwaysontv'];
	app.use(session(app));
	app.use(mount(grant));

	app.proxy = true;

	return app;
}

// ---

import setupRouters from '~/api/index.js';
import Config from '~/utils/config.js';

export default async function start () {
	const app = await setupKoa();

	await setupRouters(app);
	
	const port = (await Config.getConfig()).server.port;

	app.listen(port, () => {
		logging.info(`Koa server listening on localhost:${port}`);
	});
}