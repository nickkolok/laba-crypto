var common = require('./common.js');
var fs = require('fs');


function generateCodeDictionary(key){
	return common.generateDictionary(key.toUpperCase(),common.alphabet.toUpperCase());
}

function codeText(text,key){
	text = text.replace(/\n$/,'');
	var dictionary = generateCodeDictionary(key);
	var codedText='';
	for(var i = 0; i < text.length; i++){
		codedText += dictionary[text[i]];
	}
	return codedText;
}

console.log(
	codeText(
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
