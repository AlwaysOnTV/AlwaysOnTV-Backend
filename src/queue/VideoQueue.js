import logging from '~/utils/logging.js';
import AbstractQueue from './AbstractQueue.js';
import RandomPlaylistDatabase from '~/db/RandomPlaylistDatabase.js';
import Twitch from '~/utils/twitch.js';
import Config from '~/utils/config.js';
import HistoryQueue from '~/queue/HistoryQueue.js';

class VideoQueue extends AbstractQueue {
	constructor () {
		super('./queue.json');
	}

	async updateChannelInformation (video) {
		try {
			await Twitch.updateChannelInformation({ 
				title: video.title,
				game_id: video.game?.gameId || video.gameId,
			});
		}
		catch (error) {
			logging.error(error);
			throw error;
		}
	}

	async add (elements, skipUpdate = false) {
		let wasEmpty = false;
		if (!this.queue.length) {
			wasEmpty = true;
		}

		const results = await super.add(elements);

		if (wasEmpty && !skipUpdate) {
			const currentVideo = await this.getFirst();

			await this.updateChannelInformation(currentVideo);
		}

		return results;
	}
	
	async getRandomVideo () {
		return RandomPlaylistDatabase.getRandomVideo();
	}

	async getFirst () {
		const first = await super.getFirst();

		const { use_random_playlist } = await Config.getConfig();

		if (!first && use_random_playlist) {
			const randomVideo = await this.getRandomVideo();
			
			if (randomVideo) {
				await this.add(randomVideo);

				return randomVideo;
			}
		}

		return first;
	}

	async advanceQueue () {
		const currentVideo = await this.getFirst();

		if (currentVideo) {
			await HistoryQueue.addFirst(currentVideo);
		}

		const nextVideo = await super.advanceQueue();

		const { use_random_playlist } = await Config.getConfig();

		if (!nextVideo && use_random_playlist) {
			const randomVideo = await this.getRandomVideo();
			
			if (randomVideo) {
				await this.add(randomVideo);

				return randomVideo;
			}
		}

		if (nextVideo) {
			await this.updateChannelInformation(nextVideo);
		}

		return nextVideo;
	}
}

export default new VideoQueue();