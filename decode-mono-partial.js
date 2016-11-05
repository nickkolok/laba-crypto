var common = require('./common.js');
var fs = require('fs');




function decodeMonoPartial(text,partkey){
	text = text.replace(/\n$/,'').toLowerCase();
	var codedText='';
	for(var i = 0; i < text.length; i++){
		codedText += (partkey[text[i]] || text[i]);
	}
	return codedText;
}

console.log(
	decodeMonoPartial(
		fs.readFileSync(
			process.argv[2],
			'utf-8'
		),
		JSON.parse(process.argv[3])
	)
);
