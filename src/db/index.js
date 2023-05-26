import fs from 'node:fs';
import Knex from 'knex';
import knexfile from '~/knexfile.js';
import logging from '~/utils/logging.js';

let knex;

export async function initializeDatabase () {
	knex = Knex(knexfile);
	await knex.raw('PRAGMA foreign_keys = ON');

	const files = await fs.promises.readdir('src/db');

	for (const file of files) {
		if (!file.endsWith('.js')) continue;
		if (file === 'index.js') continue;
		if (file === 'AbstractDatabase.js') continue;

		const { default: Database } = await import(`./${file}`);
		await Database.init(knex);
	}

	logging.info('Initialized databases.');
}
