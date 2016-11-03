var common = require('./common.js');
var fs = require('fs');

function prepareText(text){
	text = text.replace(/ё/gi,'Е');
	text = text.replace(new RegExp('[^'+common.alphabet+']','gi'),'');
	text = text.toUpperCase();
	return text;
}

console.log(
	prepareText(
		fs.readFileSync(
			process.argv[2],
			'utf-8'
		)
	)
);

module.exports.prepareText = prepareText;
