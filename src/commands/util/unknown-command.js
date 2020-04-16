const Command = require('../base');

module.exports = class UnknownCommandCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'commande-inconnue',
			group: 'util',
			memberName: 'commande-inconnue',
			description: 'Affiche une information quand une commande inconnue a été entrée.',
			examples: ['commande-inconnue kickeverybodyever'],
			unknown: true,
			hidden: true
		});
	}

	run(msg) {
		return msg.channel.send(
			`Commande inconnue. Utilise ${msg.anyUsage(
				'help',
				msg.guild ? undefined : null,
				msg.guild ? undefined : null
			)} pour voir la liste des commandes disponibles.`
		);
	}
};
