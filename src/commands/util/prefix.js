const { stripIndents, oneLine } = require('common-tags');
const Command = require('../base');

module.exports = class PrefixCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'prefix',
			group: 'admin',
			memberName: 'prefix',
			description: 'Affiche ou change le préfixe.',
			format: '[prefix/"default"/"none"]',
			details: oneLine`
				Si aucun préfixe n'est donné, le préfixe actuel est affiché.
				Si le préfixe est "default", le préfixe sera remis par défaut.
				Si le préfixe est "none", le préfixe sera retiré et seules les mentions seront possibles pour utiliser les commandes.
				Seuls les administrateurs peuvent modifier le préfixe.
			`,
			examples: ['prefix', 'prefix -', 'prefix omg!', 'prefix default', 'prefix none'],

			args: [
				{
					key: 'prefix',
					prompt: 'Quel préfixe voulez-vous utiliser?',
					type: 'string',
					max: 15,
					default: ''
				}
			]
		});
	}

	async run(msg, args) {
		// Just output the prefix
		if(!args.prefix) {
			const prefix = msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix;
			return msg.channel.send(stripIndents`
				${prefix ? `Le préfixe actuel est \`\`${prefix}\`\`.` : `Aucun préfixé n'est attribué.`}
				Pour utiliser les commandes, utilisez ${msg.anyUsage('commande')}.
			`);
		}

		// Check the user's permission before changing anything
		if(msg.guild) {
			if(!msg.member.hasPermission('ADMINISTRATOR') && !this.client.isOwner(msg.author)) {
				return msg.channel.send('Seuls les administrateurs peuvent modifier le préfixe.');
			}
		} else if(!this.client.isOwner(msg.author)) {
			return msg.channel.send('Seul le gérant de bot peut modifier le préfixe global.');
		}

		// Save the prefix
		const lowercase = args.prefix.toLowerCase();
		const prefix = lowercase === 'none' ? '' : args.prefix;
		let response;
		if(lowercase === 'default') {
			if(msg.guild) msg.guild.commandPrefix = null; else this.client.commandPrefix = null;
			const current = this.client.commandPrefix ? `\`\`${this.client.commandPrefix}\`\`` : 'aucun préfixe';
			response = `Remise par défaut du préfixe (actuellement ${current}).`;
		} else {
			if(msg.guild) msg.guild.commandPrefix = prefix; else this.client.commandPrefix = prefix;
			response = prefix ? `Modification du préfixe en \`\`${args.prefix}\`\`.` : 'Le préfixe a été supprimé.';
		}

		await msg.channel.send(`${response} Pour utiliser les commandes, utilisez ${msg.anyUsage('commande')}.`);
		return null;
	}
};
