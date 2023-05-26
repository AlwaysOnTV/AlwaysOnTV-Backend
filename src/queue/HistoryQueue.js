import AbstractQueue from './AbstractQueue.js';

class HistoryQueue extends AbstractQueue {
	constructor () {
		super('./history.json', 10);
	}
}

export default new HistoryQueue();