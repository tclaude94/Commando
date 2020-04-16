const { oneLine } = require('common-tags');
const Command = require('../base');

module.exports = class UnloadCommandCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'unload',
			aliases: ['unload-command'],
			group: 'commands',
			memberName: 'unload',
			description: 'Décharge une commande.',
			details: oneLine`
				L'argument doit être le nom/ID de la commande.
				Seul le créateur du bot peut utiliser cette commande.
			`,
			examples: ['unload some-command'],
			ownerOnly: true,
			guarded: true,

			args: [
				{
					key: 'command',
					prompt: 'Quelle commande voulez-vous décharger?',
					type: 'command'
				}
			]
		});
	}

	async run(msg, args) {
		args.command.unload();

		if(this.client.shard) {
			try {
				await this.client.shard.broadcastEval(`
					if(this.shard.id !== ${this.client.shard.id}) this.registry.commands.get('${args.command.name}').unload();
				`);
			} catch(err) {
				this.client.emit('warn', `Erreur lors de la réplication du déchargement sur tous les shards`);
				this.client.emit('error', err);
				await msg.channel.send(`La commande \`${cmdOrGrp.name}\` a été déchargée, mais il y à eu une erreur lors de la réplication sur les shards.`);
				return null;
			}
		}

		await msg.channel.send(`La commande \`${command.name}\` a été déchargée${this.client.shard ? ' sur tous les shards' : ''}.`);
		return null;
	}
};
