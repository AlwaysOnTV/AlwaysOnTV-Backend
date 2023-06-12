import { Server } from 'socket.io';

export let io = false;

export default function setup (server) {
	io = new Server(server, {
		cors: true,
	});

	io.on('connection', (socket) => {
		socket.on('time_update', (msg) => {
			socket.broadcast.emit('time_update_dashboard', msg);
		});

		socket.on('set_video_time', value => {
			socket.broadcast.emit('set_video_time', value);
		});

		socket.on('skip_video', () => {
			socket.broadcast.emit('skip_video');
		});

		socket.on('refresh_video', () => {
			socket.broadcast.emit('refresh_video');
		});

		socket.on('update_playing_state', isPlaying => {
			socket.broadcast.emit('update_playing_state', isPlaying);
		});
	});
}