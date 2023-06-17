import { Server } from 'socket.io';

class SocketData {
	constructor () {
		this.current_video_time = 0;
	}

	getCurrentVideoTime () {
		return this.current_video_time;
	}

	setCurrentVideoTime (time) {
		this.current_video_time = time;
	}

	resetCurrentVideoTime () {
		this.current_video_time = 0;
	}
}

const socketData = new SocketData();

export let io = false;

export default function setup (server) {
	io = new Server(server, {
		cors: true,
	});

	io.on('connection', (socket) => {
		socket.on('playback_update', (msg) => {
			socketData.setCurrentVideoTime(msg.time);
			socket.broadcast.emit('update_dashboard', msg);
		});

		socket.on('set_video_time', time => {
			socketData.setCurrentVideoTime(time);
			socket.broadcast.emit('set_video_time', time);
		});

		socket.on('skip_video', () => {
			socketData.resetCurrentVideoTime();
			socket.broadcast.emit('skip_video');
		});

		socket.on('refresh_video', () => {
			socket.broadcast.emit('refresh_video');
		});

		socket.on('update_playing_state', isPlaying => {
			socket.broadcast.emit('update_playing_state', isPlaying);
		});

		socket.on('request_video_time', () => {
			io.emit('request_video_time', socketData.getCurrentVideoTime());
		});

		// TODO: Queue video, or update anything for the queue or history => socket event
	});
}