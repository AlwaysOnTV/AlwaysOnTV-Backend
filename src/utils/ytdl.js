import ytdl from 'ytdl-core';
import ytpl from 'ytpl';
import utils from '~/utils/index.js';
import Utils from '~/utils/index.js';
import logging from '~/utils/logging.js';

class YTDL {
	async getPlaylistData (playlistID) {
		return ytpl(playlistID, {
			limit: Infinity,
		});
	}

	async getPlaylist (playlistID, withVideos = true) {
		try {
			const playlist = await this.getPlaylistData(playlistID);

			return {
				id: playlist.id,
				title: playlist.title,
				videoCount: playlist.estimatedItemCount,
				thumbnail_url: playlist.bestThumbnail.url,
				videos: withVideos ? playlist.items.map(video => {
					return {
						id: video.id,
						title: video.title,
						thumbnail_url: video.bestThumbnail.url,
					};
				}) : [],
			};
		}
		catch (error) {
			logging.error(error);
			return error;
		}
	}

	async getVideoData (youtubeID) {
		return ytdl.getInfo(youtubeID);
	}

	// TODO: Can throw regular expression error https://github.com/fent/node-ytdl-core/issues/1227
	async getBestVideoAndAudio (youtubeID, info = undefined, attempts = 0) {
		if (attempts >= 5) return false;

		try {
			info = info || await ytdl.getInfo(youtubeID);
	
			const audioFormats = ytdl.filterFormats(info.formats, format => {
				if (!format.hasAudio) return false;
				if (format.hasVideo) return false;
				if (format.audioCodec !== 'opus') return false;
				if (!format.initRange || !format.indexRange) return false;
	
				return format.audioQuality === 'AUDIO_QUALITY_MEDIUM';
			});
			const audioFormat = audioFormats[0];
			if (audioFormat) {
				audioFormat.url = await Utils.proxy(audioFormat.url);
			}

			const videoFormats = ytdl.filterFormats(info.formats, format => {
				if (!format.hasVideo) return false;
				if (format.hasAudio) return false;
				if (format.container !== 'webm') return false;
				if (!format.initRange || !format.indexRange) return false;

				// 360 degree check, somehow not fully supported with AVMerge
				if (format.qualityLabel.endsWith('s')) return false;
				
				return true;
			});
			const videoFormat = videoFormats[0];
			if (videoFormat) {
				videoFormat.url = await Utils.proxy(videoFormat.url);
			}

			if (videoFormat && audioFormat) {
				return {
					video: videoFormat,
					audio: audioFormat,
				};
			}
	
			const combinedFormats = ytdl.filterFormats(info.formats, format => {
				if (!format.hasVideo || !format.hasAudio) return false;
				
				return true;
			});
			const combinedFormat = combinedFormats[0];

			return {
				combined: combinedFormat,
			};
		}
		catch (error) {
			logging.error(error);

			if (attempts++ < 5) {
				await utils.sleep(1000);

				return this.getBestVideoAndAudio(youtubeID, info, attempts);
			}

			return error;
		}
	}
}

export default new YTDL();