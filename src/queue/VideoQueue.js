import logging from '~/utils/logging.js';
import AbstractQueue from './AbstractQueue.js';
import RandomPlaylistDatabase from '~/db/RandomPlaylistDatabase.js';
import Twitch from '~/utils/twitch.js';
import Config from '~/utils/config.js';
import HistoryQueue from '~/queue/HistoryQueue.js';
import ytdl from '~/utils/ytdl.js';

class VideoQueue extends AbstractQueue {
	constructor () {
		super('./queue.json');
	}

	async updateChannelInformation (video) {
		try {
			await Twitch.updateChannelInformation({ 
				title: video.title,
				game_id: video.game?.id || video.gameId,
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

				return this.getFirst();
			}
		}

		if (!(await this.isVideoValid(first))) {
			return this.advanceQueue();
		}

		return first;
	}

	async advanceQueue () {
		const currentVideo = await super.getFirst();

		// TODO: Handle age-restricted videos better. Show an error in the dashboard maybe?
		// Add error code / message to the video if "isVideoValid" fails
		if (currentVideo) {
			await HistoryQueue.addFirst(currentVideo);
		}

		let nextVideo = await super.advanceQueue();

		const { use_random_playlist } = await Config.getConfig();

		if (!nextVideo && use_random_playlist) {
			const randomVideo = await this.getRandomVideo();
			
			if (randomVideo) {
				await this.add(randomVideo);

				nextVideo = randomVideo;
			}
		}

		if (!(await this.isVideoValid(nextVideo))) {
			return this.advanceQueue();
		}

		if (nextVideo) {
			await this.updateChannelInformation(nextVideo);
		}

		return nextVideo;
	}

	async isVideoValid (video) {
		const info = await ytdl.getVideoInfo(video.id);
		
		if (info?.videoDetails?.age_restricted) return false;

		return true;
	}
}

export default new VideoQueue();