const { oneLine } = require('common-tags');
const Command = require('../base');

module.exports = class EnableCommandCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'enable',
			aliases: ['enable-command', 'cmd-on', 'command-on'],
			group: 'admin',
			memberName: 'enable',
			description: 'Active une commande ou un groupe de commandes.',
			details: oneLine`
				L'argument doit être le nom/ID de la commande ou d'un groupe de commandes.
				Seuls les administrateurs peuvent exécuter cette commande.
			`,
			examples: ['enable divers', 'enable prefix'],
			guarded: true,

			args: [
				{
					key: 'cmdOrGrp',
					label: 'commande/groupe',
					prompt: 'Quelle commande ou quel groupe de commandes voulez-vous activer?',
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
		const group = args.cmdOrGrp.group;
		if(args.cmdOrGrp.isEnabledIn(msg.guild, true)) {
			return msg.channel.send(
				`${args.cmdOrGrp.group ? 'La commande' : 'Le groupe'} \`${args.cmdOrGrp.name}\` est déjà activé${group ? 'e' : ''}${
					group && !group.isEnabledIn(msg.guild) ?
					`, mais le groupe \`${group.name}\` est désactivé, donc la commande reste désactivée.` :
					''
				}.`
			);
		}
		args.cmdOrGrp.setEnabledIn(msg.guild, true);
		return msg.channel.send(
			`${group ? 'La commande' : 'Le groupe'} \`${args.cmdOrGrp.name}\` a été activé${group ? 'e' : ''}${
				group && !group.isEnabledIn(msg.guild) ?
				`, mais le groupe \`${group.name}\` est désactivé, donc la commande reste désactivée.` :
				''
			}.`
		);
	}
};
