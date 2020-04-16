const { stripIndents, oneLine } = require('common-tags');
const Command = require('../base');
const { disambiguation } = require('../../util');

module.exports = class HelpCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'help',
			group: 'util',
			memberName: 'help',
			aliases: ['commandes', 'aide'],
			description: 'Affiche la liste de toutes les commandes ou les infos spécifiques sur une commande donnée.',
			details: oneLine`
				La commande donnée doit être une partie ou le nom complet de la commande.
				Si aucune commande n'est spécifiée, elles seront toutes retournées.
			`,
			examples: ['help', 'help prefix', 'aide'],
			guarded: true,

			args: [
				{
					key: 'command',
					prompt: 'Pour quelle commande voulez-vous des informations?',
					type: 'string',
					default: ''
				}
			]
		});
	}

	async run(msg, args) { // eslint-disable-line complexity
		const groups = this.client.registry.groups;
		const commands = this.client.registry.findCommands(args.command, false, msg);
		const showAll = args.command && args.command.toLowerCase() === 'all';
		if(args.command && !showAll) {
			if(commands.length === 1) {
				let help = stripIndents`
					${oneLine`
						__Commande **${commands[0].name}**:__ ${commands[0].description}
						${commands[0].guildOnly ? ' (indisponible en MP)' : ''}
						${commands[0].nsfw ? ' (NSFW)' : ''}
					`}

					**Format:** ${msg.anyUsage(`${commands[0].name}${commands[0].format ? ` ${commands[0].format}` : ''}`)}
				`;
				if(commands[0].aliases.length > 0) help += `\n**Alias:** ${commands[0].aliases.join(', ')}`;
				help += `\n${oneLine`
					**Groupe:** ${commands[0].group.name}
					(\`${commands[0].groupID}:${commands[0].memberName}\`)
				`}`;
				if(commands[0].details) help += `\n**Détails:** ${commands[0].details}`;
				if(commands[0].examples) help += `\n**Exemples:**\n${commands[0].examples.join('\n')}`;

				const messages = [];
				try {
					messages.push(await msg.direct(help));
					if(msg.channel.type !== 'dm') messages.push(await msg.reply(`Je t'ai envoyé les informations par MP !`));
				} catch(err) {
					messages.push(await msg.reply(`Impossible de t'envoyer les informations par MP, tu as dû les désactiver.`));
				}
				return messages;
			} else if(commands.length > 15) {
				return msg.reply('Plusieurs commandes ont été trouvées, il faut affiner ton choix.');
			} else if(commands.length > 1) {
				return msg.reply(disambiguation(commands, 'commandes'));
			} else {
				return msg.reply(
					`Impossible d'identifier la commande. Utilise ${msg.usage(
						null, msg.channel.type === 'dm' ? null : undefined, msg.channel.type === 'dm' ? null : undefined
					)} pour voir la liste de toutes les commandes.`
				);
			}
		} else {
			const messages = [];
			try {
				messages.push(await msg.direct(stripIndents`
					${oneLine`
						Pour utiliser une commande dans ${msg.guild ? msg.guild.name : `n'importe quel serveur`},
						utilise ${Command.usage('commande', msg.guild ? msg.guild.commandPrefix : null, this.client.user)}.
						Par exemple, ${Command.usage('prefix', msg.guild ? msg.guild.commandPrefix : null, this.client.user)}.
					`}
					Pour utiliser une commande dans ce DM, utilise simplement la ${Command.usage('commande', null, null)} sans préfixe.

					Utilise ${this.usage('<commande>', null, null)} pour voir toutes les infos sur cette commande.
					Utilise ${this.usage('all', null, null)} pour voir la liste de toutes les commandes.

					__**${showAll ? 'Toutes les commandes' : `Commandes disponibles dans ${msg.guild || 'ce MP'}`}**__

					${groups.filter(grp => grp.commands.some(cmd => !cmd.hidden && (showAll || cmd.isUsable(msg))))
						.map(grp => stripIndents`
							__${grp.name}__
							${grp.commands.filter(cmd => !cmd.hidden && (showAll || cmd.isUsable(msg)))
								.map(cmd => `**${cmd.name}:** ${cmd.description}${cmd.nsfw ? ' (NSFW)' : ''}`).join('\n')
							}
						`).join('\n\n')
					}
				`, { split: true }));
				if(msg.channel.type !== 'dm') messages.push(await msg.reply(`Je t'ai envoyé les informations par MP !`));
			} catch(err) {
				messages.push(await msg.reply(`Impossible de t'envoyer les informations par MP, tu as dû les désactiver.`));
			}
			return messages;
		}
	}
};
