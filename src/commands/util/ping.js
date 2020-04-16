const { oneLine } = require('common-tags');
const Command = require('../base');

module.exports = class PingCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'ping',
			group: 'util',
			memberName: 'ping',
			description: 'Check le ping du Bot vers le serveur Discord.',
			throttling: {
				usages: 5,
				duration: 10
			}
		});
	}

	async run(msg) {
		const pingMsg = await msg.channel.send('Ping...');
		return pingMsg.edit(oneLine`
			${msg.channel.type !== 'dm' ? `${msg.author},` : ''}
			Pong! Le message a pris ${
				(pingMsg.editedTimestamp || pingMsg.createdTimestamp) - (msg.editedTimestamp || msg.createdTimestamp)
			}ms.
			${this.client.ws.ping ? `La requête au serveur Discord a pris ${Math.round(this.client.ws.ping)}ms.` : ''}
		`);
	}
};
