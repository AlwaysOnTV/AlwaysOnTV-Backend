import pino from 'pino';
import { createWriteStream } from 'node:fs';

const streams = [
	// {
	// 	level: 'info', // log INFO and above
	// 	stream: createWriteStream('./app.log', { flags: 'a' }),
	// },
	{
		level: 'error', // log INFO and above
		stream: createWriteStream('./error.log', { flags: 'a' }),
	},
];

export default pino(
	{
		level: 'info',
	},
	pino.multistream(streams),
);