const ArgumentType = require('./base');

class StringArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'string');
	}

	validate(val, msg, arg) {
		if(arg.oneOf && !arg.oneOf.includes(val.toLowerCase())) {
			return `Entrez une des options suivantes: ${arg.oneOf.map(opt => `\`${opt}\``).join(', ')}`;
		}
		if(arg.min !== null && typeof arg.min !== 'undefined' && val.length < arg.min) {
			return `Le nombre de caractères de l'argument ${arg.label} doit être supérieur ou égal à ${arg.min} caractères.`;
		}
		if(arg.max !== null && typeof arg.max !== 'undefined' && val.length > arg.max) {
			return `Le nombre de caractères de l'argument ${arg.label} doit être inférieur ou égal à ${arg.max} caractères.`;
		}
		return true;
	}

	parse(val) {
		return val;
	}
}

module.exports = StringArgumentType;
