require('./ext/Object_generic.js');
require('./ext/String_generic.js');
require('./ext/array.js');
require('./ext/string.js');
require('./ext/number_math.js');

var alphabet=module.exports.alphabet='йцукенгшщзхъфывапролджэячсмитьбю'.split('').sort().join('');

function generateDictionary(key,alphabet) {
	var dictionary = {};
	for(var i = key.length-1; i >=0; i--){
		dictionary[alphabet[i]] = key[i];
	}
	return dictionary;
}
module.exports.generateDictionary = generateDictionary;
