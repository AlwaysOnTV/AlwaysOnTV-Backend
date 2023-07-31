import AbstractEndpoint from '~/api/AbstractEndpoint.js';
import got from 'got';

import pino from '~/utils/Pino.js';

const rangePattern = /bytes=(\d+)-(\d+)/;

class ProxyRequest extends AbstractEndpoint {
	setup () {
		this.add(this.addHeaders);
		this.add(this.proxyRequest);
	}

	parseRange (range) {
		const matches = range.match(rangePattern);
		if (!matches) return false;

		return {
			from: parseInt(matches[1], 10),
			to: parseInt(matches[2], 10),
		};
	}

	async addHeaders (ctx, next) {
		ctx.set('Access-Control-Allow-Origin', '*');
		ctx.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
		ctx.set('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS, PATCH');
		ctx.set('Access-Control-Max-Age', '1728000');

		return next();
	}

	async proxyRequest (ctx, next) {
		const url = ctx.request.url.replace('/api/proxy/', '');

		if (!url) {
			return super.error(ctx, 'No URL supplied.');
		}

		const headers = {};
		for (const [header, value] of Object.entries(ctx.request.headers)) {
			if (header === 'host') continue;

			headers[header] = value;
		}

		const parsedURL = new URL(url);
		const contentLength = parsedURL.searchParams.get('clen');

		const range = this.parseRange(headers.range);
		if (!contentLength || !range) {
			ctx.status = 400;
			return next();
		}

		const contentLengthNumber = parseInt(contentLength, 10);

		if (range.from > range.to) range.to = contentLengthNumber;

		headers.range = `bytes=${range.from}-${range.to}`;

		const data = got.stream(parsedURL, {
			headers,
			retry: {
				limit: 20,
			},
		})
			.on('error', async error => {
				// ECONNRESET is fine; It can happen when we load the next segment.
				if (error.code === 'ECONNRESET') {
					return super.error(ctx, error, 500);
				}

				pino.error('Error in ProxyRequest.proxyRequest .. got.stream');
				pino.error(error);

				return super.error(ctx, error, 500);
			});

		ctx.body = data;

		return next();
	}
}

export default new ProxyRequest().middlewares();