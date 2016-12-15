var common = require('./common.js');
global.document = {};
global.CanvasRenderingContext2D = {};
CanvasRenderingContext2D.prototype = {};
require('./ext/chas-lib.js');
var fs = require('fs');

/*
Методика шифрования:
Буквы заменяются порядковыми номерами от 1 до 33 (от А до я , 33 = Ё)
Полученные числа объединяются в группы так, чтобы группа заведомо не превышала N:
в группе цифр чётно и не больше, чем длина N минус 1
Недостача сзади добивается нулями
И затем выполняем возведение в степень по модулю
*/

function textToNumArray(text) {
	var arr = [];
	for (var i = 0; i < text.length; i++) {
		if (text[i] === "Ё") {
			arr.push(33);
		} else {
			arr.push(text.charCodeAt(i) - "А".charCodeAt(0) + 1);
		}
	}
	return arr;
}

function codeText(text,p){
	text = text.replace(/\n$/,'');
	p = 1*p;
	var q = //sl(p + 1, 2 * p).nextPrime();
	1873363/p;
	var N = //p * q;
	1873363;

	var phi = (p - 1) * (q - 1);

//	for (var E = phi; E.nod(phi) != 1; E = sl(1000, 3000)) {
//	}
	var E = 1427;

	var grouplen = (((''+N).length-1)/2).floor();


	var arr = textToNumArray(text);
	while (arr.length % grouplen) {
		arr.push(0);
	}

	var numchunks = [];
	console.log(arr);
	var codedText = ''+N+';'+E+';';
	var symbols = arr.length / grouplen;
	for (var i = 0; i < symbols; i++) {
		var nextNum = '';
		for (var j = 0; j < grouplen; j++) {
			nextNum += (''+arr[i*grouplen+j]).dopdo(0,2);
		}
		nextNum = 1*nextNum;
		numchunks.push(nextNum);
		codedText += (''+nextNum.powInField(phi,E)).dopdo(0,(''+phi).length) ;//+ ";";
	}
	console.log(numchunks);
	return codedText;
}


console.log(
	codeText(
		fs.readFileSync(
			process.argv[2],
			'utf-8'
		)
		,
		process.argv[3]
	)
);



