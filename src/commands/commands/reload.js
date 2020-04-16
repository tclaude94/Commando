const { oneLine } = require('common-tags');
const Command = require('../base');

module.exports = class ReloadCommandCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'reload',
			aliases: ['reload-command'],
			group: 'admin',
			memberName: 'reload',
			description: 'Recharge une commande ou un groupe de commandes.',
			details: oneLine`
				L'argument doit être le nom/ID de la commande ou d'un groupe de commandes.
				Seuls les administrateurs peuvent exécuter cette commande.
			`,
			examples: ['reload some-command'],
			ownerOnly: true,
			guarded: true,

			args: [
				{
					key: 'cmdOrGrp',
					label: 'commande/groupe',
					prompt: 'Quelle commande ou quel groupe de commandes voulez-vous recharger?',
					type: 'group|command'
				}
			]
		});
	}

	async run(msg, args) {
		const { cmdOrGrp } = args;
		const isCmd = Boolean(cmdOrGrp.groupID);
		cmdOrGrp.reload();

		if(this.client.shard) {
			try {
				await this.client.shard.broadcastEval(`
					if(this.shard.id !== ${this.client.shard.id}) {
						this.registry.${isCmd ? 'commands' : 'groups'}.get('${isCmd ? cmdOrGrp.name : cmdOrGrp.id}').reload();
					}
				`);
			} catch(err) {
				this.client.emit('warn', `Erreur lors de la réplication du rechargement sur tous les shards`);
				this.client.emit('error', err);
				if(isCmd) {
					await msg.channel.send(`La commande \`${cmdOrGrp.name}\` a été rechargée, mais il y à eu une erreur lors de la réplication sur les shards.`);
				} else {
					await msg.channel.send(
						`Toutes les commandes du groupe \`${cmdOrGrp.name}\` ont été rechargées, mais il y à eu une erreur lors de la réplication sur les shards.`
					);
				}
				return null;
			}
		}

		if(isCmd) {
			await msg.channel.send(`La commande \`${command.name}\` a été chargée${this.client.shard ? ' sur tous les shards' : ''}.`);
		} else {
			await msg.channel.send(
				`Toutes les commandes du groupe \`${cmdOrGrp.name}\` ont été rechargées ${this.client.shard ? ' sur tous les shards' : ''}.`
			);
		}
		return null;
	}
};
