import ytdl from '@distube/ytdl-core';
import ytpl from '@distube/ytpl';
import ytcog from 'ytcog';

import { addFormatMeta } from '@distube/ytdl-core/lib/format-utils.js';

import ytDashManifestGenerator from '@freetube/yt-dash-manifest-generator';
import NodeCache from 'node-cache';
import Config from '~/utils/config.js';
import { DateTime, Duration } from 'luxon';

class YTDL {
	constructor () {
		this.info_cache = new NodeCache({
			stdTTL: 60 * 60 * 3, // 3 hours
		});

		this.stream_cache = new NodeCache({
			stdTTL: 60 * 60 * 3, // 3 hours
		});

		this.session = false;
	}

	async getVideoInfo (youtubeID, force = false) {
		if (this.info_cache.has(youtubeID) && !force)
			return this.info_cache.get(youtubeID);

		const info = await ytdl.getInfo(youtubeID);

		this.info_cache.set(youtubeID, info);

		return info;
	}

	async getPlaylistData (playlistID, withVideos = true) {
		return ytpl(playlistID, {
			limit: withVideos ? Infinity : 1,
		});
	}

	durationStringToSeconds (durationString) {
		const duration = DateTime.fromFormat(durationString, 'H:m:s');

		return Duration.fromObject({
			hours: duration.hour,
			minutes: duration.minute,
			seconds: duration.second,
		}).as('seconds');
	}

	async getPlaylist (playlistID, withVideos = true) {
		if (!playlistID || !ytpl.validateID(playlistID)) return false;

		const playlist = await this.getPlaylistData(playlistID, withVideos);

		return {
			id: playlist.id,
			title: playlist.title,
			videoCount: playlist.total_items,
			thumbnail_url: playlist.thumbnail.url,
			videos: withVideos ? playlist.items.map(video => {
				return {
					id: video.id,
					title: video.title,
					thumbnail_url: video.thumbnail,
					length: this.durationStringToSeconds(video.duration),
				};
			}) : [],
		};
	}

	mergeFormats (video) {
		const audioFormats = [];
		const videoFormats = [];

		for (const format of video.formats) {
			const metaFormat = addFormatMeta(format);

			for (const audioFormat of video.audioStreams) {
				if (metaFormat.bitrate !== audioFormat.bitrate) continue;

				audioFormats.push({
					...metaFormat,
					...audioFormat,
				});

				break;
			}

			for (const videoFormat of video.videoStreams) {
				if (metaFormat.bitrate !== videoFormat.bitrate) continue;

				videoFormats.push({
					...metaFormat,
					...videoFormat,
				});

				break;
			}
		}

		return {
			audioFormats,
			videoFormats,
		};
	}

	async getVideoAndAudioStreams (youtubeID, force = false) {
		if (this.stream_cache.has(youtubeID) && !force)
			return this.stream_cache.get(youtubeID);

		const session = new ytcog.Session();
		await session.fetch();

		const video = new ytcog.Video(session, { id: youtubeID });
		await video.fetch();

		if (!video.formats.length) {
			return {
				error: 'possibly_age_restricted',
			};
		}

		const cache_data = {
			...this.mergeFormats(video),
			duration: video.duration,
		};

		this.stream_cache.set(youtubeID, cache_data);

		return cache_data;
	}

	async getBestVideoAndAudio (youtubeID, videoQuality = 1080) {
		const { error, audioFormats, videoFormats, duration } = await this.getVideoAndAudioStreams(youtubeID);
		if (error) {
			throw error;
		}

		const bestVideo = ytdl.chooseFormat(videoFormats, {
			quality: 'highest',
			filter: format => {
				if (!format.hasVideo) return false;
				if (format.hasAudio) return false;
				if (!format.initRange || !format.indexRange) return false;
				if (format.height > videoQuality) return false;

				return true;
			},
		});

		const bestAudio = ytdl.chooseFormat(audioFormats, {
			quality: 'highest',
			filter: 'audioonly',
		});

		return {
			video: bestVideo,
			audio: bestAudio,
			duration,
		};
	}

	async getDashMPD (youtubeID, videoQuality = 1080) {
		const { video, audio, duration } = await this.getBestVideoAndAudio(youtubeID, videoQuality);

		const api_url = (await Config.getConfig()).server.api_url;

		video.url = `${api_url}/youtube/${youtubeID}/video?videoQuality=${videoQuality}`;
		audio.url = `${api_url}/youtube/${youtubeID}/audio?videoQuality=${videoQuality}`;

		return ytDashManifestGenerator.generate_dash_file_from_formats([video, audio], duration);
	}
}

export default new YTDL();