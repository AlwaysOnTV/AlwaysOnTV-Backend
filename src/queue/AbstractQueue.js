import fs from 'node:fs';
import pino from '~/utils/pino.js';

export default class AbstractQueue {
	constructor (path, maxLength = -1) {
		this.path = path;
		this.queue = [];
		this.maxLength = maxLength;

		this.loadQueue();
	}

	async configExists () {
		try {
			await fs.promises.access(this.path, fs.constants.R_OK | fs.constants.W_OK);

			return true;
		}
		catch (error) {
			return false;
		}
	}

	async limitLength () {
		if (this.maxLength === -1) return;

		this.queue.length = Math.min(this.queue.length, this.maxLength);
	}

	async loadQueue () {
		if (!(await this.configExists())) {
			await this.saveQueue();
		}

		try {
			this.queue = JSON.parse(await fs.promises.readFile(this.path, 'utf-8'));
		}
		catch (error) {
			pino.error('Error in AbstractQueue.loadQueue');
			pino.error(error);
		}
	}

	async saveQueue () {
		this.limitLength();

		await fs.promises.writeFile(this.path, JSON.stringify(this.queue, null, 2));
	}

	async clear () {
		this.queue.length = 0;

		await this.saveQueue();

		return this.queue;
	}

	async get (index) {
		if (index < 0 || index >= this.queue.length) {
			pino.error('Error in AbstractQueue.get - Invalid index');
			pino.error(`Index: ${index}`);
			return false;
		}
		
		return this.queue[index];
	}

	async getAll () {
		return this.queue;
	}

	async add (elements) {
		elements = Array.isArray(elements) ? elements : [elements];

		this.queue.push(...elements);

		await this.saveQueue();

		return this.queue;
	}

	async addFirst (elements) {
		elements = Array.isArray(elements) ? elements : [elements];

		this.queue.unshift(...elements);

		await this.saveQueue();

		return this.queue;
	}

	async remove (index) {
		if (index < 0 || index >= this.queue.length) {
			pino.error('Error in AbstractQueue.remove - Invalid index');
			pino.error(`Index: ${index}`);
			return false;
		}

		this.queue.splice(index, 1);

		await this.saveQueue();

		return this.queue;
	}

	async move (index, newIndex) {
		if (!this.queue.length) {
			return 'No items in the queue';
		}

		if (newIndex === 'start') newIndex = 0;
		else if(newIndex === 'end') newIndex = this.queue.length - 1;

		index = Math.min(Math.max(index, 0), this.queue.length - 1);
		newIndex = Math.min(Math.max(newIndex, 0), this.queue.length - 1);
		
		if (index === newIndex) {
			return 'index matches newIndex';
		}

		const item = this.queue.splice(index, 1)[0];

		this.queue.splice(newIndex, 0, item);

		await this.saveQueue();

		return this.queue;
	}

	async hasItems () {
		return this.queue.length > 0;
	}

	async getFirst () {
		if (!(await this.hasItems())) return false;

		return this.queue[0];
	}

	async advanceQueue () {
		if (!(await this.hasItems())) return false;

		this.queue.shift();

		await this.saveQueue();

		return this.queue[0];
	}
}