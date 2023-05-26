import Grant from 'grant-koa';

const grant = Grant({
	defaults: {
		protocol: 'http',
		host: 'localhost:8085',
		path: '/auth',
		callback: '/auth/callback',
		transport: 'session',
		state: true,
	},
	twitch: {
		key: '', // client-id
		secret: '', // client-secret
		scope: ['user_read', 'channel:manage:broadcast'], // Add any additional scopes you need
	},
});

export function setTwitchClientAndSecret (client_id, client_secret) {
	grant.config.twitch.key = client_id;
	grant.config.twitch.secret = client_secret;
}

export default grant;