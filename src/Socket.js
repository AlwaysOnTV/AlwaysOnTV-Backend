import { Server } from 'socket.io';
import HistoryQueue from '~/queue/HistoryQueue.js';
import VideoQueue from '~/queue/VideoQueue.js';

export class Socket {
	static {
		this.io = false;

		this.current_video_time = 0;
	}

	static setup (server) {
		this.io = new Server(server, {
			cors: true,
		});

		io.on('connection', (socket) => {
			socket.on('playback_update', (msg) => {
				this.currentVideoTime = msg.time;

				socket.broadcast.emit('update_dashboard', msg);
			});

			socket.on('set_video_time', time => {
				this.currentVideoTime = time;

				socket.broadcast.emit('set_video_time', time);
			});

			socket.on('skip_video', () => {
				this.resetCurrentVideoTime();

				socket.broadcast.emit('skip_video');
			});

			socket.on('refresh_video', () => {
				socket.broadcast.emit('refresh_video');
			});

			socket.on('update_playing_state', isPlaying => {
				socket.broadcast.emit('update_playing_state', isPlaying);
			});

			socket.on('request_video_time', () => {
				socket.emit('request_video_time', this.currentVideoTime);
			});
		});
	}

	static get currentVideoTime () {
		return this.current_video_time;
	}

	static set currentVideoTime (time) {
		this.current_video_time = time;
	}

	static resetCurrentVideoTime () {
		this.current_video_time = 0;
	}

	static broadcastQueueHistoryUpdate () {
		io.emit('queue_history_update', {
			queue: VideoQueue.getData(),
			history: HistoryQueue.getData(),
		});
	}
}

export const io = Socket.io;