import chalk from 'chalk';

class Logging {
	constructor () {
		this.originalConsole = { ...console };
		this.overrideConsoleMethods();
	}

	overrideConsoleMethods () {
		const logLevels = {
			log: chalk.dim,
			info: chalk.yellow,
			error: chalk.red,
			debug: chalk.blue,
		};

		for (const method in console) {
			if (typeof console[method] === 'function') {
				this[method] = (...args) => {
					const formatter = logLevels[method] || chalk.white;
					const stackTrace = this.getStackTrace();
					const formattedArgs = args.map(arg => {
						if (arg instanceof Error) {
							return formatter(this.formatError(arg, stackTrace));
						} else if (typeof arg === 'object') {
							return formatter(JSON.stringify(arg));
						}
						return formatter(arg);
					});
					this.originalConsole[method](...formattedArgs);
				};
			}
		}
	}

	formatError (error, stackTrace) {
		const formattedMessage = `[${error.name}: ${error.message}]`;
		const formattedProperties = Object.entries(error)
			.filter(([key]) => key !== 'name' && key !== 'message')
			.map(([key, value]) => `${key}: ${value}`)
			.join(', ');
		const formattedError = `${formattedMessage} { ${formattedProperties} }`;
		return `${stackTrace}\n${formattedError}`;
	}

	getStackTrace () {
		const stack = new Error().stack.split('\n');
		stack.splice(1, 2);
		return stack.join('\n');
	}

	restoreConsoleMethods () {
		Object.assign(console, this.originalConsole);
	}
}

export default new Logging();