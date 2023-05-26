import logging from '~/utils/logging.js';
import AbstractDatabase from './AbstractDatabase.js';
import PlaylistVideoDatabase from '~/db/PlaylistVideoDatabase.js';

class VideoDatabase extends AbstractDatabase {
	constructor () {
		super('videos');
	}

	async createTable () {
		super.createTable();

		if (await this.doesTableExist()) return;

		await this.knex.schema.createTable(this.table_name, table => {
			table.string('id').unique().notNullable().defaultTo(null).comment('YouTube Video ID');

			table.timestamp('created_at').notNullable().defaultTo(this.knex.fn.now()).comment('Video Creation Date');

			table.string('title').notNullable().defaultTo(null).comment('YouTube Video Title');
			table.string('gameId')
				.notNullable()
				.defaultTo(null)
				.references('id').inTable('games')
				.onUpdate('RESTRICT')
				.onDelete('RESTRICT')
				.comment('Game Reference');

			table.string('thumbnail_url').notNullable().defaultTo(null).comment('YouTube Thumbnail URL');
		});
	}

	async getAllVideos (orderBy = 'asc') {
		return this.getKnex()
			.select('videos.id', 'videos.created_at', 'videos.title', 'videos.thumbnail_url', 'games.id as gameId', 'games.title as gameTitle')
			.join('games', 'videos.gameId', 'games.id')
			.orderBy('videos.created_at', orderBy);
	}

	async getVideo (id) {
		if (!id) return false;

		const result = await this.getKnex()
			.select('videos.id', 'videos.title', 'videos.thumbnail_url', 'games.id as gameId', 'games.title as gameTitle')
			.join('games', 'videos.gameId', 'games.id')
			.where('videos.id', id)
			.first();
	
		if (result) {
			const { gameId, gameTitle, ...videoData } = result;
			const videoWithGame = {
				...videoData,
				game: { gameId, title: gameTitle },
			};
			return videoWithGame;
		} else {
			return false;
		}
	}

	async createVideo (data) {
		const { id } = data;

		if (!id || !data) return false;

		if (await super.getByID(id)) {
			return false;
		}

		await this.insert(data);

		return super.getByID(id);
	}

	async updateVideo (id, data) {
		if (!id || !data) return false;

		const video = await super.getByID(id);
		if (!video) {
			return false;
		}

		await this.update({
			id,
		}, data);

		return super.getByID(id);
	}

	async deleteVideo (id, force = false) {
		if (!id) return false;

		const video = await super.getByID(id);
		if (!video) {
			return false;
		}

		if (force) {
			try {
				let playlists = false;

				await this.knex.transaction(async trx => {					
					// Remove video from random playlist
					await trx('random_playlist')
						.where('videoId', id)
						.del();
					

					// Get all playlist IDs that have this video
					playlists = await trx('playlist_videos')
						.where('videoId', id)
						.distinct('playlistId')
						.select('playlistId');

					// Delete video from all playlists
					await trx('playlist_videos')
						.where('videoId', id)
						.del();
				});

				// Update playlist positions
				if (playlists) {
					for (const playlist of playlists) {
						await PlaylistVideoDatabase.fixPlaylistPositions(playlist.playlistId);
					}
				}
			}
			catch (error) {
				logging.error(error);
				return error;
			}
		}

		return this.delete({
			id,
		});
	}
}

export default new VideoDatabase();