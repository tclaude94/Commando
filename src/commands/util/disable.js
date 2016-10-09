const oneLine = require('common-tags').oneLine;
const Command = require('../../command');
const CommandFormatError = require('../../errors/command-format');
const disambiguation = require('../../util').disambiguation;

module.exports = class DisableCommandCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'disable',
			aliases: ['disable-command', 'cmd-off', 'command-off'],
			group: 'util',
			memberName: 'disable',
			description: 'Disables a command or command group.',
			usage: '<command|group>',
			details: oneLine`
				The argument must be the name/ID (partial or whole) of a command or command group.
				Only administrators may use this command.
			`,
			examples: ['disable util', 'disable Utility', 'disable prefix'],
			guildOnly: true,
			guarded: true
		});
	}

	hasPermission(msg) {
		return msg.member.hasPermission('ADMINISTRATOR');
	}

	async run(msg, arg) {
		if(!arg) throw new CommandFormatError(this, msg.guild);
		const groups = this.client.registry.findGroups(arg);
		if(groups.length === 1) {
			if(groups[0].guarded) return msg.reply(`You cannot disable the ${groups[0].name} group.`);
			if(!groups[0].isEnabledIn(msg.guild)) return msg.reply(`The ${groups[0].name} group is already disabled.`);
			groups[0].setEnabledIn(msg.guild, false);
			return msg.reply(`Disabled ${groups[0].name} group.`);
		} else if(groups.length > 0) {
			return msg.reply(disambiguation(groups, 'groups'));
		} else {
			const commands = this.client.registry.findCommands(arg);
			if(commands.length === 1) {
				if(commands[0].guarded) return msg.reply(`You cannot disable the \`${commands[0].name}\` command.`);
				if(!commands[0].isEnabledIn(msg.guild)) {
					return msg.reply(`The \`${commands[0].name}\` command is already disabled.`);
				}
				commands[0].setEnabledIn(msg.guild, false);
				return msg.reply(`Disabled \`${commands[0].name}\` command.`);
			} else if(commands.length > 1) {
				return msg.reply(`No groups found. ${disambiguation(commands, 'commands')}`);
			} else {
				return msg.reply(oneLine`
					Unable to identify command or group.
					Use ${msg.guild.commandUsage('groups', msg.guild)} to view the list of groups.
				`);
			}
		}
	}
};
