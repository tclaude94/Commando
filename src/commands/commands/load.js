const fs = require('fs');
const { oneLine } = require('common-tags');
const Command = require('../base');

module.exports = class LoadCommandCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'load',
			aliases: ['load-command'],
			group: 'admin',
			memberName: 'load',
			description: 'Charge une nouvelle commande.',
			details: oneLine`
				L'argument doit être le nom de la commande au format \`group:memberName\`.
				Seul le créateur du bot peut utiliser cette commande.
			`,
			examples: ['load some-command'],
			ownerOnly: true,
			guarded: true,

			args: [
				{
					key: 'command',
					prompt: 'Quelle commande veux-tu charger?',
					validate: val => new Promise(resolve => {
						if(!val) return resolve(false);
						const split = val.split(':');
						if(split.length !== 2) return resolve(false);
						if(this.client.registry.findCommands(val).length > 0) {
							return resolve('La commande est déjà enregistrée.');
						}
						const cmdPath = this.client.registry.resolveCommandPath(split[0], split[1]);
						fs.access(cmdPath, fs.constants.R_OK, err => err ? resolve(false) : resolve(true));
						return null;
					}),
					parse: val => {
						const split = val.split(':');
						const cmdPath = this.client.registry.resolveCommandPath(split[0], split[1]);
						delete require.cache[cmdPath];
						return require(cmdPath);
					}
				}
			]
		});
	}

	async run(msg, args) {
		this.client.registry.registerCommand(args.command);
		const command = this.client.registry.commands.last();

		if(this.client.shard) {
			try {
				await this.client.shard.broadcastEval(`
					if(this.shard.id !== ${this.client.shard.id}) {
						const cmdPath = this.registry.resolveCommandPath('${command.groupID}', '${command.name}');
						delete require.cache[cmdPath];
						this.registry.registerCommand(require(cmdPath));
					}
				`);
			} catch(err) {
				this.client.emit('warn', `Erreur lors de la réplication du chargement sur tous les shards`);
				this.client.emit('error', err);
				await msg.channel.send(`La commande \`${command.name}\` a été chargée, mais il y à eu une erreur lors de la réplication sur les shards.`);
				return null;
			}
		}

		await msg.channel.send(`La commande \`${command.name}\` a été chargée${this.client.shard ? ' sur tous les shards' : ''}.`);
		return null;
	}
};
