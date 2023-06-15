import fs from 'node:fs';
import pino from '~/utils/pino.js';

class Config {
	constructor () {
		this.path = './config.json';
		this.default = {
			password: 'AlwaysOnTV',
			server: {
				port: 8085,
				api_url: 'http://localhost:8085/api',
			},
			twitch: {
				enabled: false,
				title_replacement: '[24/7 AlwaysOnTV] {{videoTitle}}',

				client_id: '',
				client_secret: '',
				access_token: '',
				refresh_token: '',
				expires_at: 0,
				channel_id: '',
			},
			max_video_quality: 1080,
			use_random_playlist: true,
		};

		this.config = {
			...this.default,
		};
	}

	async init () {
		await this.getConfig();

		const { setTwitchClientAndSecret } = await import('~/grant.js');
		setTwitchClientAndSecret(
			this.config.twitch.client_id,
			this.config.twitch.client_secret,
		);
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

	async isClientIDAndSecretValid () {
		const { twitch } = await this.getConfig();
		const { client_id, client_secret } = twitch;

		return client_id !== '' && client_secret !== '';
	}

	async getConfig () {
		try {
			if (!(await this.configExists())) {
				await this.saveConfig();

				pino.info('Default configuration created. Please setup your Twitch connection on the Settings page.');
			}

			this.config = JSON.parse(await fs.promises.readFile(this.path, 'utf-8'));

			return this.config;
		}
		catch (error) {
			pino.error('Error in Config.getConfig');
			pino.error(error);
			return false;
		}
	}

	async saveConfig () {
		await fs.promises.writeFile(this.path, JSON.stringify(this.config, null, 2), 'utf-8');
	}

	getCachedConfig () {
		return this.config;
	}

	async getTwitchData () {
		const config = await this.getConfig();

		return config.twitch;
	}

	async isTwitchEnabled () {
		const { enabled } = await this.getTwitchData();

		return enabled;
	}

	async updateTwitchEnabled (twitch_enabled) {
		this.config.twitch.enabled = twitch_enabled ?? this.config.twitch.enabled;

		await this.saveConfig();
	}

	async updateTwitchClientOrSecret (client_id, client_secret) {
		this.config.twitch.client_id = client_id ?? this.config.twitch.client_id;
		this.config.twitch.client_secret = client_secret ?? this.config.twitch.client_secret;

		await this.saveConfig();

		const { setTwitchClientAndSecret } = await import('~/grant.js');
		setTwitchClientAndSecret(
			this.config.twitch.client_id,
			this.config.twitch.client_secret,
		);
	}

	async updateTitleReplacement (title_replacement) {
		this.config.twitch.title_replacement = title_replacement ?? this.config.twitch.title_replacement;

		await this.saveConfig();
	}

	async updateUseRandomPlaylist (use_random_playlist) {
		this.config.use_random_playlist = use_random_playlist ?? this.config.use_random_playlist;

		await this.saveConfig();
	}

	async updateMaxVideoQuality (max_video_quality) {
		this.config.max_video_quality = max_video_quality ?? this.config.max_video_quality;

		await this.saveConfig();
	}

	async updateTwitchData ({ access_token, refresh_token, expires_at }, twitch_data) {
		this.config.twitch.access_token = access_token ?? this.config.twitch.access_token;
		this.config.twitch.refresh_token = refresh_token ?? this.config.twitch.refresh_token;
		this.config.twitch.expires_at = expires_at ?? this.config.twitch.expires_at;
		this.config.twitch.data = twitch_data ?? this.config.twitch.data;
		
		await this.saveConfig();
	}
}

export default new Config();