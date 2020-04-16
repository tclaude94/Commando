const { oneLine } = require('common-tags');
const Command = require('../base');

module.exports = class DisableCommandCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'disable',
			aliases: ['disable-command', 'cmd-off', 'command-off'],
			group: 'admin',
			memberName: 'disable',
			description: 'Désactive une commande ou un groupe de commandes.',
			details: oneLine`
				L'argument doit être le nom/ID de la commande ou d'un groupe de commandes.
				Seuls les administrateurs peuvent exécuter cette commande.
			`,
			examples: ['disable divers', 'disable prefix'],
			guarded: true,

			args: [
				{
					key: 'cmdOrGrp',
					label: 'commande/groupe',
					prompt: 'Quelle commande ou quel groupe de commandes voulez-vous désactiver?',
					type: 'group|command'
				}
			]
		});
	}

	hasPermission(msg) {
		if(!msg.guild) return this.client.isOwner(msg.author);
		return msg.member.hasPermission('ADMINISTRATOR') || this.client.isOwner(msg.author);
	}

	run(msg, args) {
		if(!args.cmdOrGrp.isEnabledIn(msg.guild, true)) {
			return msg.channel.send(
				`${args.cmdOrGrp.group ? 'La commande' : 'Le groupe de commandes'} \`${args.cmdOrGrp.name}\` est déjà désactivé${group ? 'e' : ''}.`
			);
		}
		if(args.cmdOrGrp.guarded) {
			return msg.channel.send(
				`Tu ne peux pas désactiver \`${args.cmdOrGrp.name}\` ${args.cmdOrGrp.group ? 'cette commande' : 'ce groupe'}.`
			);
		}
		args.cmdOrGrp.setEnabledIn(msg.guild, false);
		return msg.channel.send(`${args.cmdOrGrp.group ? 'La commande' : 'Le groupe de commandes'} \`${args.cmdOrGrp.name}\` a été désactivé${group ? 'e' : ''}.`);
	}
};
