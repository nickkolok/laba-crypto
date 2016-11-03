var common = require('./common.js');
var fs = require('fs');


function generateDecodeDictionary(key){
	return common.generateDictionary(common.alphabet.toUpperCase(),key.toUpperCase());
}

function decodeText(text,key){
	text = text.replace(/\n$/,'');
	var dictionary = generateDecodeDictionary(key);
	var codedText='';
	for(var i = 0; i < text.length; i++){
		codedText += dictionary[text[i]];
	}
	return codedText;
}

console.log(
	decodeText(
		fs.readFileSync(
			process.argv[2],
			'utf-8'
		),
		fs.readFileSync(
			process.argv[3],
			'utf-8'
		)
	)
);
