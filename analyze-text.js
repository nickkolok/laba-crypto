var common = require('./common.js');
var fs = require('fs');

function analyzeText(text){
	text = text.replace(/\n$/,'');
	console.log('Всего символов в тексте: '+text.length);

	var sortedText = text.split('').sort().join('');
	var symbols = {};
	for(var i = 0; i < sortedText.length; i++){
		symbols.safeinc(sortedText[i]);
	}
	console.log('Таблица частотности:');
	var Ic = 0;
	var power = 0;
	for(var symbol in symbols) {
		console.log('"'+symbol+'" : '+(symbols[symbol]/text.length).toFixed(5));
		Ic+=symbols[symbol]*(symbols[symbol]-1);
		power++;
	}
	console.log('Мощность алфавита: '+power);
	console.log('Индекс совпадения: '+(Ic/text.length/(text.length-1)).toFixed(6));

}

analyzeText(
	fs.readFileSync(
		process.argv[2],
		'utf-8'
	)
);
