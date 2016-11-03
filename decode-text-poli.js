var common = require('./common.js');
var fs = require('fs');


function minus(ch1, ch2){
	var shift = 'А'.charCodeAt(0);
	var int1 = ch1.charCodeAt(0) - shift;
	var int2 = ch2.charCodeAt(0) - shift;
	return String.fromCharCode((int1 - int2 + 64) % 32 + shift);
}


function codeText(text,key){
	text = text.replace(/\n$/,'');
	key  = key .replace(/\n$/,'');
	var codedText='';
	for(var i = 0; i < text.length; i++){
		codedText += minus(text[i],key[i%key.length]);
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

