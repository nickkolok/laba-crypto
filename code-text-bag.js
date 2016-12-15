var common = require('./common.js');
global.document = {};
global.CanvasRenderingContext2D = {};
CanvasRenderingContext2D.prototype = {};
require('./ext/chas-lib.js');
var fs = require('fs');


function makePseudobitArray(str) {
	var arr = [];
	for (var i = 0; i < str.length; i++) {
		var code = (str.charCodeAt(i)-"А".charCodeAt(0)) & 31;
		for (var j = 0; j < 5; j++) {
			arr.push((code >> j) & 1);
		}
	}
	return arr;
}

function translateSeq(seq,E,N) {
	for (var i = 0; i < seq.length; i++) {
		seq[i] = seq[i]*E%N;
	}
}

function codeText(text,N){
	text = text.replace(/\n$/,'');

	var slen = 16;
	var seq = generateSuperincSequence(slen,sl(1,7));
	N = 1*N;
	var E = sl(1024, N-1);

	console.log(seq,N,E);
	var arr = makePseudobitArray(text)


	while (arr.length % slen) {
		arr.push(0);
	}

	console.log(arr.join(''));

	var codedText = '';
	var symbols = arr.length / slen;
	for (var i = 0; i < symbols; i++) {
		var nextNum = 0;
		for (var j = 0; j < slen; j++) {
			nextNum += arr[i*slen+j]*seq[j];
		}
		codedText += nextNum + ";";
	}
	translateSeq(seq,E,N);
	var codedText = ''+E+';'+seq.join(';')+';'+codedText;
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



