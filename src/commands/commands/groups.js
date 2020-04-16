const { stripIndents } = require('common-tags');
const Command = require('../base');

module.exports = class ListGroupsCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'groupes',
			aliases: ['list-groupes', 'show-groupes'],
			group: 'admin',
			memberName: 'groupes',
			description: 'Liste tous les groupes.',
			details: 'Seul les administrateurs peuvent utiliser cette commande.',
			guarded: true
		});
	}

	hasPermission(msg) {
		if(!msg.guild) return this.client.isOwner(msg.author);
		return msg.member.hasPermission('ADMINISTRATOR') || this.client.isOwner(msg.author);
	}

	run(msg) {
		return msg.channel.send(stripIndents`
			__**Groupes**__
			${this.client.registry.groups.map(grp =>
				`**${grp.name}:** ${grp.isEnabledIn(msg.guild) ? 'Activé' : 'Désactivé'}`
			).join('\n')}
		`);
	}
};
