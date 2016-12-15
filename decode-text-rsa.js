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
В группе цифр чётно и не больше, чем длина N минус 1
Недостача сзади дополняется нулями
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

function decodeText(text,p){
	text = text.replace(/\n$/,'');
	p = 1*p;
	var parsed = text.split(';');
	var N = 1*parsed.splice(0,1)[0];
	var q = N/p;
	var phi = (p - 1) * (q - 1);
	var E = 1*parsed.splice(0,1)[0];
	var d = E.reverseInField(phi);
	var grouplen = (((''+N).length-1)/2).floor();

	// В массиве parsed осталась длиннющая строка - результат слепки чисел
	// Разрезаем её на куски длиной grouplen*2
	parsed = parsed[0];

	console.log(parsed);
	var numchunks = [];
	while (parsed.length) {
		numchunks.push(1*parsed.substr(0,grouplen*2));
		parsed = parsed.substr(grouplen*2);
	}
	console.log(numchunks);

	// Применяем обратное преобразование к числам-кускам
	for (var i = 0; i < numchunks.length; i++) {
		numchunks[i] = numchunks[i].powInField(N,d);
	}
	console.log(numchunks);

	var oldstr = numchunks.join('');
	numchunks = [];
	while (oldstr.length) {
		numchunks.push(1*oldstr.substr(0,2));
		oldstr = oldstr.substr(2);
	}
	console.log(numchunks);

	var decodedText = '';
	for (var i = 0; i < numchunks.length; i++) {
		if (numchunks[i] === 33) {
			decodedText += "Ё";
		} else {
			decodedText += String.fromCharCode('А'.charCodeAt(0) - 1 + numchunks[i]);
		}
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



