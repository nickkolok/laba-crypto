var common = require('./common.js');
global.document = {};
global.CanvasRenderingContext2D = {};
CanvasRenderingContext2D.prototype = {};
require('./ext/chas-lib.js');
var fs = require('fs');


function makePseudobitArray(codes,seq) {
	var arr = [];
	for (var i = codes.length - 1; i >= 0; i--) {
		codes[i] = 1 * codes[i];
		for (var j = seq.length - 1; j >=0 ; j--) {
			seq[j] = 1*seq[j];
			if (codes[i] >= seq[j]) {
				arr.push(1);
				codes[i] -= seq[j]
			} else {
				arr.push(0);
			}
		}
	}
	arr = arr.reverse();
	return arr;
}

function detranslateSeq(seq,E,N) {
	var d = E.reverseInField(N);
	for (var i = 0; i < seq.length; i++) {
		seq[i] = 1*seq[i]*d%N;
	}
}

function decodeText(text,N){
	text = text.replace(/\n$/,'');
	N = 1*N;

	var slen = 16;
	var parsed = text.split(';');
	var E = 1*parsed.splice(0,1)[0];

	var seq = parsed.splice(0,16);
	detranslateSeq(seq,E,N);
	console.log(seq,N,E);

	console.log(seq,N,E);
	console.log(parsed);
	var arr = makePseudobitArray(parsed,seq);

	while (arr.length % 5) {
		arr.pop();
	}


	console.log(arr.join(''));
	var decodedText = '';
	var symbols = arr.length / 5;
	for (var i = 0; i < symbols; i++) {
		var nextChar = 0;
		for (var j = 0; j < 5; j++) {
			nextChar += arr[i*5+j]<<j;
		}
		decodedText += String.fromCharCode(nextChar + 'А'.charCodeAt(0));
	}

	return decodedText;
}


console.log(
	decodeText(
		fs.readFileSync(
			process.argv[2],
			'utf-8'
		)
		,
		process.argv[3]
	)
);



