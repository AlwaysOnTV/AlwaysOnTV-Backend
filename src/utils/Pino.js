import pino from 'pino';
import pretty from 'pino-pretty';

const streams = [
	{
		// Console output
		level: 'info',
		stream: pretty(),
	},
	{
		// Console output
		level: 'error',
		stream: pretty(),
	},
	{
		// File output
		level: 'info',
		stream: pretty({
			colorize: false,
			destination: './info.log',
		}),
	},
	{
		// File output
		level: 'error',
		stream: pretty({
			colorize: false,
			destination: './error.log',
		}),
	},
];

export default pino(
	{
		level: 'info',
	},
	pino.multistream(streams, {
		dedupe: true,
	}),
);