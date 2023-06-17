import AbstractQueue from './AbstractQueue.js';
import RandomPlaylistDatabase from '~/db/RandomPlaylistDatabase.js';
import Twitch from '~/utils/twitch.js';
import Config from '~/utils/config.js';
import HistoryQueue from '~/queue/HistoryQueue.js';
import ytdl from '~/utils/ytdl.js';
import { io } from '~/socket.js';
import pino from '~/utils/pino.js';
import VideoDatabase from '~/db/VideoDatabase.js';

class VideoQueue extends AbstractQueue {
	constructor () {
		super('./queue.json');
	}

	getDefaultData () {
		return {
			current_video: {},
			items: [],
		};
	}

	async updateChannelInformation (video) {
		try {
			await Twitch.updateChannelInformation({ 
				title: video.title,
				game_id: video.game?.id || video.gameId,
			});
		}
		catch (error) {
			pino.error('Error in VideoQueue.updateChannelInformation');
			pino.error(error);
		}
	}

	getCurrentVideo () {
		return this.db.data.current_video;
	}
	
	hasCurrentVideo () {
		return !!this.getCurrentVideo().id;
	}

	async updateCurrentVideo (video) {
		this.db.data.current_video = video;

		await this.db.write();

		await HistoryQueue.addFirst(video);

		await this.updateChannelInformation(video);
	}

	async add (elements, skipUpdate = false) {
		const wasEmpty = !this.hasItems();

		await super.add(elements);

		if (!this.hasCurrentVideo() && wasEmpty && !skipUpdate) {
			const currentVideo = await this.getAndAdvance();

			await this.updateCurrentVideo(currentVideo);
		}

		return this.db.data;
	}
	
	async getRandomVideo () {
		return RandomPlaylistDatabase.getRandomVideo();
	}

	// TODO: This can deadlock if only age-restricted videos are in the random playlist
	async advanceQueue () {
		let nextVideo = await super.getAndAdvance();

		const { use_random_playlist } = await Config.getConfig();

		if (!nextVideo && use_random_playlist) {
			const randomVideo = await this.getRandomVideo();
			
			if (randomVideo) {
				nextVideo = randomVideo;
			}
		}

		if (!(await this.isVideoValid(nextVideo))) {
			return this.advanceQueue();
		}

		// v1.1.0 update patch, will be removed in a newer version. Maybe v1.2.0
		nextVideo.length = await VideoDatabase.updateVideoLength(nextVideo.id);

		await this.updateCurrentVideo(nextVideo);

		io.emit('next_video');

		return nextVideo;
	}

	async isVideoValid (video) {
		const info = await ytdl.getVideoInfo(video.id);
		
		if (info?.videoDetails?.age_restricted) return false;

		return true;
	}
}

export default new VideoQueue();