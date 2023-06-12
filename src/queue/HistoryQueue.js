import AbstractQueue from './AbstractQueue.js';

class HistoryQueue extends AbstractQueue {
	constructor () {
		super('./history.json', 10);
	}

	async addFirst (elements) {
		elements = Array.isArray(elements) ? elements : [elements];

		for(const video of elements) {
			video.played_at = new Date().toUTCString();
		}

		return super.addFirst(elements);
	}
}

export default new HistoryQueue();