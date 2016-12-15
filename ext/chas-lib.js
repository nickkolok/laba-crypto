'use strict';
/*
fraction.js
A Javascript fraction library.

Copyright (c) 2009  Erik Garrison <erik@hypervolu.me>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/


/* Fractions */
/* 
 *
 * Fraction objects are comprised of a numerator and a denomenator.  These
 * values can be accessed at fraction.numerator and fraction.denomenator.
 *
 * Fractions are always returned and stored in lowest-form normalized format.
 * This is accomplished via Fraction.normalize.
 *
 * The following mathematical operations on fractions are supported:
 *
 * Fraction.equals
 * Fraction.add
 * Fraction.subtract
 * Fraction.multiply
 * Fraction.divide
 *
 * These operations accept both numbers and fraction objects.  (Best results
 * are guaranteed when the input is a fraction object.)  They all return a new
 * Fraction object.
 *
 * Usage:
 *
 * TODO
 *
 */

/*
 * The Fraction constructor takes one of:
 *   an explicit numerator (integer) and denominator (integer),
 *   a string representation of the fraction (string),
 *   or a floating-point number (float)
 *
 * These initialization methods are provided for convenience.  Because of
 * rounding issues the best results will be given when the fraction is
 * constructed from an explicit integer numerator and denomenator, and not a
 * decimal number.
 *
 *
 * e.g. new Fraction(1, 2) --> 1/2
 *      new Fraction('1/2') --> 1/2
 *      new Fraction('2 3/4') --> 11/4  (prints as 2 3/4)
 *
 */
var Fraction = function(numerator, denominator)
{
    /* double argument invocation */
    if (typeof numerator !== 'undefined' && denominator) {
        if (typeof(numerator) === 'number' && typeof(denominator) === 'number') {
            this.numerator = numerator;
            this.denominator = denominator;
        } else if (typeof(numerator) === 'string' && typeof(denominator) === 'string') {
            // what are they?
            // hmm....
            // assume they are floats?
            this.numerator = parseFloat(numerator.replace(",","."));
            this.denominator = parseFloat(denominator.replace(",","."));
        }
    /* single-argument invocation */
    } else if (typeof denominator === 'undefined') {
        var num = numerator; // swap variable names for legibility
        if (typeof(num) === 'number') {  // just a straight number init
            this.numerator = num;
            this.denominator = 1;
        } else if (typeof(num) === 'string') {
            var a, b;  // hold the first and second part of the fraction, e.g. a = '1' and b = '2/3' in 1 2/3
                       // or a = '2/3' and b = undefined if we are just passed a single-part number
            var arr = num.split(' ');
            if (arr[0]) a = arr[0];
            if (arr[1]) b = arr[1];
            /* compound fraction e.g. 'A B/C' */
            //  if a is an integer ...
            if (a % 1 === 0 && b && b.match('/')) {
                return (new Fraction(a)).add(new Fraction(b));
            } else if (a && !b) {
                /* simple fraction e.g. 'A/B' */
                if (typeof(a) === 'string' && a.match('/')) {
                    // it's not a whole number... it's actually a fraction without a whole part written
                    var f = a.split('/');
                    this.numerator = f[0]; this.denominator = f[1];
                /* string floating point */
                } else if (typeof(a) === 'string' && a.match('\.')) {
                    return new Fraction(parseFloat(a));
                /* whole number e.g. 'A' */
                } else { // just passed a whole number as a string
                    this.numerator = parseInt(a);
                    this.denominator = 1;
                }
            } else {
                return undefined; // could not parse
            }
        }
    }
    this.normalize();
}


Fraction.prototype.clone = function()
{
    return new Fraction(this.numerator, this.denominator);
}

/* pretty-printer, converts fractions into whole numbers and fractions */
Fraction.prototype.toString = function()
{
	if (isNaN(this.denominator))
//	if (this.denominator !== this.denominator) //They say it would be faster. (?)
		return 'NaN';
    var result = '';
    if ((this.numerator < 0) != (this.denominator < 0))
        result = '-';
    var numerator = Math.abs(this.numerator);
    var denominator = Math.abs(this.denominator);

    var wholepart = Math.floor(numerator / denominator);
    numerator = numerator % denominator;
    if (wholepart != 0)
        result += wholepart;
    if (numerator != 0)
    {
		if(wholepart != 0)
			result+=' ';
        result += numerator + '/' + denominator;
	}
    return result.length > 0 ? result : '0';
}

/* pretty-printer to support TeX notation (using with MathJax, KaTeX, etc) */
Fraction.prototype.toTeX = function(mixed)
{
	if (isNaN(this.denominator))
		return 'NaN';
    var result = '';
    if ((this.numerator < 0) != (this.denominator < 0))
        result = '-';
    var numerator = Math.abs(this.numerator);
    var denominator = Math.abs(this.denominator);

    if(!mixed){
		//We want a simple fraction, without wholepart extracted
		if(denominator === 1)
			return result + numerator;
		else
			return result + '\\frac{' + numerator + '}{' + denominator + '}';
	}
    var wholepart = Math.floor(numerator / denominator);
    numerator = numerator % denominator;
    if (wholepart != 0)
        result += wholepart;
    if (numerator != 0)
        result += '\\frac{' + numerator + '}{' + denominator + '}';
    return result.length > 0 ? result : '0';
}

/* destructively rescale the fraction by some integral factor */
Fraction.prototype.rescale = function(factor)
{
    this.numerator *= factor;
    this.denominator *= factor;
    return this;
}

Fraction.prototype.add = function(b)
{
    var a = this.clone();
    if (b instanceof Fraction) {
        b = b.clone();
    } else {
        b = new Fraction(b);
    }
    var td = a.denominator;
    a.rescale(b.denominator);
    a.numerator += b.numerator * td;

    return a.normalize();
}


Fraction.prototype.subtract = function(b)
{
    var a = this.clone();
    if (b instanceof Fraction) {
        b = b.clone();  // we scale our argument destructively, so clone
    } else {
        b = new Fraction(b);
    }
    var td = a.denominator;
    a.rescale(b.denominator);
    a.numerator -= b.numerator * td;

    return a.normalize();
}


Fraction.prototype.multiply = function(b)
{
    var a = this.clone();
    if (b instanceof Fraction)
    {
        a.numerator *= b.numerator;
        a.denominator *= b.denominator;
    } else if (typeof b === 'number') {
        a.numerator *= b;
    } else {
        return a.multiply(new Fraction(b));
    }
    return a.normalize();
}

Fraction.prototype.divide = function(b)
{
    var a = this.clone();
    if (b instanceof Fraction)
    {
        a.numerator *= b.denominator;
        a.denominator *= b.numerator;
    } else if (typeof b === 'number') {
        a.denominator *= b;
    } else {
        return a.divide(new Fraction(b));
    }
    return a.normalize();
}

Fraction.prototype.equals = function(b)
{
    if (!(b instanceof Fraction)) {
        b = new Fraction(b);
    }
    // fractions that are equal should have equal normalized forms
    var a = this.clone().normalize();
    var b = b.clone().normalize();
    return (a.numerator === b.numerator && a.denominator === b.denominator);
}


/* Utility functions */

/* Destructively normalize the fraction to its smallest representation. 
 * e.g. 4/16 -> 1/4, 14/28 -> 1/2, etc.
 * This is called after all math ops.
 */
Fraction.prototype.normalize = (function()
{

    var isFloat = function(n)
    {
        return (typeof(n) === 'number' &&
                ((n > 0 && n % 1 > 0 && n % 1 < 1) || 
                 (n < 0 && n % -1 < 0 && n % -1 > -1))
               );
    }

    var roundToPlaces = function(n, places) 
    {
        if (!places) {
            return Math.round(n);
        } else {
            var scalar = Math.pow(10, places);
            return Math.round(n*scalar)/scalar;
        }
    }
        
    return (function() {

        // XXX hackish.  Is there a better way to address this issue?
        //
        /* first check if we have decimals, and if we do eliminate them
         * multiply by the 10 ^ number of decimal places in the number
         * round the number to nine decimal places
         * to avoid js floating point funnies
         */
        if (isFloat(this.denominator)) {
            var rounded = roundToPlaces(this.denominator, 9);
            var scaleup = Math.pow(10, rounded.toString().split('.')[1].length);
            this.denominator = Math.round(this.denominator * scaleup); // this !!! should be a whole number
            //this.numerator *= scaleup;
            this.numerator *= scaleup;
        } 
        if (isFloat(this.numerator)) {
            var rounded = roundToPlaces(this.numerator, 9);
            var scaleup = Math.pow(10, rounded.toString().split('.')[1].length);
            this.numerator = Math.round(this.numerator * scaleup); // this !!! should be a whole number
            //this.numerator *= scaleup;
            this.denominator *= scaleup;
        }
        var gcf = Fraction.gcf(this.numerator, this.denominator);
        this.numerator /= gcf;
        this.denominator /= gcf;
        if (this.denominator < 0) {
            this.numerator *= -1;
            this.denominator *= -1;
        }
        return this;
    });

})();


/* Takes two numbers and returns their greatest common factor. */
//Adapted from Ratio.js
Fraction.gcf = function(a, b) {
    if (arguments.length < 2) {
        return a;
    }
    var c;
    a = Math.abs(a);
    b = Math.abs(b);
/*  //It seems to be no need in these checks
    // Same as isNaN() but faster
    if (a !== a || b !== b) {
        return NaN;
    }
    //Same as !isFinite() but faster
    if (a === Infinity || a === -Infinity || b === Infinity || b === -Infinity) {
        return Infinity;
     }
     // Checks if a or b are decimals
     if ((a % 1 !== 0) || (b % 1 !== 0)) {
         throw new Error("Can only operate on integers");
     }
*/

    while (b) {
        c = a % b;
        a = b;
        b = c;
    }
    return a;
};

//Not needed now
// Adapted from: 
// http://www.btinternet.com/~se16/js/factor.htm
Fraction.primeFactors = function(n) 
{

    var num = Math.abs(n);
    var factors = [];
    var _factor = 2;  // first potential prime factor

    while (_factor * _factor <= num)  // should we keep looking for factors?
    {      
      if (num % _factor === 0)  // this is a factor
        { 
            factors.push(_factor);  // so keep it
            num = num/_factor;  // and divide our search point by it
        }
        else
        {
            _factor++;  // and increment
        }
    }

    if (num != 1)                    // If there is anything left at the end...
    {                                // ...this must be the last prime factor
        factors.push(num);           //    so it too should be recorded
    }

    return factors;                  // Return the prime factors
}


Fraction.prototype.snap = function(max, threshold) {
    if (!threshold) threshold = .0001;
    if (!max) max = 100;

    var negative = (this.numerator < 0);
    var decimal = this.numerator / this.denominator;
    var fraction = Math.abs(decimal % 1);
    var remainder = negative ? Math.ceil(decimal) : Math.floor(decimal);

    for(var denominator = 1; denominator <= max; ++denominator) {
        for(var numerator = 0; numerator <= max; ++numerator) {
            var approximation = Math.abs(numerator/denominator);
            if (Math.abs(approximation - fraction) < threshold) {
                return new Fraction(remainder * denominator + numerator * (negative ? -1 : 1), denominator);
            }
        }
    }

    return new Fraction(this.numerator, this.denominator);
};

/* If not in browser */
if(typeof module !== "undefined")
    module.exports.Fraction = Fraction

;;;
'use strict';
function okrugldo(a,b){
/**Округлить a с точностью до b*/
	if(!b)
		b=1;
	a=Math.round(a/b)*b;
	return a;
}
function sluchch(n,k,s){
/**Случайное число от n до k с шагом s.
Если s опущено - с шагом 1.
Если k опущено - от 0 до n*/
	if(!s)
		s=1;
	if(k==undefined)
		return sluchch(0,n,1);

	return okrugldo(Math.random() * (k-n),s) + n;
}

function slKrome(a,p1,p2,p3){
/**Случайное число, кроме a:
если a - массив, то не содержащееся в нём;
если a - число или строка, то не равное ему;
если a - функция, принимающая параметр - то не удовлетворяющее ей (т. е. чтобы функция вернула 0).*/
	var b;

	if(a.isNumber || a.isString)
		do{
			b=sl(p1,p2,p3);
		}while(b==a);
	else if(a.isArray)
		if(a.length)
			do{
				b=sl(p1,p2,p3);
			}while(a.hasElem(b));
		else
			return sl(p1,p2,p3);
	else if(a.isFunction)
		do{
			b=sl(p1,p2,p3);
		}while(a(b));
	else
		console.error('Первый параметр функции slKrome должен быть числом, строкой, массивом или функцией.');
	return b;
}

function sluchDel(a){
/**Случайный делитель числа a*/
	return a.sluchDel();
}

function sluchiz(a,n){
/**Массив n случайных неповторяющихся элементов массива a*/
	if(!(n>=1))
		n=1;
	var b=a.slice();
	b.shuffle();
	b.length=n;
	return b;
}

function chislit(a,s1,s2,s5){
/**Вспомогательная процедура*/
	a=a%100;
	if((a>=5)&&(a<=20))
		return s5;

	a=a%10;
	if(a==1)
		return s1;

	if((a<=4)&&(a>=2))
		return s2;

	return s5;
}

function s3ug(Ax,Ay,Bx,By,Cx,Cy){
/**Площадь треугольника по координатам трёх вершин.*/
	return 0.5*(Ax*By+Ay*Cx+Bx*Cy-By*Cx-Cy*Ax-Ay*Bx).abs();
}

function chislitM(p1,p2,p3,p4){
	return p1.ts()+' '+chislit(p1,p2,p3,p4);
}

function chislitlx(p1,p2,p3){
/***/
	var rez=sklonlxkand(p2,undefined,0);
	switch(p3){
		case 'i': return chislitM(p1,	rez.ie,	(rez.r2?rez.r2:rez.re),	rez.rm);
		case 'r': return chislitM(p1,	rez.re,	 rez.rm,				rez.rm);
		case 'd': return chislitM(p1,	rez.de,	 rez.dm,				rez.dm);
		case 'v': return chislitM(p1,	rez.ve,	(rez.r2?rez.r2:rez.ve),	rez.vm);
		case 't': return chislitM(p1,	rez.te,	 rez.tm,				rez.tm);
		case 'p': return chislitM(p1,	rez.pe,	 rez.pm,				rez.pm);
	}
	return chislitM(p1,rez.ie,(rez.r2?rez.r2:rez.re),rez.rm);
}

var Drob={};

Drob.prov=function(p1){
	p1=Drob.fixN(p1);
	return !!p1.ch&&!!p1.zn;
}

Drob.fixN=function(p1){
	if(p1.isNumber)
		p1={ch:p1,zn:1};
	return p1;
}

Drob.sokr=function(p1){
	p1=Drob.fixN(p1);
	if(!Drob.prov(p1))return null;
	if(p1.zn<0){
		p1.ch*=-1;
		p1.zn*=-1;
	}
	var a1=p1.ch.nod(p1.zn);
	p1.ch/=a1;
	p1.zn/=a1;
	return p1;
}

function clone(obj){
	if(obj == null || typeof(obj) != 'object')
		return obj;

	var temp = {};
	if (obj instanceof Array)
		temp = [];
	for(var key in obj)
		if(obj[key] === undefined)
			temp[key]=undefined;
		else if(obj[key].isArray)
			temp[key]=obj[key].slice();
		else
			temp[key] = clone(obj[key]);
	return temp;
}

function sl1(){
	return Math.random().round();
}

function sp(a){//Я просто оставлю это здесь
	for(var i=0,c=a.split('\''),b=[];i<c.length;i++)
		b=b.concat(i%2?c[i]:c[i].split(' '));
	for(var i=0;i<b.length;b.splice(i,!b[i++])){};
	return b;
}

function cvet(a){
	return '#'+a.r.toString(16).dopdo('0',2)+a.g.toString(16).dopdo('0',2)+a.b.toString(16).dopdo('0',2);
}

function proporMezhdu(a,b,pr){
	return a.proporMezhdu(b,pr);
}

function cvetMezhdu(a,b,pr){
	return cvet({
		r:proporMezhdu(a.r,b.r,pr).round(),
		g:proporMezhdu(a.g,b.g,pr).round(),
		b:proporMezhdu(a.b,b.b,pr).round(),
	});
}

function perevodVelichin(a){
/**Наброски движка про перевод величин*/
	var edIzm=a.iz(2);
	var ishIzm=edIzm[0];
	var rezIzm=edIzm[1];
	var koef=sl(0.1,9.9,0.1)*10 .pow(sl(-1,1));
	var otv=koef*ishIzm[1]/rezIzm[1];
	window.vopr.txt='Выразите '+chislitlx(koef,ishIzm[0])+' в '+lx[rezIzm[0]].pm;
	window.vopr.ver=[otv.ts()];
}

function isZ(n){
/**Является ли n целым числом.*/
	return n.isZ();
}

function isPolnKvadr(n){
/**Является ли n полным квадратом.*/
	return n.isPolnKvadr();
}

function hasErrors(p,bdr){
	if(p==undefined)
		return 'undefined; '
	if(p.isFunction)
		return 0;
	var rez='';
	if(p.isNumber)
		p=''+p;
	if(p.isString){
		if(p.match(/NaN/))
			rez+='NaN; ';
		if(p.match(/undefined/))
			rez+='undefined; ';
		if(p.match(/Infinity/))
			rez+='Infinity; ';
		if(p.match(/[.,][0-9]*00000/))
			rez+='00000; ';
		if(!bdr && p.reverse().match(/[0-9]{6,}[.,](?!0("|sir))/))
			rez+='6 и более цифр после десятичной запятой '+
				'(если так и должно быть, установите vopr.kat.bdr значение 1; ';
	}
	if(p.isArray){
		for(var i=0;i<p.length;i++){
			rez+=hasErrors(p[i]);
		}
	}
	return rez;
}

function rang_mat(A){//Отсюда: http://liloisproj.narod.ru/mat_rang.htm
	var i=A.length;
	var j=A[0].length;
	var q = Math.min(i,j);

	while(q) // проверка: порядок матрицы меньше или равен минимальному из размеров матрицы?
	{ // если да
		var B = []; // создаем новую матрицу размера q
		for(var w=0;w<q;w++)
			B[w]=[];

		for(var a=0;a<(i-(q-1));a++) // тут начинается перебор матриц q-го порядка
		{
			for(var b=0;b<(j-(q-1));b++)
			{
				for(var c=0;c<q;c++)
				{
					for(var d=0;d<q;d++)
					{
						B[c][d] = A[a+c][b+d];
					}
				}

				if(B.det()) // если определитель матрицы отличен от нуля
				{ // то
					return q; // присваиваем рангу значение q
				}
			}
		}
		q--;
	}
	return 0;
}

function getLen(x1, x2, y1, y2){
	return Math.sqrt( Math.pow(x1-x2, 2)+Math.pow(y1-y2, 2) );
}

function getRandomInt(min, max){
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeStruct(strNames){
	var names = strNames.split(' ');
	var count = names.length;
	function constructor(){
		for (var i = 0; i < count; i++){
			this[names[i]] = arguments[i];
		}
	}
	return constructor;
}

function make2Array(ch,k) {
/**из числа делает массив 0 и 1 с количеством элементов k*/
	var x=[];
	for (var i=0; i<k; i++) {
		var t=ch % 2;
		ch = Math.floor(ch / 2);
		x.push(t);
	}
	return x;
}

function slLetter(b) {
/**генерирует случайную букву английского алфавита*/
	var a = '';
	if (!b)
		a = String.fromCharCode('a'.charCodeAt(0)+sluchch(25));
	else {
		if (b.isString) {
			var temp = b.charCodeAt(0)-'a'.charCodeAt(0);
			a = String.fromCharCode('a'.charCodeAt(0)+slKrome(temp,25));
		}
		else if (b.isArray) {
			var temp=[];
			for (var i=0; i<b.length; i++)
				temp[i] = b[i].charCodeAt(0)-'a'.charCodeAt(0);
			a = String.fromCharCode('a'.charCodeAt(0)+slKrome(temp,25));
		}
	}
	return a;
}

function genPifag(){
	return objUmn([[sl(1,5)]],[om.pifagtr.iz().slice()])[0];
}

function mapRecursive(obj,fun){
	if(obj===undefined || obj.isNumber || obj.isString){
		return fun(obj);
	}
	if(obj.isFunction){
		return obj;
	}
	if(obj.isArray){
		var len=obj.length;
		var rez=[];
		for(var i=0;i<len;i++){
			rez[i]=mapRecursive(obj[i],fun);
		}
		return rez;
	}
	if(obj.isObject){
		var rez={};
		for(var chto in obj){
			rez[chto]=mapRecursive(obj[chto],fun);
		}
		return rez;
	}
	return obj;
}

function compareObjects(a,b,propList){
	var len=propList.length;
	for(var i=0;i<len;i++){
		if(a[propList[i]]<b[propList[i]])
			return -1;
		else if (a[propList[i]]>b[propList[i]])
			return 1;
	}
	return 0;
}

function safeinc(obj,prop){
	if(!obj[prop])
		obj[prop]=1;
	else
		obj[prop]++;
}

function setProps(obj,props){
	for(var chto in props){
		obj[chto]=props[chto];
	}
}

function isCppCode(code){
	return /int\s+main\s*\(.*\)/.test(code);
}

function generateSuperincSequence(length, start, mingap, maxgap) {
	if (start === undefined) {
		start = 1;
	}
	if (mingap === undefined) {
		mingap = 1;
	}
	if (maxgap === undefined) {
		maxgap = 16; // От балды
	}
	var seq = [start];
	while (seq.length < length) {
		seq.push(seq.sum()+sl(mingap,maxgap));
	}
	return seq;
}

try{
	global. okrugldo = module.exports. okrugldo = okrugldo ;
	global. sl = module.exports. sl =
	global. sluchch = module.exports. sluchch = sluchch ;
	global. slKrome = module.exports. slKrome = slKrome ;
	global. sluchDel = module.exports. sluchDel = sluchDel ;
	global. sluchiz = module.exports. sluchiz = sluchiz ;
	global. chislit = module.exports. chislit = chislit ;
	global. s3ug = module.exports. s3ug = s3ug ;
	global. chislitM = module.exports. chislitM = chislitM ;
	global. chislitlx = module.exports. chislitlx = chislitlx ;
	global. clone = module.exports. clone = clone ;
	global. sl1 = module.exports. sl1 = sl1 ;
	global. sp = module.exports. sp = sp ;
	global. cvet = module.exports. cvet = cvet ;
	global. proporMezhdu = module.exports. proporMezhdu = proporMezhdu ;
	global. cvetMezhdu = module.exports. cvetMezhdu = cvetMezhdu ;
	global. perevodVelichin = module.exports. perevodVelichin = perevodVelichin ;
	global. isZ = module.exports. isZ = isZ ;
	global. isPolnKvadr = module.exports. isPolnKvadr = isPolnKvadr ;
	global. hasErrors = module.exports. hasErrors = hasErrors ;
	global. rang_mat = module.exports. rang_mat = rang_mat ;
	global. getLen = module.exports. getLen = getLen ;
	global. getRandomInt = module.exports. getRandomInt = getRandomInt ;
	global. makeStruct = module.exports. makeStruct = makeStruct ;
	global. make2Array = module.exports. make2Array = make2Array ;
	global. slLetter = module.exports. slLetter = slLetter ;
	global. genPifag = module.exports. genPifag = genPifag ;
	global. mapRecursive = module.exports. mapRecursive = mapRecursive ;
	global. compareObjects = module.exports. compareObjects = compareObjects ;
	global. safeinc = module.exports. safeinc = safeinc ;
	global. setProps = module.exports. setProps = setProps ;
	global. isCppCode = module.exports. isCppCode = isCppCode ;
	global. generateSuperincSequence = module.exports. generateSuperincSequence = generateSuperincSequence ;
} catch (e) {
}

;;;
'use strict';

//перевод числа x из системы с основанием sysBefore в систему с основанием sysAfter
function intoAnotherSystem(x,sysBefore,sysAfter) {
// TODO: А нет ли готовой функции?
//перевод из заданной в 10-ную
	var i=String(x).length;
	var c = 1;
	var x10 = 0;
	while (i>0) {
		var t = String(x).charAt(i-1)*1;
		if (isNaN(t))
			t = String(x).charCodeAt(i-1)-String("A").charCodeAt(0)+10;
		x10 = t*c+x10;
		i=i-1;
		c = c*sysBefore;
	}
//перевод из 10-ной в заданную
	var finall = '';
	while (x10>0) {
		var t = String(x10 % sysAfter);
		if (x10 % sysAfter >= 10)
			t = String.fromCharCode(String("A").charCodeAt(0)+(x10 % sysAfter)-10);
		x10 = Math.floor(x10/sysAfter);
		finall = t+finall;
	}
	return(finall);
}

function parseLogic(exp) {
/**преобразует логическое выражение в выражение, доступное для вычисления*/
	while (exp.indexOf('>')!=-1){
		var t = exp.indexOf('>');
		var A = findA(exp,t);
		exp=exp.insert(A,'!');
		exp = exp.replace('>','||');
	}
	while (exp.indexOf('~')!=-1){
		var t = exp.indexOf('~');
		var A = findA(exp,t);
		var B = findB(exp,t);
		var exp1=exp.substring(A,t);
		var exp2=exp.substring(t+1,B+1);
		exp = exp.replace(exp1+'~'+exp2,'('+exp1+'&&'+exp2+')'+'||(!'+exp1+'&&!'+exp2+')');
	}
	return exp;
}

function findA(exp,t) {
	var i=t-1;
	if (exp[t-1]==')') {
		var k = 1;
		while (k>0){
			i--;
			if (exp[i]==')')
				k++;
			else if (exp[i]=='(')
				k--;
		}
	}
	else
		i=i-3;
	while (exp[i-1]=='!')
		i--;
	return i;
}

function findB(exp,t) {
	var i=t+1;
	while (exp[i]=='!')
		i++;
	if (exp[t+1]=='(') {
		var k = 1;
		while (k>0){
			i++;
			if (exp[i]=='(')
				k++;
			else if (exp[i]==')')
				k--;
		}
	}
	else
		i = i+3;
	return i;
}

function printLogic(exp) {
/**&#172; - отрицание
&#8594; - стрелка направо
&#8743; - Логическая и
&#8744; - Логическая иили
&#8801; - Идентичный, тождество
печатает логическое выражение*/
	exp=exp.replace(/\|\|/g,'&#8744;');
	exp=exp.replace(/\&\&/g,'&#8743;');
	exp=exp.replace(/\~/g,'&#8801;');
	exp=exp.replace(/\>/g,'&#8594;');
	exp=exp.replace(/\!/g,'&#172;');
	var re = /x\[(\d)\]/g;
	exp = exp.replace(re, function(str,a) { return 'X'+(Number(a)+1) });

	return exp;
}

function genLogFunc(k,b) {
/**генерирует логическую функцию*/
	var t=0;
	var f='';
	for (var i=0;i<k;i++) {
		var d3=sl1();
		if (d3&&i!=0) {
			f=f+'(';
			t++;
		}
		f+='!'.esli(sl1());
		f=f+'x['+i+']';
		if (i!=k-1)	{
			var d4=sl1();
			if (d4&&t>0) {
				f=f+')';
				t--;
			}
			var d2=0;
			if (!b)
				d2=sluchch(3);
			else
				d2=sluchch(1,2);
			switch (d2) {
				case 0:
					f='('+f+')';
					f=f+'>';
					break;
				case 1:
					f=f+'||';
					break;
				case 2:
					f=f+'&&';
					break;
				case 3:
					f='('+f+')'+'~'+'(';
					t++;
					break;
			}
		}
	}
	for (var i=0; i<t; i++)
		f=f+')';
	//убираем лишние скобки
	var re = /\(x\[(\d)\]\)/g;
	while (f.search(re)!=-1) {
		f = f.replace(re, "x[$1]");
	}
	re = /\(!x\[(\d)\]\)/g;
	while (f.search(re)!=-1) {
		f = f.replace(re, "!x[$1]");
	}
	return f;
}

function genMask() {
/**генерирует случайную маску*/
	var l = sluchch(5,10);//количество символов в маске
	var mask = '';
	for (var i=0; i<l; i++) {
		var d = sluchch(3);
		switch(d) {
			case 0:
				mask+='?';
				break;
			case 1:
				mask+='*';
				break;
			case 2:
			case 3:
				mask+=slLetter();
				break;

		}
	}
	if (mask.search(/\?/)==-1)
		mask = mask+'?';
	return mask;
}

function genWrongWordForMask(rmask) {
/**генерирует случайное слово, похожее на маску, но с ошибкой*/
	var word='';
	var reg = rmask.replace(/\*/g,'[a-z]*').replace(/\?/g,'[a-z]');
	var mask = rmask;
	do{
		var re1 = /\*+\?\**|\**\?\*+/;//*?*
		var re2 = /([^\*]*)\?([^\*]*)/;//?
		if (sl1()&& mask.search(re1)!=-1) {
			mask=mask.replace(re1,'');
		}
		else if (sl1() && mask.search(re2)!=-1) {
			var w='';
			var d = slKrome(1,3);
			for (var j=0; j<d; j++)
				w+=slLetter();
			mask=mask.replace(re2,"$1"+w+"$2");
		}
		else {
			var l = mask.length;
			var d = sluchch(l-1);
			while (!mask[d].isLetter()) {
				d=sluchch(l-1);
			}
			mask=mask.replace(mask[d],slLetter());
		}
		var word = genWordForMask(mask);

	}
	while (word.search(reg)!=-1)
	return word;
}

function genWordForMask(mask) {
/**генерирует случайное слово по маске*/
	var l = mask.length;//количество символов в маске
	var word = '';
	for (var i=0; i<l; i++) {
		switch(mask[i]) {
			case '*':
				var d = sluchch(3);
				for (var j=0; j<d; j++)
					word+=slLetter();
				break;
			case '?':
				word+=slLetter();
				break;
			default:
				word+=mask[i];
				break;

		}
	}
	return word;
}

function genAlg() {
/**Для составления цепочек/слов/бус/чисел разрешается использовать бусины k типов, обозначаемых буквами
цепочка должна состоять из N бусин
0) нет правила
1) На i-м месте цепочки стоит одна из бусин [список]
2) На i-м месте не может стоять одна из бусин [список]
3) На i-м месте цепочки стоит бусина, которой нет на j-м месте цепочки
4) На i-м месте цепочки такая же бусина, как и на j-м месте цепочки
5) На i-м – любая гласная, если j согласная, и любая согласная, если j гласная
6) На i-м – любая гласная, если j гласная, и любая согласная, если j согласная
7) На i-м месте цепочки стоит гласная/согласная буква*/
	var alg=[];
	if (sl1()==0)
		alg.push('z');//цифры
	else
		alg.push('l');//буквы
	var has0 = false;
	var has1 = false;
	var k = sluchch(4,6);
	var N = sluchch(3,k-1);
	alg[1]=[];
	for (var i=0; i<k; i++) {
		if (alg[0]=='z'){
			var c = slKrome(alg[1],9);//список элементов, которые  можно использовать в цепочке
			if (c%2==0)
				has0=true;
			else
				has1=true;
		}
		else {
			var c = slLetter(alg[1]);//список элементов, которые  можно использовать в цепочке
			if (c.isGl())
				has0=true;
			else
				has1=true;
		}
		alg[1].push(c);
	}

	for (var i=2; i<N+2; i++) {
		var d=0;
		if (has0 && has1)
			d = sluchch(7);//номер правила, используемого для данной бусины
		else
			d = sluchch(4);//если есть только согласные(гласные) буква, нельзя использовать 4,5 правило
		alg[i]=[];
		alg[i][0]=d;
		switch (d) {
			case 1:
			case 2:
				alg[i][1]=[];
				var c = sluchch(1,k-2);
				for (var j=0; j<c; j++)
					alg[i][1].push(slKrome(alg[i][1],k-1));//кладутся не сами буквы/цифры, а их индексы из alg[1]!
				break;
			case 3:
			case 4:
			case 5:
			case 6:
				if (i>2)
					alg[i][1]=slKrome(i-2,i-2);
				else alg[i][0]=0;
				break;
			case 7:
				alg[i][1]=sl1();//
				break;
		}
	}
	return alg;
}

function algInText(alg) {
/**Преобразует алгоритм в текст*/
	var k = alg[1].length;
	var N = (alg.length-2);
	var ch = '';
	var text  = 'Для составления цепочек разрешается использовать бусины '+k+' типов, обозначаемых';
	if (alg[0]=='z'){
		text += ' цифрами ';
		ch = ['четная','нечетная'];
	}
	else {
		text += ' буквами ';
		ch = ['гласная','согласная'];
	}
	text += alg[1];
	text += '. Цепочка должна состоять из '+N+' бусин, при этом должны соблюдаться следующие правила:';
	for (var i=2; i<N+2; i++) {
		if (alg[i][0]!=0) {
			text = text+'<br/>';
			if (i==2)
				text = text+'На первом месте цепочки ';
			else if (i==N+1)
				text = text+'На последнем месте цепочки ';
			else
				text = text+'На '+(i-1)+'-м месте цепочки ';
		}
		switch (alg[i][0]) {
			case 1:
				text += 'стоит ';
				if (alg[i][1].length==1)
					text += 'бусина ';
				else
					text += 'одна из бусин ';
				for (var j=0; j<alg[i][1].length; j++)
					text += alg[1][alg[i][1][j]]+', ';
				break;
			case 2:
				text += 'не может стоять ';
				if (alg[i][1].length==1)
					text += 'бусина ';
				else
					text += 'одна из бусин ';
				for (var j=0; j<alg[i][1].length; j++)
					text += alg[1][alg[i][1][j]]+',';
				break;
			case 3:
				text += 'стоит бусина, которой нет на '+
					(alg[i][1]+1)+'-м месте цепочки';
				break;
			case 4:
				text += 'стоит такая же бусина, как и на '+
					(alg[i][1]+1)+'-м месте цепочки';
				break;
			case 5:
				text += 'стоит любая '+ch[0]+', если '+
					(alg[i][1]+1)+'-я '+ch[1]+', и любая '+ch[1]+', если '+
					(alg[i][1]+1)+'-я '+ch[0];
				break;
			case 6:
				text += 'стоит любая '+ch[0]+', если '+
					(alg[i][1]+1)+'-я '+ch[0]+', и любая '+ch[1]+', если '+
					(alg[i][1]+1)+'-я '+ch[1];
				break;
			case 7:
				text += 'стоит '+ch[alg[i][1]]+' буcина';
				break;
		}
	}
	return text;
}

function genWordForAlg(walg) {
/**генерирует цепочку для алгоритма*/
	var alg = walg.slice();
	var word='';
	var k = alg[1].length;
	var ar0 = [];
	var ar1 = [];
	for (var i=0; i<k; i++){
		if (alg[0]=='z'){
			if (alg[1][i]%2==0)
				ar0.push(alg[1][i]);
			else
				ar1.push(alg[1][i]);
		}
		else {
			if (alg[1][i].isGl())
				ar0.push(alg[1][i]);
			else
				ar1.push(alg[1][i]);
		}
	}
	for (var i=2; i<alg.length; i++) {
		switch (alg[i][0]) {
			case 0:
				word+=alg[1].iz();
				break;
			case 1:
				word+=alg[1][alg[i][1].iz()];
				break;
			case 2:
				word+=alg[1][slKrome(alg[i][1],k-1)];
				break;
			case 3:
				word+=alg[1][slKrome(alg[1].indexOf(word[alg[i][1]]),k-1)];
				break;
			case 4:
				word+=word[alg[i][1]];
				break;
			case 5:
				if (alg[0]=='z'){
					if (word[alg[i][1]]%2==0)
						word+=ar1.iz();
					else
						word+=ar0.iz();
				}
				else {
					if (word[alg[i][1]].isGl())
						word+=ar1.iz();
					else
						word+=ar0.iz();
				}
				break;
			case 6:
				if (alg[0]=='z'){
					if (word[alg[i][1]]%2==0)
						word+=ar0.iz();
					else
						word+=ar1.iz();
				}
				else {
					if (word[alg[i][1]].isGl())
						word+=ar0.iz();
					else
						word+=ar1.iz();
				}
				break;
			case 7:
				if (alg[i][1])
					word+=ar1.iz();
				else
					word+=ar0.iz();
				break;
		}
	}
	return word;
}

function genWrongWordForAlg(walg) {
/**генерирует цепочку для алгоритма*/
	var alg = walg.copyAr();
	var N = (alg.length-2);
	var r = 0;
	do {
		r = sluchch(2,N+1);
	} while (alg[r][0]==0);
	switch (alg[r][0]) {
		case 1:
			alg[r][0]=2;
			break;
		case 2:
			alg[r][0]=1;
			break;
		case 3:
			alg[r][0]=4;
			break;
		case 4:
			alg[r][0]=3;
			break;
		case 5:
			alg[r][0]=6;//
			break;
		case 6:
			alg[r][0]=5;//
			break;
		case 7:
			alg[r][1]=1-alg[r][1];//
			break;
	}
	var word = '';
	var word = genWordForAlg(alg);
	return word;
}

function printLogicRus(exp,ar) {
	exp=exp.replace(/\|\|/g,' ИЛИ ');
	exp=exp.replace(/\&\&/g,' И ');
	exp=exp.replace(/\!/g,' НЕ ');
	var re = /c\[(\d)\]/g;
	exp = exp.replace(re, function(str,a) { return ar[Number(a)] });
	return exp;
}

try {

	global. intoAnotherSystem = module.exports. intoAnotherSystem = intoAnotherSystem ;
	global. parseLogic = module.exports. parseLogic = parseLogic ;
	global. findA = module.exports. findA = findA ;
	global. findB = module.exports. findB = findB ;
	global. printLogic = module.exports. printLogic = printLogic ;
	global. genLogFunc = module.exports. genLogFunc = genLogFunc ;
	global. genMask = module.exports. genMask = genMask ;
	global. genWrongWordForMask = module.exports. genWrongWordForMask = genWrongWordForMask ;
	global. genWordForMask = module.exports. genWordForMask = genWordForMask ;
	global. genAlg = module.exports. genAlg = genAlg ;
	global. algInText = module.exports. algInText = algInText ;
	global. genWordForAlg = module.exports. genWordForAlg = genWordForAlg ;
	global. genWrongWordForAlg = module.exports. genWrongWordForAlg = genWrongWordForAlg ;
	global. printLogicRus = module.exports. printLogicRus = printLogicRus ;
} catch (e) {
}

;;;
'use strict';

function multiplyMatrix(A,B){//http://mathhelpplanet.com/viewtopic.php?f=44&t=22337
	var rowsA = A.length,
		colsA = A[0].length,
		rowsB = B.length,
		colsB = B[0].length,
		C = [];
	for(var i=0; i<rowsA; i++)
		C[i]=[];
	for(	var k=0; k<colsB; k++)
		for(	var i=0; i < rowsA; i++){
			var temp=0;
			for(	var j = 0; j < rowsB; j++)
				temp += A[i][j]*B[j][k];
			C[i][k] = temp;
		}
	return C;
}

function Determinant(A){	// Определитель матрицы (используется алгоритм Барейса)
	var N=A.length,
		B=[],
		denom=1,
		exchanges=0;
	for(var i=0; i<N; ++i){
		B[i]=[];
		for(var j=0; j<N; ++j)
			B[i][j] = A[i][j];
	}
	for(var i=0; i<N-1; ++i){
		var maxN=i,
		maxValue=Math.abs(B[i][i]);
		for(var j=i+1; j<N; ++j){
			var value=Math.abs(B[j][i]);
			if(value>maxValue){
				maxN=j;
				maxValue = value;
			}
		}
		if(maxN>i){
			var temp = B[i]; B[i] = B[maxN]; B[maxN] = temp;
			++exchanges;
		}else if(maxValue==0)
			return maxValue;
		var value1=B[i][i];
		for(var j = i+1; j < N; ++j){
			var value2=B[j][i];
			B[j][i]=0;
			for(var k=i+1; k<N; ++k)
				B[j][k]=(B[j][k]*value1-B[i][k]*value2)/denom;
		}
		denom=value1;
	} //@ http://mathhelpplanet.com/viewtopic.php?f=44&t=22390
	if(exchanges%2)
		return -B[N-1][N-1];
	else
		return B[N-1][N-1];
}

function MatrixCofactor(i,j,A){   //Алгебраическое дополнение матрицы
	var N=A.length,
		sign=((i+j)%2==0) ? 1 : -1;
	for(var m=0; m<N; m++){
		for(var n=j+1; n<N; n++)
			A[m][n-1]=A[m][n];
		A[m].length--;
	}
	for(var k=i+1; k<N; k++)
		A[k-1] = A[k];
	A.length--;
	return sign*Determinant(A);
}

function AdjugateMatrix(A){   //Союзная (присоединённая) матрица
	var N=A.length,
		B=[],
		adjA=[];
	for(var i=0; i<N; i++){
		adjA[i]=[];
		for(var j=0; j<N; j++){
			for(var m=0; m<N; m++)
			{
				B[m]=[];
				for(var n = 0; n < N; n++)
					B[m][n] = A[m][n];
			}
			adjA[i][j] = MatrixCofactor(j,i,B);
		}
	}
	return adjA;
}

function InverseMatrix(B){   // Обратная матрица
	var det=Determinant(B);
	if(!det)
		return false;
	var N=B.length,
		A = AdjugateMatrix(B);
	for(var i=0; i<N; i++)
		for(var j=0; j<N; j++)
			A[i][j] /= det;
	return A;
}

function objSum(a,b){
/**Сложение двух матриц или двух чисел.*/
	if(!a)
		return b;
	if(!b)
		return a;
	if(a.isNumber && b.isNumber)
		return a+b;
	if(a.isArray && b.isArray)
		return a.map(function(a1,b1){
			return objSum(a1,b[b1]);
		});
	return undefined;
}

function objUmn(a,b){
/**Умножение a на b (матрица или число)*/
	if(!a || !b)
		return 0;
	if(a.isNumber && b.isNumber)
		return a*b;
	if(a.isArray && b.isArray)
		return multiplyMatrix(a,b);
	if(a.isArray && b.isNumber)
		return a.map(function(a1){
			return objUmn(a1,b);
		});
	if(b.isArray && a.isNumber)
		return objUmn(b,a);

	return undefined;
}

function generateMatrix(stroki,stolbcy,min,max,p1){
/**Генерирует матрицу из случайных чисел. min, max и p1 - параметры sluchch.*/
	var rez=[];
	for(var i=0;i<stroki;i++){
		rez[i]=[];
		for(var j=0;j<stolbcy;j++)
			rez[i][j]=sl(min,max,p1);
	}
	return rez;
}

function generateScalMatrix(x,n){
/**Генерирует скалярную иатрицу n на n с числом x на главной диагонали.*/
	var rez=generateMatrix(n,n,0);
	for(var i=0;i<n;i++)
		rez[i][i]=x;
	return rez;
}


try {
	global. multiplyMatrix = module.exports. multiplyMatrix = multiplyMatrix ;
	global. Determinant = module.exports. Determinant = Determinant ;
	global. MatrixCofactor = module.exports. MatrixCofactor = MatrixCofactor ;
	global. AdjugateMatrix = module.exports. AdjugateMatrix = AdjugateMatrix ;
	global. InverseMatrix = module.exports. InverseMatrix = InverseMatrix ;
	global. objSum = module.exports. objSum = objSum ;
	global. objUmn = module.exports. objUmn = objUmn ;
	global. generateMatrix = module.exports. generateMatrix = generateMatrix ;
	global. generateScalMatrix = module.exports. generateScalMatrix = generateScalMatrix ;
} catch (e) {
}

;;;
'use strict';
/*Функции, затрагивающие DOM, но не использующие jquery и другие внешние библиотеки*/

document.writeln=function(p1){
	return document.write(p1+'<br/>');
}

function escapeFromIframe(){
/**"Выпрыгивание" из iframe*/
	if(top.location.href!=document.location.href)
		top.location.href=document.location.href;
}

function getDocHeight(){
    var D = document;
    return Math.max(
        Math.max(D.body.scrollHeight, D.documentElement.scrollHeight),
        Math.max(D.body.offsetHeight, D.documentElement.offsetHeight),
        Math.max(D.body.clientHeight, D.documentElement.clientHeight)
    );
}//Вроде как отсюда: http://james.padolsey.com/javascript/get-document-height-cross-browser/

function catchTab(elem,key){
	if(key.keyCode==9){
		var n=elem.scrollTop;
		var val=elem.value;
		var sel=elem.selectionStart;
		var rep=val.substr(elem.selectionStart-1,elem.selectionEnd-elem.selectionStart);
		if(rep.match(/[\n\r]/)){
			console.log(rep);
			rep=rep.replace(/[\n](?![\n\r])/g,'\n\t');
			rep=rep.replace(/[\r](?![\n\r])/g,'\r\t');
			elem.value=val.substr(0,sel-1)+rep+val.substr(elem.selectionEnd-1);
		}else{
			elem.value=val.substr(0,sel)+'\t'+val.substr(elem.selectionEnd);
			elem.selectionStart=elem.selectionEnd=sel+1;
		}
		elem.scrollTop=n;
		return false;
	}
}

function linkSpan(link,blank)
{
	if(blank)
		window.open(link.replace("_","http://"));
	else
		self.location.replace(link.replace("_","http://"));
}

try {
	global. escapeFromIframe = module.exports. escapeFromIframe = escapeFromIframe ;
	global. getDocHeight = module.exports. getDocHeight = getDocHeight ;
	global. catchTab = module.exports. catchTab = catchTab ;
	global. linkSpan = module.exports. linkSpan = linkSpan ;
} catch (e) {
}

;;;
'use strict';

Object.prototype.clone = function() {
/**Рекурсивно клонирует объект.*/
	return clone(this);
};

Object.prototype.makeAllPropertiesNotEnumerable = function() {
/**Сделать все свойства объекта неперечислимыми.*/
	for (var prop in this) {
		Object.defineProperty(this, prop, { enumerable: false });
	}
};

Object.prototype.cloneNonRecursive = function() {
/**Нерекурсивно клонирует объект.*/
	var a = {};
	for (var prop in this) {
		a[prop] = this[prop];
	}
	return a;
};

Object.prototype.addToGlobal = function(glname, p1) {
/**Добавляет все перечислимые свойства объекта в глобальную переменную и, если p1, то делает их в объекте неперечислимыми.*/
	if (typeof(window) === 'undefined') {
		var window = {};
	}
	if (window[glname] === undefined) {
		window[glname] = {};
	}
	for (var prop in this) {
		window[glname][prop] = this[prop];

		// TODO: разобраться, выше же вроде есть
		if (p1) {
			Object.defineProperty(this, prop, { enumerable: false });
		}
	}
	return this;
};

Object.prototype.importFrom = function(p1) {
/**Импортировать все свойства p1 в данный объект*/
	if (p1) {
		for (var prop in p1) {
			this[prop] = p1[prop];
		}
	}
};

Object.prototype.importNonExistingFrom = function(p1) {
/**Импортировать все недостающие свойства p1 в данный объект*/
	if (p1) {
		for (var prop in p1) {
			if (!(prop in this)) {
				this[prop] = p1[prop];
			}
		}
	}
};

Object.prototype.safeinc = function(prop) {
/**Если свойства prop нет, устанавливает его в 1, иначе увеличивает на 1*/
	if (prop in this) {
		this[prop]++;
	} else {
		this[prop] = 1;
	}
}

Object.prototype.addToGlobal('docsObject', 1);

;;;
'use strict';

Object.prototype.NaNtoUndefined = function(r) {
	for (var prop in this) {
		if (this[prop] !== undefined && this[prop].isNumber && isNaN(this[prop])) {
			this[prop] = undefined;
		} else if (r && this[prop].isObject) {
			this[prop].NaNtoUndefined();
		}
	}
};

Object.prototype.deleteSimilarProperties = function(diff) {
	for (var prop in this) {
		if (diff[prop]) {
			if (diff[prop] == this[prop]) {
				delete this[prop];
			} else if (this[prop].isObject || this[prop].isArray) {
				if (diff[prop].isObject || diff[prop].isArray) {
					this[prop].deleteSimilarProperties(diff[prop]);
				}
			}
		}
	}
};

Object.prototype.isObject = true;

Object.prototype.addToGlobal('docsObject', 1);

;;;
'use strict';
Array.prototype.shuffle = function(b){
/**Перемешивает массив случайным образом. Если b, то ещё и рекурсивно на один уровень.*/
	var i = this.length, j, t;
	while(i) 
	{
		j=((i--)*Math.random() ).floor();
		t=b && typeof this[i].shuffle!=='undefined' ? this[i].shuffle() : this[i];
		this[i]=this[j];
		this[j]=t;
	}
	return this;
};//за основу взят пример с tigir.com 

Array.prototype.soed=function(){
/**"Склеивает" массив в строку без разделителей*/
	return this.join('');
};

Array.prototype.sum=function(){
/**Находит сумму элементов числового массива. Если есть нечисловые элементы, они не учитываются.*/
	var a=0;
	var b=this.length;
	for(var i=0;i<b;i++){
		if((this[i]>0)||(this[i]<0)){
			a+=this[i];
		}
	}
 return a;
};

Array.prototype.sumObj=function(){
/**Находит сумму массива чисел или матриц.*/
	var a=0;
	var b=this.length;
	for(var i=0;i<b;i++){
		a=objSum(a,this[i]);
	}
 return a;
};

Array.prototype.umnObj=//Depracated
Array.prototype.production=function(){
/**Находит произведение массива чисел или матриц.*/
	var a=1;
	var b=this.length;
	for(var i=0;i<b;i++){
		a=objUmn(a,this[i]);
	}
 return a;
};

Array.prototype.min=function(f){
/**Индекс минимального элемента числового массива. Если f, то первого, иначе последнего.*/
	var i;
	var m=0;
	if(f){
		for(i=this.length;i;i--)
			if(this[i]<=this[m])
				m=i;
	}else
		for(i=this.length;i;i--)
			if(this[i]<this[m])
				m=i;
	return m;
}

Array.prototype.max=function(f){
/**Индекс максимального элемента числового массива. Если f, то первого, иначе последнего.*/
	var i;
	var m=0;
	if(f){
		for(i=this.length;i;i--){
			if(this[i]>=this[m]){
				m=i;
			}
		}
	}else{
		for(i=this.length;i;i--){
			if(this[i]>this[m]){
				m=i;
			}
		}
	}
	return m;
}

Array.prototype.minE=function(){
/**Минимальный элемент числового массива.*/
	return this[this.min()];
}

Array.prototype.maxE=function(){
/**Максимальный элемент числового массива.*/
	return this[this.max()];
}

Array.prototype.toStandart=function(){
/**Преобразует каждый элемент массива (строку или число) в строку, записанную "по стандарту".*/
	var len=this.length-1;
	for(;len+1;len--){
		this[len]=this[len].toStandart();
	}
}

Array.prototype.iz=function(p1){
/**Если p1 опущено, возвращает случайный элемент массива, иначе последовательность p1 неповторяющихся элементов массива.*/
	if(p1)
		return sluchiz(this,p1);
	else
		return this[sl(0,this.length-1)];
}

Array.prototype.tr=function(p1,p2){
/**Возвращает строку таблицы с записанными в неё элементами массива.
	p1 и p2 позволяют выбрать тэги, отличные от td и tr соотв.*/
	var len=this.length-1;
	var str='';
	for(;len+1;len--){
		str=this[len].vTag(p1?p1:'td')+str;
	}
	return str.vTag(p2?p2:'tr');
}

Array.prototype.zapslch=function(m,n,p1,p2,p3){
/**Присваивает элементам с m по n случайные значения от p1 до p2 с шагом генерации p3. p2 и p3 можно опускать, как в sluchch()*/
	for(;m<=n;m++)
		this[m]=sluchch(p1,p2,p3);
	return this;
}

Array.prototype.N=function(p1,p2){
/**Присваивает p1 первым элементам массива значения натурального ряда, умноженные на p2, если p2 не ноль*/
	for(var i=0;i<p1;this[i++]=(p2?i*p2:i)){};
	this.length=p1;
	return this;
}

Array.prototype.sluchiz=function(n){
/**Возвращает массив из p1 неповторяющихся элементов массива.*/
	return sluchiz(this,n);
}

Array.prototype.malRazn=function(n,s,p){
/**Заполняет массив значениями, каждое из к-рых отличается от предыдущего не более, чем на s*p, и притом с шагом дискретизации s
 n - сколько элементов добавляем
 s - шаг изменения
 p - максимальное количество шагов изменения (в обе стороны)
*/
	for(var i=1;i<=n;i++)
		this[i]=this[i-1]+s*sluchch(-p,p);
	return this;
}

Array.prototype.pervSovp=function(p1){
/**Возвращает индекс первого элемента, совпавшего с данным, и -1, если таких элементов нет*/
	for(var i=0;i<this.length;i++)
		if(this[i]==p1)
			return i;
	return -1;
}

Array.prototype.poslSovp=function(p1){
/**Возвращает индекс последнего элемента, совпавшего с данным, и -1, если таких элементов нет*/
	for(var i=this.length-1;i>=0;i--)
		if(this[i]==p1)
			return i;
	return -1;
}

Array.prototype.sovp=function(p1){
/**Возвращает количество элементов, совпавших с данным, и 0, если таких элементов нет*/
	var s=0;
	for(var i=this.length-1;i>=0;i--)
		if(this[i]==p1)
			s++;
	return s;
}

Array.prototype.toFixedLess=function(p1){
/**Возвращает массив, в котором каждый элемент - строка, содержащая соттв. элемент данного, округлённый до p1 цифр после запятой*/
	var a=[];
	var len=this.length;
	for(var i=0;i<len;i++)
		a[i]=this[i].toFixedLess(p1);
	return a;
}

Array.prototype.dopFixedLess=function(p1){
/**Дополняет массив элементами, округлёнными до p1 цифр после запятой и представленными в виде строк*/
	var len=this.length;
	for(var i=0;i<len;i++)
		this[i]=[this[i],this[i].toFixedLess(p1)];
	return this;
}

Array.prototype.T=function(){
/**Возвращает транспонированный массив*/
	var l1=this.length;
	var l2=0;
	for(var i=0;i<l1;i++)
		if(this[i].length>l2)
			l2=this[i].length;
	var a=[];
	for(i=0;i<l2;i++)
		a[i]=[];
	for(i=0;i<l1;i++)
		for(var j=0;j<l2;j++)
			a[j][i]=this[i][j];
	return a;
}

Array.prototype.zapMonot=function(n,a,minD,maxD,shag){
/**Заполняет массив монотонно возрастающими или убывающими числами.
a - нулевой (начальный) элемент массива.
n - количество элементов
Каждый следующий элемент массива отличается от предыдущего не менее, чем на minD и не более, чем maxD, с шагом shag*/
	this[0]=a;
	for(var i=1;i<n;i++)
		this[i]=this[i-1]+sluchch(minD,maxD,shag);
	return this;
}

Array.prototype.udFunc=function(f1){
/**Количество элементов, удовлетворяющих в качестве параметра функции, возвращающей 0 или 1. Дикий костыль.*/
	return this.map(f1).sum();
}

Array.prototype.kolvoMzhd=function(min,max,vkl){
/**Возвращает кол-во чисел в массиве, лежащих между min и max, если vkl, то включительно*/
	return this.udFunc(function(p1){
		return vkl?p1>=min&&p1<=max:p1>min&&p1<max;
	});
}

Array.prototype.isArray=true;

Array.prototype.mn_plus=function(p1){
/**Прибавляет к массиву коэффициентов многочлена, записанных по возрастанию степеней, другой такой массив.
Текущий массив не изменяет!
*/
	var b=this.slice()
	if(p1.isNumber){
		b[0]+=p1;
		return b;
	}
	if(!p1.isArray)
		return this;
	if(p1.length>this.length)
		return p1.mn_plus(this);

	var len=p1.length;
	for(var i=0; i<len;i++)
		b[i]+=p1[i];
	return b;
}

Array.prototype.mn_umn=function(p1){
/**Умножает массив коэффициентов многочлена, записанных по возрастанию степеней, на другой такой массив.
Текущий массив не изменяет!
*/
	var b=this.slice()
	if(p1.isNumber){
		return this.map(function(p2){return p1*p2;});
	}
	if(!p1.isArray){
		return this;
	}
	if(p1.length>this.length){
		return p1.mn_umn(this);
	}
	var c=p1.slice()
	var d=[];
	var len=p1.length;
	for(var i=0; i<len;i++){
		d=d.mn_plus(b.mn_umn(p1[i]));
		b.unshift(0);
	}
	return d;
}

Array.prototype.slag=function(){
/**Перемешивает массив в случайном порядке и радостно соединяет плюсиками.*/
	return this.shuffle().join('+');
}

Array.prototype.addPrefix=function(p1){
/**Добавляет к каждому элементы массива префикс p1.
Текущий массив не изменяет!*/
	return this.map(function(p2){return p1+p2;});
}

Array.prototype.toSum=function(a){
/**Возвращает массив, элементы которого пропорциональны элементам данного, но их сумма равна a или 1, если a не указано*/
	if(a==undefined)
		a=1;
	var s=this.sum();
	return this.map(function(p1){return a*p1/s});
}

Array.prototype.sumPyram=function(){
/**Присваивает каждому элементу массива значение суммы всех предыдущих*/
	for(var i=1;i<this.length;i++)
		this[i]+=this[i-1];
	return this;
}

Array.prototype.sVeroyatn=function(){
/**Возвращает номер элемента массива с вероятностью, пропорциональной значению элемента*/
	var th=this.toSum().sumPyram();
	var a=Math.random();
	var i;
	for(i=0; a>th[i] && i<th.length ;i++){};
	return i;
}

Array.prototype.hasElem=function(a){
/**Определяет, есть ли в массиве заданный элемент*/
	return this.some(function(p1){
		return p1==a;
	});
}

Array.prototype.hasElemStrict=function(a){
/**Определяет, есть ли в массиве заданный элемент - строго, с точностью до совпадения типов*/
	return this.some(function(p1){
		return p1===a;
	});
}

Array.prototype.matrToVect=function(n){
/**Раскладывает m-мерный массив в (m-n)-мерный. Если n не указано, то принимается равным 1.*/
	if(n>1)
		return this.matrToVect(n-1).matrToVect();
	else{
		var rez=[];
		var len=this.length;
		for(var i=0;i<len;i++){
			rez=rez.concat(this[i]);
		}
		return rez;
	}
}

Array.prototype.ob$=function(){
/**Возвращает массив, в котором элементы данного приведены к строкам и окружены символами $ (начало или конец формулы)*/
	return this.map(function(p1){
		return (''+p1).ob$();
	});
}

Array.prototype.sortDelDubl=function(p1){
/**Отсортировать копию массива по функции p1 (может быть опущена) и удалить дублирующиеся элементы*/
	if(this===[])
		return [];
	var a=this.slice().sort(p1);
	for(var i=0;i<a.length;i++)
		if(a[i]==a[i+1])
			a.splice(i--,1);
	return a;
}

Array.prototype.hasDubl=function(){
/**Есть ли в массиве дублирующиеся элементы*/
	if(this===[])
		return 0;
	var a=this.slice().sort();
	for(var i=0;i<a.length;i++)
		if(a[i]==a[i+1])
			return 1;
	return 0;
}

Array.prototype.matrixToTex=function(){
/**Возвращает строку - представление массива как матрицы в TeX-нотации.*/
	if(this==[])
		return '';
	return '\\begin{array}{c}'+
		this.map(function(p1){
			return p1.isArray?
				p1.join(' & '):
				p1;
		}).join('\\\\')+
		'\\end{array}';
}

Array.prototype.det=function(){
/**Функция-обёртка. Возвращает определитель матрицы.*/
	return Determinant(this);
}

Array.prototype.inv=function(){
/**Функция-обёртка. Возвращает обратную матрицу.*/
	return InverseMatrix(this);
}

Array.prototype.allStrToNum=function(){
/**Все строки, встречающиеся в массиве, превратить в числа (если получится).
Исходный массив не изменяет.*/
	return this.slice().map(function(elem){
		if(elem.isNumber)
			return elem;
		if(elem.isArray)
			return elem.allStrToNum();
		if(elem.isString)
			return elem.toNumberExt();
		return 0;
	});
}

Array.prototype.isLNez=function(){
/**Является ли система строк матрицы линейно независимой.*/
	var len=this.length;
	if(len<this[0].length){
		return this.T().isLNez();
	}
	if(len==this[0].length){
		return !!this.det();
	}
	for(var i=0;i<len;i++){
		var buf=this.slice();
		buf.splice(i,1);
		if(buf.isLNez())
			return 1;
	}
	return 0;
}

Array.prototype.testSLU=function(a,b,tochnost){
/**Является ли данный вектор решением СЛУ с матрицей a и столбцом свободных членов b
с точностью tochnost (всё-таки с float-ами фактически работаем).*/
	if(tochnost===undefined){
		tochnost=1e-5;
	}
	var len=a.length;
	if(!b){
		b=generateMatrix(len,1,0,0);
	}

	b=b.allStrToNum();
	a=a.allStrToNum();

	for(var i=0;i<len;i++){
		if( Math.abs( objUmn( [a[i]], this )[0][0]
			- b[i][0] ) > tochnost ){
			return 0;
		}
	}
	return 1;
}

Array.prototype.rk=function(){
/**Ранг матрицы. Функция-обёртка над rang_mat*/
	return rang_mat(this);
}

Array.prototype.isFSR=function(a){
/**Является ли данная матрица, в которой векторы - столбцы, ФСР для СЛОУ с матрицей a.*/
	var t=this.T();
	var len=t.length;

	a=a.allStrToNum();
	t=t.allStrToNum();

	if(!t.isLNez())
		return 0;
	if(a[0].length-a.rk() != len)
		return 0;

	for(var i=0;i<len;i++){
		if(![t[i]].T().testSLU(a))
			return 0;
	}
	return 1;
}

Array.prototype.isNullVect=function(){
/**Является ли вектор нулевым*/
	var len=this.length;
	for(var i=0;i<len;i++)
		if(this[i])
			return 0;
	return 1;
}

Array.prototype.hasNullVect=function(){
/**Есть ли в матрице нулевые векторы - строки или столбцы?*/	
	var len=this.length;
	for(var i=0;i<len;i++)
		if(this[i].isNullVect())
			return 1;
	var th=this.T();
	len=th.length;
	for(var i=0;i<len;i++)
		if(th[i].isNullVect())
			return 1;
	return 0;
}

Array.prototype.copyAr=function() {
/**Если массив содержит вложенные, slice не подходит*/
	var ar = [];
	for (var i=0; i<this.length; i++){
		if (Array.isArray(this[i])){
			ar[i] = this[i].copyAr();
		}
		else {
			ar[i] = this[i];
		}
	}
	return ar;
}

Array.prototype.equalAr=function(x1) {
/**Возвращает, равны ли this и x1*/
	var f=true;
	if (x1.length==this.length){
		var i=0;
		while (i<x1.length && f) {
			f=f&&(x1[i]==this[i]);
			i++;
		}
		return(f);
	}
	else return false;
}

Array.prototype.reverseElems=function(recursive){
	return this.map(function(p1){
		return recursive && p1.reverseElems ? p1.reverseElems(1) : p1.reverse();
	});
}

Array.prototype.hasCommon=function(arr){
/**Имеет ли данный массив и arr общие элементы?*/
	var len=arr.length;
	for(var i=0; i<len; i++)
		if(this.hasElem(arr[i]))
			return 1;
		return 0;
}

Array.prototype.delEmpty=function(){
/**Удалить из массива пустые строки и undefined*/
	var len=this.length;
	for(var i=0;i<len;i++){
		if(this[i]===undefined || this[i]==""){
			this.splice(i,1);
			len--;
			i--;
		}
	}
}

Array.prototype.trimStrings=function(){
/**Для каждой строки-элемента массива вызвать .trim()*/
	var len=this.length;
	for(var i=0;i<len;i++){
		this[i]=this[i].trim();
	}
}

Array.prototype.replaceStrings=function(p1,p2){
/**Для каждой строки-элемента массива вызвать .replace(p1,p2)*/
	var len=this.length;
	for(var i=0;i<len;i++){
		this[i]=this[i].replace(p1,p2);
	}
}

Array.prototype.delDublByProp=function(prop){
/**Удаление элементов массива, у которых свойства из массива строк prop совпадают с ранее рассмотренными.*/
	var rez=this.slice();
	rez=rez.sortBy(prop);
	var len=rez.length;
	var p=prop.length;
	for(var i=1;i<len;i++){
		if(!compareObjects(rez[i-1],rez[i],prop)){
			rez.splice(i,1);
			len--;
			i--;
		}
	}
	return rez;
}

Array.prototype.sortNumeric=function(){
/**Сортировка численного массива.*/
	return this.sort(function(a,b){
		return a-b;
	});
}

Array.prototype.sortNumericArr=function(){
/**Сортировка массива числовых массивов по первому элементу.*/
	return this.sort(function(a,b){
		return a[0]-b[0];
	});
}

Array.prototype.sortBy=function(prop){
/**Сортировка элементов массива по списку свойств prop, где prop - массив строк.*/
	return this.sort(function(a,b){
		return compareObjects(a,b,prop);
	});
	
}

Array.prototype.getVariety=function(prop){
/**Возвращает массив значений выбранного свойства элементов-объектов исходного массива.*/
	var len=this.length;
	var rez=[];
	for(var i=0;i<len;i++){
		if(this[i][prop]!==undefined){
			if(this[i][prop].isArray){
				rez=rez.concat(this[i][prop]);
			}else{
				rez.push(this[i][prop]);
			}
		}
	}
	return rez.sortDelDubl();
}

Array.prototype.addToGlobal('docsArray',1);

;;;
'use strict';

Array.prototype.mt_prov=function(kolvo){
/**Проверяет, можно ли трактовать каждый элемент массива как точку, т. е.
у каждого ли элемента массива есть свойства x и y,
и, если kolvo, то есть ли в данном массиве kolvo точек.*/
	if(this.length<kolvo)
		return 0;
	var fl=true;
	var len=this.length-1;
	for(;(len+1) && fl;len--)
		fl=fl&&(this[len].x!=undefined)&&(this[len].y!=undefined);
	return fl;
};

Array.prototype.mt_s3ug=function(){
/**Площадь треугольника, вершины которого - первые три элемента массива точек.*/
	if(!this.mt_prov(3))
		return 0;
	return 0.5*(this[0].x*this[1].y+this[0].y*this[2].x+this[1].x*this[2].y-this[1].y*this[2].x-this[2].y*this[0].x-this[0].y*this[1].x).abs();
};

Array.prototype.mt_tgUnakl=function(){
/**Возвращает тангенс угла наклона прямой, проходящей через две первые точки массива.*/
	if(!this.mt_prov(2))
		return undefined;
	if(!(this[0].y-this[1].y))
		return 0;
	return (this[0].y-this[1].y)/(this[0].x-this[1].x);
}

Array.prototype.mt_is3ug=function(){
/**Проверяет, образуют ли три данные точки треугольник. 
Можно использовать и для того, чтобы выяснить, лежат ли три данные точки на одной прямой.*/
	if(!this.mt_prov(3))
		return 0;
	return this.mt_tgUnakl()!=[this[1],this[2]].mt_tgUnakl();
};

Array.prototype.mt_uPeres=function(){
/**Угол пересечения прямых, проходящих через первые две пары точек.*/
	if(!this.mt_prov(4))
		return 0;
	var u=(this.mt_tgUnakl().atan()-[this[2],this[3]].mt_tgUnakl().atan()).abs();
	for(;u>=Math.PI;u=u-Math.PI){};
	for(;u>Math.PI/2;u=Math.PI-u){};
	return u;
};

Array.prototype.mt_isMnug=function(p1){
/**Проверяет, задаёт ли массив точек p1-угольник.
При вызове без параметра - многоугольник.*/
	if(
			(p1!=undefined)&&(this.length!=p1)
		||	(!this.mt_prov(3))
		||	(this.mt_dubli())
		||	(this.mt_estSamoper())
		){
			return 0;
	}
	
	var len=this.length-1;
	var fl=1;
	
	fl*=[this[0],this[len],this[len-1]].mt_is3ug();
	fl*=[this[0],this[1],this[len]].mt_is3ug();
	for(;len-1;len--)
		fl*=[this[len],this[len-1],this[len-2]].mt_is3ug();

	return fl;
};

Array.prototype.mt_rasst=function(){
/**Расстояние между двумя первыми точками массива.*/
	if(!this.mt_prov(2))
		return undefined;
	return ((this[0].x-this[1].x).pow(2)+(this[0].y-this[1].y).pow(2)).sqrt();
};

Array.prototype.mt_s4ug=function(){
/**Площадь четырёхугольника.*/
	if(!this.mt_isMnug(4))
		return undefined;
	return 0.5*[this[0],this[2]].mt_rasst()*[this[1],this[3]].mt_rasst()*
		[this[0],this[2],this[1],this[3]].mt_uPeres().sin();
};

Array.prototype.mt_dubli=function(){
/**Есть ли в массиве повторяющиеся точки*/
	if(!this.mt_prov())
		return undefined;
	var len;
	var l2;
	for(len=this.length-1;len+1;len--)
		for(l2=this.length-1;l2>len;l2--)
			if(this[len].x==this[l2].x&&this[len].y==this[l2].y)
				return 1;
	return 0;
};

Array.prototype.mt_pryam=function(){
/**Возвращает коэффициенты a и b прямой y=ax+b, проходящей через две первые точки.*/
	if(!this.mt_prov(2))
		return undefined;
	var a=this.mt_tgUnakl();
	if(a.abs()==Infinity)
		var b=this[0].x;
	else
		var b=this[0].y-a*this[0].x;
	return {a:a,b:b};
};

Array.prototype.mt_join=function(p1){
/**Возращает строку - координаты точек через запятую.*/
	if(!this.mt_prov())
		return undefined;
	if(!p1)
		p1=', ';
	var p2='';
	var len=this.length-1;
	for(var l2=0;l2<len;l2++)
		p2+='('+this[l2].x+'; '+this[l2].y+')'+p1;
	p2+='('+this[l2].x+'; '+this[l2].y+')';
	return p2;
}

Array.prototype.mt_otrPeres=function(){
/**Количество точек пересечения двух отрезков, задаваемых первыми парами точек.*/
	if(!this.mt_prov())
		return undefined;
	var p1=[[this[0],this[1]].mt_pryam(),[this[2],this[3]].mt_pryam()].mp_tPeres();
	if(p1.x==Infinity)
		return Infinity;
	else if(p1.x.mzhd(this[0].x,this[1].x,1)&&p1.x.mzhd(this[2].x,this[3].x,1)&&p1.y.mzhd(this[0].y,this[1].y,1)&&p1.y.mzhd(this[2].y,this[3].y,1))
		return 1;
	return 0;
}

Array.prototype.mt_estSamoper=function(){
/**Имеет ли ломанная, образованная точками, самопересечения.*/	
	if(!this.mt_prov(3))
		return undefined;
	var len=this.length;
	var th=this.concat(this,this);
	var fl=0;
	for(var l1=0;l1<len;l1++)
		for(var l2=l1+2;l2<=l1+len-2;l2++)
			fl+=[th[l1],th[l1+1],th[l2],th[l2+1]].mt_otrPeres();
	return fl;
}

Array.prototype.mt_ladMnug=function(){
/**Перемешивать точки до тех пор, пока не получится многоугольник.*/
	if(		(!this.mt_prov(3))
		||	(this.mt_dubli())
	)
		return 0;
	
	for(;!this.mt_isMnug();this.shuffle()){};
	//Крайне криво, но думать лень.
	return this;
}

Array.prototype.mt_perpend=function(){
/**Перпендикулярны ли прямые, задаваемые первыми двумя парами точек.*/
	return (this.mt_uPeres()==Math.PI/2);
}

Array.prototype.mt_paral=function(){
/**Параллельны ли прямые, задаваемые первыми двумя парами точек.*/
	return this.mt_uPeres()==0;
}

Array.prototype.mt_imen4ug=function(){
/**Называет четырёхугольник.*/
	if(!this.mt_isMnug(4)){return 0;};
	var A=this[0];
	var B=this[1];
	var C=this[2];
	var D=this[3];
	var prug=	([A,B,B,C].mt_perpend())&&
				([B,C,C,D].mt_perpend())&&
				([A,D,D,C].mt_perpend());
	var rstor=	([A,B].mt_rasst()==[A,D].mt_rasst())*
				([C,B].mt_rasst()==[C,D].mt_rasst())+
				([B,A].mt_rasst()==[B,C].mt_rasst())*
				([D,A].mt_rasst()==[D,C].mt_rasst());
	var paral=	([A,B,C,D].mt_paral())+
				([A,D,B,C].mt_paral());
	if(prug&&(rstor==2))
		return lx['квадрат'];
	else if(prug)
		return lx['прямоугольник'];
	else if(rstor==2)
		return lx['ромб'];
	else if(paral==2)
		return lx['параллелограмм'];
	else if(paral==1)
		return lx['трапеция'];
	else if(rstor==1)
		return lx['дельтоид'];
	else
		return lx['четырёхугольник'];
};

Array.prototype.addToGlobal('docsArray',1);

;;;
'use strict';

Array.prototype.mp_prov=function(){
/**Проверяет, можно ли трактовать массив как массив прямых, 
т. е. у каждого ли элемента массива есть свойства a и b*/
	var fl=true;
	var len=this.length-1;
	for(;(len+1)&&fl;len--)
		fl=fl&&(this[len].a!=undefined)&&(this[len].b!=undefined);
	return fl;
}

Array.prototype.mp_tPeres=function(){
/**Находит точку пересечения первых двух прямых.*/
	if(!this.mp_prov())
		return undefined;
	
	var x;
	var y;
	if(this[0].a.abs()==Infinity){
		x=this[0].b;
		y=this[1].a*x+this[1].b;
	}else if(this[1].a.abs()==Infinity){
		x=this[1].b;
		y=this[0].a*x+this[0].b;
	}else{
		var c=this[1].a-this[0].a;
		if(c==0)
			if(this[0].b==this[1].b)
				x=y=Infinity;
			else
				x=y=NaN;
		else{
			x=(this[0].b-this[1].b)/(this[1].a-this[0].a);
			y=this[0].a*x+this[0].b;
		}
	}	
	return {x:x,y:y};
}

Array.prototype.addToGlobal('docsArray',1);

;;;
'use strict';
Array.prototype.mn_proizv=function(){
/**Находит производную от многочлена, коэфф. которого в порядке возрастания степеней - элементы данного массива.*/
	var len=this.length;
	var th=[];
	for(var i=0;i<len-1;i++){
		th[i]=clone(this[i+1]);
		th[i]=Drob.fixN(th[i]);
		th[i].ch=th[i].ch*(i+1);
		Drob.sokr(th[i]);
	}
	return th;
}

Array.prototype.mn_vychisl=function(x){
/**Находит значение многочлена, коэфф. которого в порядке возрастания степеней - элементы данного массива,
при значении переменной, равном x*/
	var len=this.length;
	var s=0;
	for(var i=0;i<len;i++){
		this[i]=Drob.fixN(this[i]);
		s+=this[i].ch*x.pow(i)/this[i].zn;
	}
	return s;
}

Array.prototype.mn_txt=function(x){
/**TeX-представление многочлена, коэфф. которого в порядке возрастания степеней - элементы данного массива, x - символ переменной.*/
	var len=this.length;
	this[0]=Drob.fixN(this[0]);
	var s=this[0].ch.frac(this[0].zn).esli(this[0].ch);
	for(var i=1;i<len;i++){
		this[i]=Drob.fixN(this[i]);
		if(this[i].ch){
			s= this[i].ch.frac(this[i].zn)+x+('^{'+i+'}').esli(i!=1)
				+'+'+s;
		}
	}
	return s.plusminus();
}

Array.prototype.mn_pervoobr=function(){
/**Находит первообразную (C=0) от многочлена, коэфф. которого в порядке возрастания степеней - элементы данного массива.*/
	var len=this.length;
	var th=[0];
	for(var i=1;i<len+1;i++){
		th[i]=clone(this[i-1]);
		th[i]=Drob.fixN(th[i]);
		th[i].zn=th[i].zn*i;
		Drob.sokr(th[i]);
	}
	return th;
}

Array.prototype.mn_txtmas=function(x){
/**TeX-представление многочлена, коэфф. которого в порядке возрастания степеней - элементы данного массива, x - символ переменной, в виде массива выражений*/
	var len=this.length;
	this[0]=Drob.fixN(this[0]);
	var s=[this[0].ch.frac(this[0].zn).esli(this[0].ch)];
	for(var i=1;i<len;i++){
		this[i]=Drob.fixN(this[i]);
		if(this[i].ch){
			s.push(this[i].ch.frac(this[i].zn)+x+('^{'+i+'}').esli(i!=1));
		}
	}
	return s;
}

Array.prototype.addToGlobal('docsArray',1);

;;;
'use strict';

Array.prototype.pe_inv=function(){
/**Количество инверсий в перестановке, образованной элементами массива.*/
	var perest=0;
	var len=this.length;
	for(var i=0;i<len;i++)
		for(var j=i;j<len;j++)
			if(this[i]>this[j])
				perest++;
	return perest;
}

Array.prototype.pe_txt=function(){
/**Перестановка, образованная элементами массива, в TeX-нотации.*/
	return "$\\left("+this.join(";")+"\\right)$";
}

Array.prototype.addToGlobal('docsArray',1);

;;;
'use strict';

String.prototype.toZagl =
String.prototype.toCapitalized = function(){
/**Делает первую букву строки заглавной*/
	if(this=='')
		return '';
	return this[0].toUpperCase()+this.substr(1);//.toLowerCase();
};

String.prototype.tn=function(){
/**Возвращает число, если данная строка - запись числа с десятичной точкой или запятой.*/
	return 1*this.replace(',','.');
};

String.prototype.encodeURIComponent=function(){
	return encodeURIComponent(this);
}

String.prototype.decodeURIComponent=function(){
	return decodeURIComponent(this);
}

String.prototype.encodeURI=function(){
	return encodeURI(this);
}

String.prototype.decodeURI=function(){
	return decodeURI(this);
}

String.prototype.toNumberExt=function(){
/**Превращает арифметическое выражение (+-/*) в число.*/
	if(/[\s0-9\.,\+\-\*\/\(\)]+/.test(this)){
		try{
			return eval(this.replace(/\,/g,'.'));
		}catch(e){
		}
	}
	return 0;
}

String.prototype.toMtr=function(){
/**Превращает многострочный текст в матрицу строк.*/
	var t=this.
		replace(/<br[\/]*>/g,'\n').
		replace(/[\t]+/g,' ').
		trim();
	var a=t.split(/\s*[\n\r]+\s*/);
	var len=a.length;
	for (var i=0;i<len;i++)
		a[i]=a[i].split(/\s+/);
	return a;
}

String.prototype.istDataToStd=function(){
/**Приводит дату, записанную в одной из общепринятых форм, к записи "по стандарту". Применяется только в комплексе заданий по истории.*/
	var a=this;
	a=a.replace(/\s/g,'.');
	a=a.replace(/\//g,'.');
	a=a.replace(/[-]/g,'.');
	a=a.replace(/[,]/g,'.');
	a=a.replace(/ю/g,'.');
	a=a.replace(/[.]+/g,'.');
	a=a.replace(/[.]0/g,'.');
	a=a.replace(/^0/g,'');
	a=a.replace(/^[.]/g,'');
	//Убираем г. в конце, если есть
	a=a.replace(/[.]$/g,'');
	a=a.replace(/г$/g,'');
	a=a.replace(/[.]$/g,'');
	//Теперь меняем номер месяца на месяц
	a=a.replace(/[.]1[.]/g, ' января '	);
	a=a.replace(/[.]2[.]/g, ' февраля '	);
	a=a.replace(/[.]3[.]/g, ' марта '	);
	a=a.replace(/[.]4[.]/g, ' апреля '	);
	a=a.replace(/[.]5[.]/g, ' мая '		);
	a=a.replace(/[.]6[.]/g, ' июня '	);
	a=a.replace(/[.]7[.]/g, ' июля '	);
	a=a.replace(/[.]8[.]/g, ' августа '	);
	a=a.replace(/[.]9[.]/g, ' сентября ');
	a=a.replace(/[.]10[.]/g,' октября '	);
	a=a.replace(/[.]11[.]/g,' ноября '	);
	a=a.replace(/[.]12[.]/g,' декабря '	);
	//И наконец, если исправление буквы "ю" на точку привело к повреждению названия месяца:
	a=a.replace(/и[.]ня/g, 'июня'	);
	a=a.replace(/и[.]ля/g, 'июля'	);
	//Меняем точки на пробелы
	a=a.replace(/[.]/g, ' '	);

	a=a+' г.';

	return a;
};

String.prototype.isLetter=function() {
/**проверяет, буква ли данный символ*/
	var d = (this.length==1) && (this.search(/[a-z]/)!=-1);
	return d;
}

String.prototype.isGl=function() {
/**проверяет, гласная ли данный символ*/
	var d = (this.search(/[aeiou]/)!=-1) && (this.length==1);
	return d;
}

String.prototype.cepZamena=function(mas1, mas2){
/**Заменяет i-й символ из массива mas1 i-м символом из массива mas2*/
	var len=this.length;
	var rez='';
	var fl;
	for(var i=0; i<len; i++){
		fl=1;
		for(var j=0;j<26 && fl;j++){
			if(this[i]==mas1[j]){
				rez+=mas2[j];
				fl=0;
			}
		}
		if(fl){
			rez+=this[i];
		}
	}
	return rez;
}

String.prototype.isNumeric=function(){
/**Является ли строка числом, возможно, с десятичной точкой или запятой?*/
	return /^-?[0-9]+([.,][0-9])?$/.test(this);
}

String.prototype.isCyrillicWord=function(){
/**Является ли строка русским словом?*/
	return /^[А-Яа-яЁё\-]+$/.test(this);
}

String.prototype.transliterate = (
/**Транслитерация, отображающая кириллицу на множество валидных идентификаторов*/
//http://javascript.ru/forum/misc/27347-nadezhnyjj-dvukhstoronnijj-translit.html
    function() {
        var
            rus = "щ   ш  ч  ц  ю  я  ё  ж  ъ  ы  э  а б в г д е з и й к л м н о п р с т у ф х ь".split(/ +/g),
            eng = "shh sh ch cz yu ya yo zh __ y_ e_ a b v g d e z i j k l m n o p r s t u f x _".split(/ +/g)
        ;
        return function(engToRus) {
            var x;
            var text=this;
            for(x = 0; x < rus.length; x++) {
                text = text.split(engToRus ? eng[x] : rus[x]).join(engToRus ? rus[x] : eng[x]);
                text = text.split(engToRus ? eng[x].toUpperCase() : rus[x].toUpperCase()).join(engToRus ? rus[x].toUpperCase() : eng[x].toUpperCase());
            }
            return text;
        }
    }
)();

String.prototype.replaceCode = function(code, explanations){
	if(explanations.isString){
		explanations=[explanations];
	}
	var text=this;
	var len=explanations.length;
	for(var i=0;i<len;i++){
		text=text.replace(code,explanations[i]);
		//Внимание: заменяется одно вхождение на каждой итерации цикла
	}
	return text;
}

String.prototype.isString=true;

String.prototype.addToGlobal('docsString',1);


;;;
'use strict';

if(typeof(Fraction) === 'undefined'){
	try{
		var Fraction = require('fractional').Fraction;
	} catch(e){
	}
}

Number.prototype.toFixedLess=function(n){
/**Возвращает строку - представление числа с не более чем n знаками после запятой.*/
	var a=this.toFixed(n);
	for(;a.posl()=='0'&&a.search(/[.]/)!=-1;a=a.udalPosl()){};
	for(;a.posl()=='.';a=a.udalPosl()){};
	return a;
}

Number.prototype.pm=function(){
/**Случайным образом возвращает число или ему противоположное.*/
	return sl1()?0+this:0-this;
	//Да, именно так, а не просто -this или this, ибо тогда оно в нестриктовом режиме возвращает объект.
	//return sl1()?this:-this;
}

Number.prototype.dopdo=function(c,n){
/**Возвращает строковое представление числа, дополненное спереди строками c до длины не менее n*/
	return (''+this).dopdo(c,n);
}

Number.prototype.isZ=function(){
/**Проверяет, является ли число целым.*/
	return this-this.floor()==0;
}

Number.prototype.isPolnKvadr=function(){
/**Проверяет, является ли число полным квадратом.*/
	return this.sqrt().isZ();
}

Number.prototype.ts=
Number.prototype.toStandart=function(p1){
/**Возвращает представление числа в записи "по стандарту": с десятичной запятой и не более чем 10 знаками после неё.
Для отсечения "ложной точности" хватает.*/
	return this.toFixedLess(10).toStandart(p1);
}

Number.prototype.mzhd=function(a,b,c){
/**Находится ли число между a и b, если c - то включительно. a и b можно не упорядочивать.*/
	var p1=[a,b];
	var p2=p1[p1.max()];
	var p3=p1[p1.min()];
	return (this<p2)&&(this>p3)||((this==p2)||(this==p3))&&(!!c);
}

Number.prototype.polozh=function(){
/**Если число положительно, вернёт его, иначе 0.*/
	return this<0?0:0+this;
}

Number.prototype.nod=function(p1){
/**НОД данного числа и p1*/
	var a,b;
	a=this<0?0-this:0+this;
	b=p1<0?-p1:p1;
	if(a==b) return a;
	if((a==1)||(b==1))return 1;
	if(a==0) return b;
	if(b==0) return a;
	if(a>b) return b.nod(a%b);
			return a.nod(b%a);
}

Number.prototype.pina=
Number.prototype.texfracpi=function(p1){
/**TeX-представление дроби, у которой в числителе данное число, умноженное на пи, а в знаменателе p1.
Случай p1=1 учитывается.*/
	return this.frac(p1,'\\pi');
}

Number.prototype.koren = // Deprecated
Number.prototype.texsqrt = function(p1,p2){
/**TeX-представление корня из данного числа.
Если данное число - полный квадрат, то корень из числа.
Если p1, то из-под корня будут вынесены возможные множители.
Если p1, p2 и из-под корня выносится единица, то она будет опущена.*/
	if(this.isPolnKvadr())
		return this.sqrt().ts();
	var a='';
	var t=this;
	if(p1){
		a=this.polnKvadrMnozh();
		t=t/a.sqr();
	}
	return a.printIf(a != 1 || p2)+'\\sqrt{'+t.ts()+'}';
}

Number.prototype.printIf = function(condition) {
	return (''+this).printIf(condition);
}

Number.prototype.polnKvadrMnozh=function(){
/**Максимальный делитель данного числа, квадрат которого также является делителем данного числа.*/
	if(this==0)
		return 0;
	var t=this.abs();
	var i=1;
	for(var rez=1;i.sqr()<=t;i++)
		if(t.kratno(i.sqr()))
			rez=i;
	return rez;
}

Number.prototype.fracstr=//Depracated, нафига их плодить?
Number.prototype.frac=//Deprecated, вообще в отдельную либу пойдут!
Number.prototype.texfrac=function(p1,str){
/**TeX-представление дроби с числителем - произведением данного числа и строки str и знаменателем p1.
Случай p1=1 учитывается.*/
	str || (str='');
	if(p1.isString)
		return (
			p1!=1?
			(this<0?'-':'')+'\\frac{'+this.abs()+str+'}{'+p1+'}':
			'{'+this+str+'}'
		);

	var a1=new Fraction(this,p1);

	if(!a1.numerator)
		return '0';
	var z='';
	if(a1.numerator<0){
		z='-';
		a1.numerator*=-1;
	}
	var numerator = (a1.numerator==1 && str!=''?'':a1.numerator) + str;
	return z+(a1.denominator!=1?'\\frac{'+numerator+'}{'+a1.denominator+'}':numerator);

}

Number.prototype.texsqrtfrac = function(denominator) {
	if(this === 0)
		return '0';
	var frac = new Fraction(1*this, denominator);
	var additiveMultiplier = frac.denominator / frac.denominator.polnKvadrMnozh().sqr();
	return (frac.numerator * additiveMultiplier).texsqrt(true).texfrac((frac.denominator*additiveMultiplier).sqrt());
};


Number.prototype.kratno=function(p1){
/**Кратно ли данное число p1*/
	return !(this%p1);
}

Number.prototype.delit=function(p1){
/**Является ли данное число делителем p1*/
	return !(p1%this);
}

Number.prototype.sluchDel=function(){
/**Возвращает случайный делитель числа.*/
	for(var r=this+1;!this.kratno(r);r=sluchch(1,this)){};
	return r;
}

Number.prototype.isPrime = function() {
/**Является ли число простым?*/
	var s = this.sqrt().floor();
	for (var i = 2; i <= s; i++) {
		if (!(this%i)) {
			return false;
		}
	}
	return true;
};

Number.prototype.nextPrime = function() {
/**Найти ближайшее не меньшее простое число*/
	for (var i = this.ceil(); ; i++) {
		if (i.isPrime()) {
			return i;
		}
	}
};


Number.prototype.toChMin=function(){
/**Трактует число как количество минут и возвращает строку вида "A часов B минут".*/
	var a=(this/60).floor();
	var b=this%60;
	return chislitlx(a,'час').esli(a)+' '.esli(a&&b)+chislitlx(b,'минута').esli(b);
}

Number.prototype.chislit=function(p1,p2,p3){
/**Вспомогательная функция для согласования существительного с числительным.*/
	return chislit(this,p1,p2,p3);
}

Number.prototype.chislitM=function(p1,p2,p3){
/**Вспомогательная функция для согласования существительного с числительным.*/
	return chislitM(this,p1,p2,p3);
}

Number.prototype.chislitlx=function(p1,p2){
/**Возвращает строку, состоящую из данного числа и подходящего падежа слова p1, при этом
полученное словосочетанию стоит в падеже p2 (если не указан - именительный).*/
	return chislitlx(this,p1,p2);
}

Number.prototype.min=function(){
/**Минимум из данного числа и всех аргументов функции.*/
	var a=Array.prototype.slice.call(arguments);
	a.push(this);
	return a.minE();
}

Number.prototype.max=function(){
/**Максиимум из данного числа и всех аргументов функции.*/
	var a=Array.prototype.slice.call(arguments);
	a.push(this);
	return a.maxE();
}

Number.prototype.plusminus=Number.prototype.ts;

Number.prototype.proporMezhdu=function(k,pr){
/**Возвращает число, лежащее между данным и k пропорционально pr*/
	return this+(k-this)*pr;
}

Number.prototype.toDvoet=function(a){
/**Представить число в виде "часы-минуты" с двоеточием.*/
	if(!a)
		a=60;
	return Math.floor(this/60)+':'+Math.floor(this%60).dopdo('0',2);
}

Number.prototype.okrugldo=function(p1){
/**Округлить число до кратных p1*/
	return okrugldo(this,p1);
}

Number.prototype.fct=function(){
/**Факториал числа*/
	return this>0?(this-1).fct()*this:1;
}

Number.prototype.rub=function(){
/**Возвращает строку вида this рублей*/
	return chislitlx(this,'рубль');
}

Number.prototype.toComplex=function(){
/**Представляет число в виде чисто действительного комплексного*/
	return new Complex(this);
}

Number.prototype.negativeBrackets=function(){
/**Отрицательное число берётся в скобки*/
	return this < 0 ? "(" + this + ")" : "" + this;
}

Number.prototype.reverseInField = function(E) {
/**Обращает число по модулю E*/
	// TODO: более вменяемый алгоритм
	for (var i = 2; i < E; i++) {
		if (this*i%E === 1) {
			return i;
		}
	}
	// А нефиг непростые брать, undefined
};

Number.prototype.powInField = function(E,p) {
	// TODO: более вменяемый алгоритм
	var rez = 1;
	for (var i = 0; i < p; i++) {
		rez *= this;
		rez %= E;
	}
	return rez;
}

Number.prototype.isNumber=true;

Number.prototype.addToGlobal('docsNumber',1);

;;;
'use strict';

Number.prototype.pow=function(n){
/**Возвращает число в степени n*/
	return Math.pow(this,n);
}

Number.prototype.sqrt=function(){
/**Квадратный корень из числа.*/
	return Math.sqrt(this);
}

Number.prototype.sqr=function(){
/**Квадрат числа.*/
	return Math.pow(this,2);
}
Number.prototype.abs=function(){
/**Модуль числа.*/
	return Math.abs(this);
}

Number.prototype.floor=function(){
/**Округлить число до целых в меньшую сторону.*/
	return Math.floor(this);
}

Number.prototype.ceil=function(){
/**Округлить число до целых в большую сторону.*/
	return Math.ceil(this);
}

Number.prototype.arctg=
Number.prototype.atan=function(){
/**Арктангенс числа.*/
	return Math.atan(this);
}

Number.prototype.arcsin=
Number.prototype.asin=function(){
/**Арксинус числа.*/
	return Math.asin(this);
}

Number.prototype.arccos=
Number.prototype.acos=function(){
/**Арккосинус числа.*/
	return Math.acos(this);
}

Number.prototype.arcctg=function(){
/**Аркотангенс числа.*/
	return Math.atan(1/this);
}

Number.prototype.sin=function(){
/**Синус числа.*/
	return Math.sin(this);
}

Number.prototype.cos=function(){
/**Косинус числа.*/
	return Math.cos(this);
}

Number.prototype.tg=
Number.prototype.tan=function(){
/**Тангенс числа.*/
	return Math.tan(this);
}

Number.prototype.ctg=function(){
/**Котангенс числа.*/
	return 1/Math.tan(this);
}

Number.prototype.round=function(){
/**Округление числа до целых.*/
	return Math.round(this);
}

Number.prototype.addToGlobal('docsNumber',1);

;;;
'use strict';

CanvasRenderingContext2D.prototype.drawLine=function(x1,y1,x2,y2){
	this.beginPath();
	this.moveTo(x1,y1);
	this.lineTo(x2,y2);
	this.stroke();
	this.closePath();
}

CanvasRenderingContext2D.prototype.setka=function(s,n){
	for(var i=-n;i<=n;i++){
		this.drawLine(-s*n,s*i,s*n,s*i);
		this.drawLine(s*i,-s*n,s*i,s*n);
	}
}

CanvasRenderingContext2D.prototype.setkaXY=function(s,n1,n2,n3,n4){
	for(var i=n1;i<=n2;i++){
		this.drawLine(s*i,s*n3,s*i,s*n4);
	}
	for(i=n3;i<=n4;i++){
		this.drawLine(s*n1,s*i,s*n2,s*i);
	}
}

CanvasRenderingContext2D.prototype.fillKrug=function(x,y,r){
	this.beginPath();
	this.arc(x,y, r, 0, 2*Math.PI, false);
	this.fill();
}

CanvasRenderingContext2D.prototype.drawLineSpec=function(x1,y1,x2,y2){
	var m = (x1-x2);
	var n = (y1-y2);
	var k = (n/m);

	if(x1==x2){
		for(var iy = Math.min(y1,y2); iy < Math.max(y1,y2); iy += 14){
			this.drawLine(x1,iy,x1,iy+7);
		}
	}

	if(y1==y2){
		for(var ix = Math.min(x1,x2); ix < Math.max(x1,x2); ix += 14){
			this.drawLine(ix, y1, ix+7, y1);
		}
	}

	if((x2>x1)&(y2>y1)){
		for (var ix=x1+7; ix<x2; ix+=14){
			this.drawLine(ix, y1+ix-x1, ix+7, y1+ix-x1+7);
		}
	}

	if((x2>x1)&(y2<y1)){
		for (var ix=x1+7; ix<x2; ix+=14){
			this.drawLine(ix, y1-ix-x1, ix+7, y1-ix-x1-7);
		}
	}

	if((x2<x1)&(y2<y1)){
		for (var ix=x2+7; ix<x1; ix+=14){
			this.drawLine(ix, y2+ix-x2, ix+7, y2+ix-x2+7);
		}
	}

	if((x2<x1)&(y2>y1)){
		for (var ix=x2+7; ix<x1; ix+=14){
			this.drawLine(ix, y2-ix+x2, ix+7, y2-ix+x2-7);
		}
	}
}

CanvasRenderingContext2D.prototype.drawArrow=function(x1, y1, x2, y2, arrowType) {
	var startA = 10;
	var startB = 3.75;
	var startC = Math.sqrt(Math.pow(startA, 2) + Math.pow(startB, 2));
	var change_arrow_radians = Math.atan2(startB, startA);
	//Calculate the change of the arrow head (i.e. horizontal, vertical or diagonal)
	var change_x_main = Math.abs(x1 - x2); //Adjacent
	var change_y_main = Math.abs(y1 - y2); //Opposite
	var change_angle_radians = Math.atan2(change_y_main, change_x_main);
	var change_angle_degrees = change_angle_radians * ( 180 / Math.PI);
	var change_x_0_arrowhead = Math.cos(change_angle_radians + change_arrow_radians) * startC;
	var change_y_0_arrowhead = Math.sin(change_angle_radians + change_arrow_radians) * startC;
	var change_x_1_arrowhead = Math.cos(change_angle_radians - change_arrow_radians) * startC;
	var change_y_1_arrowhead = Math.sin(change_angle_radians - change_arrow_radians) * startC;
	this.beginPath();

	/*Determines type of arrow*/
	if (arrowType == true) {
		if (((x1 < x2) && (y1 > y2)) || ((x1 == x2) && (y1 > y2))) {
			this.moveTo(x1, y1);
			this.lineTo(x2, y2);
			this.moveTo(x1 + change_x_0_arrowhead, y1 - change_y_0_arrowhead);
			this.lineTo(x1, y1);
			this.lineTo(x1 + change_x_1_arrowhead, y1 - change_y_1_arrowhead);
		} else if ((x1 > x2) && (y1 > y2)) {
			this.moveTo(x1, y1);
			this.lineTo(x2, y2);
			this.moveTo(x1 - change_x_0_arrowhead, y1 - change_y_0_arrowhead);
			this.lineTo(x1, y1);
			this.lineTo(x1 - change_x_1_arrowhead, y1 - change_y_1_arrowhead);
		} else if (((x1 < x2) && (y1 < y2)) || ((x1 < x2) && (y1 == y2))) {
			this.moveTo(x1, y1);
			this.lineTo(x2, y2);
			this.moveTo(x1 + change_x_0_arrowhead, y1 + change_y_0_arrowhead);
			this.lineTo(x1, y1);
			this.lineTo(x1 + change_x_1_arrowhead, y1 + change_y_1_arrowhead);
		} else if (((x1 > x2) && (y1 < y2)) || ((x1 > x2) && (y1 == y2)) || ((x1 == x2) && (y1 < y2))) {
			this.moveTo(x1, y1);
			this.lineTo(x2, y2);
			this.moveTo(x1 - change_x_0_arrowhead, y1 + change_y_0_arrowhead);
			this.lineTo(x1, y1);
			this.lineTo(x1 - change_x_1_arrowhead, y1 + change_y_1_arrowhead);
		}
	}else { //To the outside of the circle
		if (((x1 < x2) && (y1 > y2)) || ((x1 < x2) && (y1 == y2)) || ((x1 == x2) && (y1 > y2))) {
			this.moveTo(x1, y1);
			this.lineTo(x2, y2);
			this.moveTo(x2 - change_x_0_arrowhead, y2 + change_y_0_arrowhead);
			this.lineTo(x2, y2);
			this.lineTo(x2 - change_x_1_arrowhead, y2 + change_y_1_arrowhead);
		} else if (((x1 > x2) && (y1 > y2)) || ((x1 > x2) && (y1 == y2))){
			this.moveTo(x1, y1);
			this.lineTo(x2, y2);
			this.moveTo(x2 + change_x_0_arrowhead, y2 + change_y_0_arrowhead);
			this.lineTo(x2, y2);
			this.lineTo(x2 + change_x_1_arrowhead, y2 + change_y_1_arrowhead);
		} else if (x1 < x2 && y1 < y2){
			this.moveTo(x1, y1);
			this.lineTo(x2, y2);
			this.moveTo(x2 - change_x_0_arrowhead, y2 - change_y_0_arrowhead);
			this.lineTo(x2, y2);
			this.lineTo(x2 - change_x_1_arrowhead, y2 - change_y_1_arrowhead);
		} else if (((x1 > x2) && (y1 < y2)) || ((x1 == x2) && (y1 < y2))) {
			this.moveTo(x1, y1);
			this.lineTo(x2, y2);
			this.moveTo(x2 + change_x_0_arrowhead, y2 - change_y_0_arrowhead);
			this.lineTo(x2, y2);
			this.lineTo(x2 + change_x_1_arrowhead, y2 - change_y_1_arrowhead);
		}
	}
	this.stroke();
}

CanvasRenderingContext2D.prototype.isCanvasRenderingContext2D=true;

/*Иначе огнелисичка матюкается
var docsCanvas;
if(!docsCanvas)
	docsCanvas={};

for(var chto in CanvasRenderingContext2D.prototype){
	docsCanvas[chto]=CanvasRenderingContext2D.prototype[chto];
//	Object.defineProperty(CanvasRenderingContext2D.prototype, chto, { enumerable: false });
}*/

;;;
'use strict';

RegExp.prototype.isRegExp=true;

RegExp.prototype.addToGlobal('docsRegExp',1);

;;;
'use strict';

Function.prototype.toStr=function(){
/**Возвращает код функции в виде строки*/
	return ''+this;
}

Function.prototype.telo=function(){
/**Возвращает тело функции в виде строки*/
	return this.toStr().replace(/}$/,'').replace(/^function \(.*\){/,'');
}

Function.prototype.zagl=function(){
/**Возвращает заголовок функции в виде строки*/
	return /^function \(.*\)/.exec(this.toStr())[0];
}

Function.prototype.attr=function(){
/**Возвращает список параметров функции в виде строки*/
	return this.zagl().replace(/^function /,'');
}

Function.prototype.codeComment=function(){
/**Возвращает первый документационный комментарий внутри функции - такой, как этот.*/
	try{
	return /\/\*\*.*?[\s\S]*?\*\//m.
		exec(this.toStr())[0].
		replace(/^\/\*\*/,'').
		replace(/\*\/$/,'');
	}catch(e){
		return '';
	}
}

Function.prototype.isFunction=true;

Function.prototype.addToGlobal('docsFunction',1);

;;;
////////////////////////////////////////////////////////////////////////
//
//	ie: именительный	падеж единственного	числа
//	re: родительный		падеж единственного	числа
//	de: дательный		падеж единственного	числа
//	ve: винительный		падеж единственного	числа
//	te: творительный	падеж единственного	числа
//	pe: предложный		падеж единственного	числа
//	ie: именительный	падеж множественного	числа
//	re: родительный		падеж множественного	числа
//	de: дательный		падеж множественного	числа
//	ve: винительный		падеж множественного	числа
//	te: творительный	падеж множественного	числа
//	pe: предложный		падеж множественного	числа
//
//	rod: род:
//		0: мужской
//		1: женский
//		2: средний
//		3: только множественное число
//
//	odu: одушевлённость:
//		0: неодушевлённое
//		1: одушевлённое
//
//	skl: склонение:
//		0: несклоняемое
//		1: первое
//		2: второе
//		3: третье
//		4: разносклоняемые существительные
////////////////////////////////////////////////////////////////////////
if(lx==undefined)
	var lx=[];	//Объявляем глобальный объект lx
////////////////////////////////////////////////////////////////////////


//{{Существительные
lx['август']={
	ie:'август',
	re:'августа',
	de:'августу',
	ve:'август',
	te:'августом',
	pe:'августе',
	im:'августы',
	rm:'августов',
	dm:'августам',
	vm:'августы',
	tm:'августами',
	pm:'августах',
	rod:0,
	skl:2,
	odu:0,
};
lx['Австралия']={
	ie:'Австралия',
	re:'Австралии',
	de:'Австралии',
	ve:'Австралию',
	te:'Австралией',
	pe:'Австралии',
	im:'Австралии',
	rm:'Австралий',
	dm:'Австралиям',
	vm:'Австралии',
	tm:'Австралиями',
	pm:'Австралиях',
	rod:1,
	skl:1,
	odu:0,
};
lx['Австрия']={
	ie:'Австрия',
	re:'Австрии',
	de:'Австрии',
	ve:'Австрию',
	te:'Австрией',
	pe:'Австрии',
	im:'Австрии',
	rm:'Австрий',
	dm:'Австриям',
	vm:'Австрии',
	tm:'Австриями',
	pm:'Австриях',
	rod:1,
	skl:1,
	odu:0,
};
lx['автобус']={
	ie:'автобус',
	re:'автобуса',
	de:'автобусу',
	ve:'автобус',
	te:'автобусом',
	pe:'автобусе',
	im:'автобусы',
	rm:'автобусов',
	dm:'автобусам',
	vm:'автобусы',
	tm:'автобусами',
	pm:'автобусах',
	rod:0,
	skl:2,
	odu:0,
};
lx['автомобиль']={
	ie:'автомобиль',
	re:'автомобиля',
	de:'автомобилю',
	ve:'автомобиль',
	te:'автомобилем',
	pe:'автомобиле',
	im:'автомобили',
	rm:'автомобилей',
	dm:'автомобилям',
	vm:'автомобили',
	tm:'автомобилями',
	pm:'автомобилях',
	rod:0,
	skl:2,
	odu:0,
};
lx['аквариум']={
	ie:'аквариум',
	re:'аквариума',
	de:'аквариуму',
	ve:'аквариум',
	te:'аквариумом',
	pe:'аквариуме',
	im:'аквариумы',
	rm:'аквариумов',
	dm:'аквариумам',
	vm:'аквариумы',
	tm:'аквариумами',
	pm:'аквариумах',
	rod:0,
	skl:2,
	odu:0,
};
lx['Анастасия']={
	ie:'Анастасия',
	re:'Анастасии',
	de:'Анастасии',
	ve:'Анастасию',
	te:'Анастасией',
	pe:'Анастасии',
	im:'Анастасии',
	rm:'Анастасий',
	dm:'Анастасиям',
	vm:'Анастасий',
	tm:'Анастасиями',
	pm:'Анастасиях',
	rod:1,
	skl:1,
	odu:1,
	sbs:1,
};
lx['Анатольевна']={
	ie:'Анатольевна',
	re:'Анатольевны',
	de:'Анатольевне',
	ve:'Анатольевну',
	te:'Анатольевной',
	pe:'Анатольевне',
	im:'Анатольевны',
	rm:'Анатольевн',
	dm:'Анатольевнам',
	vm:'Анатольевн',
	tm:'Анатольевнами',
	pm:'Анатольевнах',
	rod:1,
	skl:1,
	odu:1,
	sbs:1,
};
lx['Англия']={
	ie:'Англия',
	re:'Англии',
	de:'Англии',
	ve:'Англию',
	te:'Англией',
	pe:'Англии',
	im:'Англии',
	rm:'Англий',
	dm:'Англиям',
	vm:'Англии',
	tm:'Англиями',
	pm:'Англиях',
	rod:1,
	skl:1,
	odu:0,
	sbs:1,
};
lx['апрель']={
	ie:'апрель',
	re:'апреля',
	de:'апрелю',
	ve:'апрель',
	te:'апрелем',
	pe:'апреле',
	im:'апрели',
	rm:'апрелей',
	dm:'апрелям',
	vm:'апрели',
	tm:'апрелями',
	pm:'апрелях',
	rod:0,
	skl:2,
	odu:0,
};
lx['аспирантка']={
	ie:'аспирантка',
	re:'аспирантки',
	de:'аспирантке',
	ve:'аспирантку',
	te:'аспиранткой',
	pe:'аспирантке',
	im:'аспирантки',
	rm:'аспиранток',
	dm:'аспиранткам',
	vm:'аспиранток',
	tm:'аспирантками',
	pm:'аспирантках',
	rod:1,
	skl:1,
	odu:0,
};
lx['атомоход']={
	ie:'атомоход',
	re:'атомохода',
	de:'атомоходу',
	ve:'атомоход',
	te:'атомоходом',
	pe:'атомоходе',
	im:'атомоходы',
	rm:'атомоходов',
	dm:'атомоходам',
	vm:'атомоходы',
	tm:'атомоходами',
	pm:'атомоходах',
	rod:0,
	skl:2,
	odu:0,
};
lx['бадминтон']={
	ie:'бадминтон',
	re:'бадминтона',
	de:'бадминтону',
	ve:'бадминтон',
	te:'бадминтоном',
	pe:'бадминтоне',
	im:'бадминтоны',
	rm:'бадминтонов',
	dm:'бадминтонам',
	vm:'бадминтоны',
	tm:'бадминтонами',
	pm:'бадминтонах',
	rod:0,
	skl:2,
	odu:0,
};
lx['батон']={
	ie:'батон',
	re:'батона',
	de:'батону',
	ve:'батон',
	te:'батоном',
	pe:'батоне',
	im:'батоны',
	rm:'батонов',
	dm:'батонам',
	vm:'батоны',
	tm:'батонами',
	pm:'батонах',
	rod:0,
	skl:2,
	odu:0,
};
lx['Беларусь']={
	ie:'Беларусь',
	re:'Беларуси',
	de:'Беларуси',
	ve:'Беларусь',
	te:'Беларусью',
	pe:'Беларуси',
	im:'Беларуси',
	rm:'Беларусей',
	dm:'Беларусям',
	vm:'Беларуси',
	tm:'Беларусями',
	pm:'Беларусях',
	rod:1,
	skl:3,
	odu:0,
};
lx['Белоруссия']={
	ie:'Белоруссия',
	re:'Белоруссии',
	de:'Белоруссии',
	ve:'Белоруссию',
	te:'Белоруссией',
	pe:'Белоруссии',
	im:'Белоруссии',
	rm:'Белоруссий',
	dm:'Белоруссиям',
	vm:'Белоруссии',
	tm:'Белоруссиями',
	pm:'Белоруссиях',
	rod:1,
	skl:1,
	odu:0,
	sbs:1,
};
lx['Бельгия']={
	ie:'Бельгия',
	re:'Бельгии',
	de:'Бельгии',
	ve:'Бельгию',
	te:'Бельгией',
	pe:'Бельгии',
	im:'Бельгии',
	rm:'Бельгий',
	dm:'Бельгиям',
	vm:'Бельгии',
	tm:'Бельгиями',
	pm:'Бельгиях',
	rod:1,
	skl:1,
	odu:0,
};
lx['бензин']={
	ie:'бензин',
	re:'бензина',
	de:'бензину',
	ve:'бензин',
	te:'бензином',
	pe:'бензине',
	im:'бензины',
	rm:'бензинов',
	dm:'бензинам',
	vm:'бензины',
	tm:'бензинами',
	pm:'бензинах',
	rod:0,
	skl:2,
	odu:0,
};
lx['бетон']={
	ie:'бетон',
	re:'бетона',
	de:'бетону',
	ve:'бетон',
	te:'бетоном',
	pe:'бетоне',
	im:'бетоны',
	rm:'бетонов',
	dm:'бетонам',
	vm:'бетоны',
	tm:'бетонами',
	pm:'бетонах',
	rod:0,
	skl:2,
	odu:0,
};
lx['благодать']={
	ie:'благодать',
	re:'благодати',
	de:'благодати',
	ve:'благодать',
	te:'благодатью',
	pe:'благодати',
	im:'благодати',
	rm:'благодатей',
	dm:'благодатям',
	vm:'благодати',
	tm:'благодатями',
	pm:'благодатях',
	rod:1,
	skl:3,
	odu:0,
};
lx['блондинка']={
	ie:'блондинка',
	re:'блондинки',
	de:'блондинке',
	ve:'блондинку',
	te:'блондинкой',
	pe:'блондинке',
	im:'блондинки',
	rm:'блондинок',
	dm:'блондинкам',
	vm:'блондинок',
	tm:'блондинками',
	pm:'блондинках',
	rod:1,
	skl:1,
	odu:0,
};
lx['болезнь']={
	ie:'болезнь',
	re:'болезни',
	de:'болезни',
	ve:'болезнь',
	te:'болезнью',
	pe:'болезни',
	im:'болезни',
	rm:'болезней',
	dm:'болезням',
	vm:'болезни',
	tm:'болезнями',
	pm:'болезнях',
	rod:1,
	skl:3,
	odu:0,
	sbs:0,
	chr:1,
};
lx['Бразилия']={
	ie:'Бразилия',
	re:'Бразилии',
	de:'Бразилии',
	ve:'Бразилию',
	te:'Бразилией',
	pe:'Бразилии',
	im:'Бразилии',
	rm:'Бразилий',
	dm:'Бразилиям',
	vm:'Бразилии',
	tm:'Бразилиями',
	pm:'Бразилиях',
	rod:1,
	skl:1,
	odu:0,
};
lx['брошь']={
	ie:'брошь',
	re:'броши',
	de:'броши',
	ve:'брошь',
	te:'брошью',
	pe:'броши',
	im:'броши',
	rm:'брошей',
	dm:'брошям',
	vm:'броши',
	tm:'брошями',
	pm:'брошях',
	rod:1,
	skl:3,
	odu:0,
	sbs:0,
	chr:1,
};
lx['брус']={
	ie:'брус',
	re:'бруса',
	de:'брусу',
	ve:'брус',
	te:'брусом',
	pe:'брусе',
	im:'брусья',
	rm:'брусьев',
	dm:'брусьям',
	vm:'брусья',
	tm:'брусьями',
	pm:'брусьях',
	rod:0,
	skl:2,
	odu:0,
};
lx['булавка']={
	ie:'булавка',
	re:'булавки',
	de:'булавке',
	ve:'булавку',
	te:'булавкой',
	pe:'булавке',
	im:'булавки',
	rm:'булавок',
	dm:'булавкам',
	vm:'булавки',
	tm:'булавками',
	pm:'булавках',
	rod:1,
	skl:1,
	odu:0,
};
lx['бутерброд']={
	ie:'бутерброд',
	re:'бутерброда',
	de:'бутерброду',
	ve:'бутерброд',
	te:'бутербродом',
	pe:'бутерброде',
	im:'бутерброды',
	rm:'бутербродов',
	dm:'бутербродам',
	vm:'бутерброды',
	tm:'бутербродами',
	pm:'бутербродах',
	rod:0,
	skl:2,
	odu:0,
};
lx['Васильевна']={
	ie:'Васильевна',
	re:'Васильевны',
	de:'Васильевне',
	ve:'Васильевну',
	te:'Васильевной',
	pe:'Васильевне',
	im:'Васильевны',
	rm:'Васильевн',
	dm:'Васильевнам',
	vm:'Васильевн',
	tm:'Васильевнами',
	pm:'Васильевнах',
	rod:1,
	skl:1,
	odu:0,
};
lx['веб-дизайнер']={
	ie:'веб-дизайнер',
	re:'веб-дизайнера',
	de:'веб-дизайнеру',
	ve:'веб-дизайнера',
	te:'веб-дизайнером',
	pe:'веб-дизайнере',
	im:'веб-дизайнеры',
	rm:'веб-дизайнеров',
	dm:'веб-дизайнерам',
	vm:'веб-дизайнеров',
	tm:'веб-дизайнерами',
	pm:'веб-дизайнерах',
	rod:0,
	skl:2,
	odu:0,
};
lx['ведомство']={
	ie:'ведомство',
	re:'ведомства',
	de:'ведомству',
	ve:'ведомство',
	te:'ведомством',
	pe:'ведомстве',
	im:'ведомства',
	rm:'ведомств',
	dm:'ведомствам',
	vm:'ведомства',
	tm:'ведомствами',
	pm:'ведомствах',
	rod:2,
	skl:2,
	odu:0,
};
lx['велосипед']={
	ie:'велосипед',
	re:'велосипеда',
	de:'велосипеду',
	ve:'велосипед',
	te:'велосипедом',
	pe:'велосипеде',
	im:'велосипеды',
	rm:'велосипедов',
	dm:'велосипедам',
	vm:'велосипеды',
	tm:'велосипедами',
	pm:'велосипедах',
	rod:0,
	skl:2,
	odu:0,
};
lx['Венесуэла']={
	ie:'Венесуэла',
	re:'Венесуэлы',
	de:'Венесуэле',
	ve:'Венесуэлу',
	te:'Венесуэлой',
	pe:'Венесуэле',
	im:'Венесуэлы',
	rm:'Венесуэл',
	dm:'Венесуэлам',
	vm:'Венесуэлы',
	tm:'Венесуэлами',
	pm:'Венесуэлах',
	rod:1,
	skl:1,
	odu:0,
};
lx['Вероника']={
	ie:'Вероника',
	re:'Вероники',
	de:'Веронике',
	ve:'Веронику',
	te:'Вероникой',
	pe:'Веронике',
	im:'Вероники',
	rm:'Вероник',
	dm:'Вероникам',
	vm:'Вероник',
	tm:'Верониками',
	pm:'Верониках',
	rod:1,
	skl:1,
	odu:0,
};
lx['верста']={
	ie:'верста',
	re:'версты',
	de:'версте',
	ve:'версту',
	te:'верстой',
	pe:'версте',
	im:'вёрсты',
	rm:'вёрст',
	dm:'вёрстам',
	vm:'вёрсты',
	tm:'вёрстами',
	pm:'вёрстах',
	rod:1,
	skl:1,
	odu:0,
};
lx['весть']={
	ie:'весть',
	re:'вести',
	de:'вести',
	ve:'весть',
	te:'вестью',
	pe:'вести',
	im:'вести',
	rm:'вестей',
	dm:'вестям',
	vm:'вести',
	tm:'вестями',
	pm:'вестях',
	rod:1,
	skl:3,
	odu:0,
};
lx['витрина']={
	ie:'витрина',
	re:'витрины',
	de:'витрине',
	ve:'витрину',
	te:'витриной',
	pe:'витрине',
	im:'витрины',
	rm:'витрин',
	dm:'витринам',
	vm:'витрины',
	tm:'витринами',
	pm:'витринах',
	rod:1,
	skl:1,
	odu:0,
};
lx['власть']={
	ie:'власть',
	re:'власти',
	de:'власти',
	ve:'власть',
	te:'властью',
	pe:'власти',
	im:'власти',
	rm:'властей',
	dm:'властям',
	vm:'власти',
	tm:'властями',
	pm:'властях',
	rod:1,
	skl:3,
	odu:0,
};
lx['вода']={
	ie:'вода',
	re:'воды',
	de:'воде',
	ve:'воду',
	te:'водой',
	pe:'воде',
	im:'воды',
	rm:'вод',
	dm:'водам',
	vm:'воды',
	tm:'водами',
	pm:'водах',
	rod:1,
	skl:1,
	odu:0,
};
lx['Воронеж']={
	ie:'Воронеж',
	re:'Воронежа',
	de:'Воронежу',
	ve:'Воронеж',
	te:'Воронежом',
	pe:'Воронеже',
	im:'Воронежи',
	rm:'Воронежей',
	dm:'Воронежам',
	vm:'Воронежи',
	tm:'Воронежами',
	pm:'Воронежах',
	rod:0,
	skl:2,
	odu:0,
	sbs:1,
	chr:1,
};
lx['воскресенье']={
	ie:'воскресенье',
	re:'воскресенья',
	de:'воскресенью',
	ve:'воскресенье',
	te:'воскресеньем',
	pe:'воскресенье',
	im:'воскресенья',
	rm:'воскресений',
	dm:'воскресеньям',
	vm:'воскресенья',
	tm:'воскресеньями',
	pm:'воскресеньях',
	rod:2,
	skl:2,
	odu:0,
};
lx['время']={
	ie:'время',
	re:'времени',
	de:'времени',
	ve:'время',
	te:'временем',
	pe:'времени',
	im:'времена',
	rm:'времён',
	dm:'временам',
	vm:'времена',
	tm:'временами',
	pm:'временах',
	rod:0,
	skl:4,
	odu:0,
};
lx['вторник']={
	ie:'вторник',
	re:'вторника',
	de:'вторнику',
	ve:'вторник',
	te:'вторником',
	pe:'вторнике',
	im:'вторники',
	rm:'вторников',
	dm:'вторникам',
	vm:'вторники',
	tm:'вторниками',
	pm:'вторниках',
	rod:0,
	skl:2,
	odu:0,
};
lx['выступление']={
	ie:'выступление',
	re:'выступления',
	de:'выступлению',
	ve:'выступление',
	te:'выступлением',
	pe:'выступлении',
	im:'выступления',
	rm:'выступлений',
	dm:'выступлениям',
	vm:'выступления',
	tm:'выступлениями',
	pm:'выступлениях',
	rod:2,
	skl:2,
	odu:0,
	sbs:0,
	chr:1,
	rmn:'выступлениев',
};
lx['выть']={
	ie:'выть',
	re:'выти',
	de:'выти',
	ve:'выть',
	te:'вытью',
	pe:'выти',
	im:'выти',
	rm:'вытей',
	dm:'вытям',
	vm:'выти',
	tm:'вытями',
	pm:'вытях',
	rod:1,
	skl:3,
	odu:0,
};
lx['вязь']={
	ie:'вязь',
	re:'вязи',
	de:'вязи',
	ve:'вязь',
	te:'вязью',
	pe:'вязи',
	im:'вязи',
	rm:'вязей',
	dm:'вязям',
	vm:'вязи',
	tm:'вязями',
	pm:'вязях',
	rod:1,
	skl:3,
	odu:0,
	sbs:0,
	chr:1,
};
lx['газ']={
	ie:'газ',
	re:'газа',
	de:'газу',
	ve:'газ',
	te:'газом',
	pe:'газе',
	im:'газы',
	rm:'газов',
	dm:'газам',
	vm:'газы',
	tm:'газами',
	pm:'газах',
	rod:0,
	skl:2,
	odu:0,
};
lx['гараж']={
	ie:'гараж',
	re:'гаража',
	de:'гаражу',
	ve:'гараж',
	te:'гаражом',
	pe:'гараже',
	im:'гаражы',
	rm:'гаражов',
	dm:'гаражам',
	vm:'гаражы',
	tm:'гаражами',
	pm:'гаражах',
	rod:0,
	skl:2,
	odu:0,
};
lx['гать']={
	ie:'гать',
	re:'гати',
	de:'гати',
	ve:'гать',
	te:'гатью',
	pe:'гати',
	im:'гати',
	rm:'гатей',
	dm:'гатям',
	vm:'гати',
	tm:'гатями',
	pm:'гатях',
	rod:1,
	skl:3,
	odu:0,
	sbs:0,
	chr:1,
};
lx['Германия']={
	ie:'Германия',
	re:'Германии',
	de:'Германии',
	ve:'Германию',
	te:'Германией',
	pe:'Германии',
	im:'Германии',
	rm:'Германий',
	dm:'Германиям',
	vm:'Германии',
	tm:'Германиями',
	pm:'Германиях',
	rod:1,
	skl:1,
	odu:0,
};
lx['гимнастика']={
	ie:'гимнастика',
	re:'гимнастики',
	de:'гимнастике',
	ve:'гимнастику',
	te:'гимнастикой',
	pe:'гимнастике',
	im:'гимнастики',
	rm:'гимнастик',
	dm:'гимнастикам',
	vm:'гимнастики',
	tm:'гимнастиками',
	pm:'гимнастиках',
	rod:1,
	skl:1,
	odu:0,
};
lx['гладь']={
	ie:'гладь',
	re:'глади',
	de:'глади',
	ve:'гладь',
	te:'гладью',
	pe:'глади',
	im:'глади',
	rm:'гладей',
	dm:'гладям',
	vm:'глади',
	tm:'гладями',
	pm:'гладях',
	rod:1,
	skl:3,
	odu:0,
};
lx['голос']={
	ie:'голос',
	re:'голоса',
	de:'голосу',
	ve:'голос',
	te:'голосом',
	pe:'голосе',
	im:'голоса',
	rm:'голосов',
	dm:'голосам',
	vm:'голоса',
	tm:'голосами',
	pm:'голосах',
	rod:0,
	skl:2,
	odu:0,
};
lx['горесть']={
	ie:'горесть',
	re:'горести',
	de:'горести',
	ve:'горесть',
	te:'горестью',
	pe:'горести',
	im:'горести',
	rm:'горестей',
	dm:'горестям',
	vm:'горести',
	tm:'горестями',
	pm:'горестях',
	rod:1,
	skl:3,
	odu:0,
};
lx['город']={
	ie:'город',
	re:'города',
	de:'городу',
	ve:'город',
	te:'городом',
	pe:'городе',
	im:'города',
	rm:'городов',
	dm:'городам',
	vm:'города',
	tm:'городами',
	pm:'городах',
	rod:0,
	skl:2,
	odu:0,
};
lx['городок']={
	ie:'городок',
	re:'городка',
	de:'городку',
	ve:'городок',
	te:'городком',
	pe:'городке',
	im:'городки',
	rm:'городков',
	dm:'городкам',
	vm:'городки',
	tm:'городками',
	pm:'городках',
	rod:0,
	skl:2,
	odu:0,
};
lx['горсть']={
	ie:'горсть',
	re:'горсти',
	de:'горсти',
	ve:'горсть',
	te:'горстью',
	pe:'горсти',
	im:'горсти',
	rm:'горстей',
	dm:'горстям',
	vm:'горсти',
	tm:'горстями',
	pm:'горстях',
	rod:1,
	skl:3,
	odu:0,
	sbs:0,
	chr:1,
};
lx['гость']={
	ie:'гость',
	re:'гостя',
	de:'гостю',
	ve:'гость',
	te:'гостем',
	pe:'госте',
	im:'гости',
	rm:'гостей',
	dm:'гостям',
	vm:'гости',
	tm:'гостями',
	pm:'гостях',
	rod:2,
	skl:2,
	odu:1,
	sbs:0,
	chr:1,
};
lx['гравий']={
	ie:'гравий',
	re:'гравия',
	de:'гравию',
	ve:'гравий',
	te:'гравием',
	pe:'гравии',
	im:'гравии',
	rm:'гравиев',
	dm:'гравиям',
	vm:'гравии',
	tm:'гравиями',
	pm:'гравиях',
	rod:0,
	skl:2,
	odu:0,
};
lx['гранит']={
	ie:'гранит',
	re:'гранита',
	de:'граниту',
	ve:'гранит',
	te:'гранитом',
	pe:'граните',
	im:'граниты',
	rm:'гранитов',
	dm:'гранитам',
	vm:'граниты',
	tm:'гранитами',
	pm:'гранитах',
	rod:0,
	skl:2,
	odu:0,
};
lx['гроздь']={
	ie:'гроздь',
	re:'грозди',
	de:'грозди',
	ve:'гроздь',
	te:'гроздью',
	pe:'грозди',
	im:'грозди',
	rm:'гроздей',
	dm:'гроздям',
	vm:'грозди',
	tm:'гроздями',
	pm:'гроздях',
	rod:1,
	skl:3,
	odu:0,
	sbs:0,
	chr:1,
};
lx['грудь']={
	ie:'грудь',
	re:'груди',
	de:'груди',
	ve:'грудь',
	te:'грудью',
	pe:'груди',
	im:'груди',
	rm:'грудей',
	dm:'грудям',
	vm:'груди',
	tm:'грудями',
	pm:'грудях',
	rod:1,
	skl:3,
	odu:0,
};
lx['грузовик']={
	ie:'грузовик',
	re:'грузовика',
	de:'грузовику',
	ve:'грузовик',
	te:'грузовиком',
	pe:'грузовике',
	im:'грузовики',
	rm:'грузовиков',
	dm:'грузовикам',
	vm:'грузовики',
	tm:'грузовиками',
	pm:'грузовиках',
	rod:0,
	skl:2,
	odu:0,
};
lx['грусть']={
	ie:'грусть',
	re:'грусти',
	de:'грусти',
	ve:'грусть',
	te:'грустью',
	pe:'грусти',
	im:'грусти',
	rm:'грустей',
	dm:'грустям',
	vm:'грусти',
	tm:'грустями',
	pm:'грустях',
	rod:1,
	skl:3,
	odu:0,
};
lx['груша']={
	ie:'груша',
	re:'груши',
	de:'груше',
	ve:'грушу',
	te:'грушой',
	pe:'груше',
	im:'груши',
	rm:'груш',
	dm:'грушам',
	vm:'груши',
	tm:'грушами',
	pm:'грушах',
	rod:1,
	skl:1,
	odu:0,
};
lx['Дарья']={
	ie:'Дарья',
	re:'Дарьи',
	de:'Дарье',
	ve:'Дарью',
	te:'Дарьей',
	pe:'Дарье',
	im:'Дарьи',
	rm:'Дарий',
	dm:'Дарьям',
	vm:'Дарьи',
	tm:'Дарьями',
	pm:'Дарьях',
	rod:1,
	skl:1,
	odu:0,
};
lx['дача']={
	ie:'дача',
	re:'дачи',
	de:'даче',
	ve:'дачу',
	te:'дачей',
	pe:'даче',
	im:'дачи',
	rm:'дач',
	dm:'дачам',
	vm:'дачи',
	tm:'дачами',
	pm:'дачах',
	rod:1,
	skl:1,
	odu:0,
};
lx['дверь']={
	ie:'дверь',
	re:'двери',
	de:'двери',
	ve:'дверь',
	te:'дверью',
	pe:'двери',
	im:'двери',
	rm:'дверей',
	dm:'дверям',
	vm:'двери',
	tm:'дверями',
	pm:'дверях',
	rod:1,
	skl:3,
	odu:0,
	sbs:0,
	chr:1,
};
lx['декада']={
	ie:'декада',
	re:'декады',
	de:'декаде',
	ve:'декаду',
	te:'декадой',
	pe:'декаде',
	im:'декады',
	rm:'декад',
	dm:'декадам',
	vm:'декады',
	tm:'декадами',
	pm:'декадах',
	rod:1,
	skl:1,
	odu:0,
};
lx['дельтоид']={
	ie:'дельтоид',
	re:'дельтоида',
	de:'дельтоиду',
	ve:'дельтоид',
	te:'дельтоидом',
	pe:'дельтоиде',
	im:'дельтоиды',
	rm:'дельтоидов',
	dm:'дельтоидам',
	vm:'дельтоиды',
	tm:'дельтоидами',
	pm:'дельтоидах',
	rod:0,
	skl:2,
	odu:0,
};
lx['день']={
	ie:'день',
	re:'дня',
	de:'дню',
	ve:'день',
	te:'днём',
	pe:'дне',
	im:'дни',
	rm:'дней',
	dm:'дням',
	vm:'дни',
	tm:'днями',
	pm:'днях',
	rod:0,
	skl:2,
	odu:0,
};
lx['деревня']={
	ie:'деревня',
	re:'деревни',
	de:'деревне',
	ve:'деревню',
	te:'деревней',
	pe:'деревне',
	im:'деревни',
	rm:'деревень',
	dm:'деревням',
	vm:'деревни',
	tm:'деревнями',
	pm:'деревнях',
	rod:1,
	skl:1,
	odu:0,
};
lx['десть']={
	ie:'десть',
	re:'дести',
	de:'дести',
	ve:'десть',
	te:'дестью',
	pe:'дести',
	im:'дести',
	rm:'дестей',
	dm:'дестям',
	vm:'дести',
	tm:'дестями',
	pm:'дестях',
	rod:1,
	skl:3,
	odu:0,
};
lx['деталь']={
	ie:'деталь',
	re:'детали',
	de:'детали',
	ve:'деталь',
	te:'деталью',
	pe:'детали',
	im:'детали',
	rm:'деталей',
	dm:'деталям',
	vm:'детали',
	tm:'деталями',
	pm:'деталях',
	rod:1,
	skl:3,
	odu:0,
};
lx['дециметр']={
	ie:'дециметр',
	re:'дециметра',
	de:'дециметру',
	ve:'дециметр',
	te:'дециметром',
	pe:'дециметре',
	im:'дециметры',
	rm:'дециметров',
	dm:'дециметрам',
	vm:'дециметры',
	tm:'дециметрами',
	pm:'дециметрах',
	rod:0,
	skl:2,
	odu:0,
	skr:'дм',
};
lx['дёготь']={
	ie:'дёготь',
	re:'дёгтя',
	de:'дёгтю',
	ve:'дёготь',
	te:'дёгтем',
	pe:'дёгте',
	im:'дёгти',
	rm:'дёгтей',
	dm:'дёгтям',
	vm:'дёгти',
	tm:'дёгтям',
	pm:'дёгтях',
	rod:0,
	skl:2,
	odu:0,
};
lx['диагональ']={
	ie:'диагональ',
	re:'диагонали',
	de:'диагонали',
	ve:'диагональ',
	te:'диагональю',
	pe:'диагонали',
	im:'диагонали',
	rm:'диагоналей',
	dm:'диагоналям',
	vm:'диагонали',
	tm:'диагоналями',
	pm:'диагоналях',
	rod:1,
	skl:3,
	odu:0,
};
lx['дизель']={
	ie:'дизель',
	re:'дизеля',
	de:'дизелю',
	ve:'дизель',
	te:'дизелем',
	pe:'дизеле',
	im:'дизели',
	rm:'дизелей',
	dm:'дизелям',
	vm:'дизели',
	tm:'дизелями',
	pm:'дизелях',
	rod:0,
	skl:2,
	odu:0,
};
lx['доблесть']={
	ie:'доблесть',
	re:'доблести',
	de:'доблести',
	ve:'доблесть',
	te:'доблестью',
	pe:'доблести',
	im:'доблести',
	rm:'доблестей',
	dm:'доблестям',
	vm:'доблести',
	tm:'доблестями',
	pm:'доблестях',
	rod:1,
	skl:3,
	odu:0,
};
lx['доллар']={
	ie:'доллар',
	re:'доллара',
	de:'доллару',
	ve:'доллар',
	te:'долларом',
	pe:'долларе',
	im:'доллары',
	rm:'долларов',
	dm:'долларам',
	vm:'доллары',
	tm:'долларами',
	pm:'долларах',
	rod:0,
	skl:2,
	odu:0,
};
lx['дом']={
	ie:'дом',
	re:'дома',
	de:'дому',
	ve:'дом',
	te:'домом',
	pe:'доме',
	im:'дома',
	rm:'домов',
	dm:'домам',
	vm:'дома',
	tm:'домами',
	pm:'домах',
	rod:0,
	skl:2,
	odu:0,
};
lx['домик']={
	ie:'домик',
	re:'домика',
	de:'домику',
	ve:'домик',
	te:'домиком',
	pe:'домике',
	im:'домики',
	rm:'домиков',
	dm:'домикам',
	vm:'домики',
	tm:'домиками',
	pm:'домиках',
	rod:0,
	skl:2,
	odu:0,
};
lx['дробь']={
	ie:'дробь',
	re:'дроби',
	de:'дроби',
	ve:'дробь',
	te:'дробью',
	pe:'дроби',
	im:'дроби',
	rm:'дробей',
	dm:'дробям',
	vm:'дроби',
	tm:'дробями',
	pm:'дробях',
	rod:1,
	skl:3,
	odu:0,
	chr:1,
};
lx['евро']={
	ie:'евро',
	re:'евро',
	de:'евро',
	ve:'евро',
	te:'евро',
	pe:'евро',
	im:'евро',
	rm:'евро',
	dm:'евро',
	vm:'евро',
	tm:'евро',
	pm:'евро',
	rod:2,
	skl:0,
	odu:0,
};
lx['Елена']={
	ie:'Елена',
	re:'Елены',
	de:'Елене',
	ve:'Елену',
	te:'Еленой',
	pe:'Елене',
	im:'Елены',
	rm:'Елен',
	dm:'Еленам',
	vm:'Елен',
	tm:'Еленами',
	pm:'Еленах',
	rod:1,
	skl:1,
	odu:0,
};
lx['ель']={
	ie:'ель',
	re:'ели',
	de:'ели',
	ve:'ель',
	te:'елью',
	pe:'ели',
	im:'ели',
	rm:'елей',
	dm:'елям',
	vm:'ели',
	tm:'елями',
	pm:'елях',
	rod:1,
	skl:3,
	odu:0,
	sbs:0,
	chr:1,
};
lx['жгучесть']={
	ie:'жгучесть',
	re:'жгучести',
	de:'жгучести',
	ve:'жгучесть',
	te:'жгучестью',
	pe:'жгучести',
	im:'жгучести',
	rm:'жгучестей',
	dm:'жгучестям',
	vm:'жгучести',
	tm:'жгучестями',
	pm:'жгучестях',
	rod:1,
	skl:3,
	odu:0,
};
lx['желть']={
	ie:'желть',
	re:'желти',
	de:'желти',
	ve:'желть',
	te:'желтью',
	pe:'желти',
	im:'желти',
	rm:'желтей',
	dm:'желтям',
	vm:'желти',
	tm:'желтями',
	pm:'желтях',
	rod:1,
	skl:3,
	odu:0,
};
lx['жердь']={
	ie:'жердь',
	re:'жерди',
	de:'жерди',
	ve:'жердь',
	te:'жердью',
	pe:'жерди',
	im:'жерди',
	rm:'жердей',
	dm:'жердям',
	vm:'жерди',
	tm:'жердями',
	pm:'жердях',
	rod:1,
	skl:3,
	odu:0,
};
lx['жесть']={
	ie:'жесть',
	re:'жести',
	de:'жести',
	ve:'жесть',
	te:'жестью',
	pe:'жести',
	im:'жести',
	rm:'жестей',
	dm:'жестям',
	vm:'жести',
	tm:'жестями',
	pm:'жестях',
	rod:1,
	skl:3,
	odu:0,
};
lx['живучесть']={
	ie:'живучесть',
	re:'живучести',
	de:'живучести',
	ve:'живучесть',
	te:'живучестью',
	pe:'живучести',
	im:'живучести',
	rm:'живучестей',
	dm:'живучестям',
	vm:'живучести',
	tm:'живучестями',
	pm:'живучестях',
	rod:1,
	skl:3,
	odu:0,
};
lx['жидкость']={
	ie:'жидкость',
	re:'жидкости',
	de:'жидкости',
	ve:'жидкость',
	te:'жидкостью',
	pe:'жидкости',
	im:'жидкости',
	rm:'жидкостей',
	dm:'жидкостям',
	vm:'жидкости',
	tm:'жидкостями',
	pm:'жидкостях',
	rod:1,
	skl:3,
	odu:0,
};
lx['жизнь']={
	ie:'жизнь',
	re:'жизни',
	de:'жизни',
	ve:'жизнь',
	te:'жизнью',
	pe:'жизни',
	im:'жизни',
	rm:'жизней',
	dm:'жизням',
	vm:'жизни',
	tm:'жизнями',
	pm:'жизнях',
	rod:1,
	skl:3,
	odu:0,
	sbs:0,
	chr:1,
};
lx['жуть']={
	ie:'жуть',
	re:'жути',
	de:'жути',
	ve:'жуть',
	te:'жутью',
	pe:'жути',
	im:'жути',
	rm:'жутей',
	dm:'жутям',
	vm:'жути',
	tm:'жутями',
	pm:'жутях',
	rod:1,
	skl:3,
	odu:0,
};
lx['зависть']={
	ie:'зависть',
	re:'зависти',
	de:'зависти',
	ve:'зависть',
	te:'завистью',
	pe:'зависти',
	im:'зависти',
	rm:'завистей',
	dm:'завистям',
	vm:'зависти',
	tm:'завистями',
	pm:'завистях',
	rod:1,
	skl:3,
	odu:0,
};
lx['задание']={
	ie:'задание',
	re:'задания',
	de:'заданию',
	ve:'задание',
	te:'заданием',
	pe:'задании',
	im:'задания',
	rm:'заданий',
	dm:'заданиям',
	vm:'задания',
	tm:'заданиями',
	pm:'заданиях',
	rod:2,
	skl:2,
	odu:0,
};
lx['заповедь']={
	ie:'заповедь',
	re:'заповеди',
	de:'заповеди',
	ve:'заповедь',
	te:'заповедью',
	pe:'заповеди',
	im:'заповеди',
	rm:'заповедей',
	dm:'заповедям',
	vm:'заповеди',
	tm:'заповедями',
	pm:'заповедях',
	rod:1,
	skl:3,
	odu:0,
};
lx['"Запорожец"']={
	ie:'"Запорожец"',
	re:'"Запорожца"',
	de:'"Запорожцу"',
	ve:'"Запорожец"',
	te:'"Запорожцем"',
	pe:'"Запорожце"',
	im:'"Запорожцы"',
	rm:'"Запорожцев"',
	dm:'"Запорожцам"',
	vm:'"Запорожцы"',
	tm:'"Запорожцами"',
	pm:'"Запорожцах"',
	rod:0,
	skl:2,
	odu:0,
};
lx['знать']={
	ie:'знать',
	re:'знати',
	de:'знати',
	ve:'знать',
	te:'знатью',
	pe:'знати',
	im:'знати',
	rm:'знатей',
	dm:'знатям',
	vm:'знати',
	tm:'знатями',
	pm:'знатях',
	rod:1,
	skl:3,
	odu:0,
};
lx['значение']={
	ie:'значение',
	re:'значения',
	de:'значению',
	ve:'значение',
	te:'значением',
	pe:'значении',
	im:'значения',
	rm:'значений',
	dm:'значениям',
	vm:'значения',
	tm:'значениями',
	pm:'значениях',
	rod:2,
	skl:2,
	odu:0,
};
lx['зять']={
	ie:'зять',
	re:'зятя',
	de:'зятю',
	ve:'затя',
	te:'зятем',
	pe:'зяте',
	im:'зятья',
	rm:'зятьёв',
	dm:'зятьям',
	vm:'зятьёв',
	tm:'затьями',
	pm:'зятьях',
	rod:0,
	skl:2,
	odu:0,
};
lx['Ивановна']={
	ie:'Ивановна',
	re:'Ивановны',
	de:'Ивановне',
	ve:'Ивановну',
	te:'Ивановной',
	pe:'Ивановне',
	im:'Ивановны',
	rm:'Ивановн',
	dm:'Ивановнам',
	vm:'Ивановн',
	tm:'Ивановнами',
	pm:'Ивановнах',
	rod:1,
	skl:1,
	odu:0,
};
lx['игиловец']={
	ie:'игиловец',
	re:'игиловца',
	de:'игиловцу',
	ve:'игиловца',
	te:'игиловцем',
	pe:'игиловце',
	im:'игиловцы',
	rm:'игиловцев',
	dm:'игиловцам',
	vm:'игиловцев',
	tm:'игиловцами',
	pm:'игиловцах',
	rod:0,
	skl:2,
	odu:1,
};
lx['известняк']={
	ie:'известняк',
	re:'известняка',
	de:'известняку',
	ve:'известняк',
	te:'известняком',
	pe:'известняке',
	im:'известняки',
	rm:'известняков',
	dm:'известнякам',
	vm:'известняки',
	tm:'известняками',
	pm:'известняках',
	rod:0,
	skl:2,
	odu:0,
};
lx['известь']={
	ie:'известь',
	re:'извести',
	de:'извести',
	ve:'известь',
	te:'известью',
	pe:'извести',
	im:'извести',
	rm:'известей',
	dm:'известям',
	vm:'извести',
	tm:'известями',
	pm:'известях',
	rod:1,
	skl:3,
	odu:0,
};
lx['изгородь']={
	ie:'изгородь',
	re:'изгороди',
	de:'изгороди',
	ve:'изгородь',
	te:'изгородью',
	pe:'изгороди',
	im:'изгороди',
	rm:'изгородей',
	dm:'изгородям',
	vm:'изгороди',
	tm:'изгородями',
	pm:'изгородях',
	rod:1,
	skl:3,
	odu:0,
};
lx['Израиль']={
	ie:'Израиль',
	re:'Израиля',
	de:'Израилю',
	ve:'Израиль',
	te:'Израилем',
	pe:'Израиле',
	im:'Израили',
	rm:'Израилей',
	dm:'Израилям',
	vm:'Израили',
	tm:'Израилями',
	pm:'Израилях',
	rod:0,
	skl:2,
	odu:0,
};
lx['инноград']={
	ie:'инноград',
	re:'иннограда',
	de:'иннограду',
	ve:'инноград',
	te:'инноградом',
	pe:'иннограде',
	im:'иннограды',
	rm:'инноградов',
	dm:'инноградам',
	vm:'иннограды',
	tm:'инноградами',
	pm:'инноградах',
	rod:0,
	skl:2,
	odu:0,
};
lx['интервал']={
	ie:'интервал',
	re:'интервала',
	de:'интервалу',
	ve:'интервал',
	te:'интервалом',
	pe:'интервале',
	im:'интервалы',
	rm:'интервалов',
	dm:'интервалам',
	vm:'интервалы',
	tm:'интервалами',
	pm:'интервалах',
	rod:0,
	skl:2,
	odu:0,
};
lx['исповедь']={
	ie:'исповедь',
	re:'исповеди',
	de:'исповеди',
	ve:'исповедь',
	te:'исповедью',
	pe:'исповеди',
	im:'исповеди',
	rm:'исповедей',
	dm:'исповедям',
	vm:'исповеди',
	tm:'исповедями',
	pm:'исповедях',
	rod:1,
	skl:3,
	odu:0,
};
lx['июнь']={
	ie:'июнь',
	re:'июня',
	de:'июню',
	ve:'июнь',
	te:'июнем',
	pe:'июне',
	im:'июни',
	rm:'июней',
	dm:'июням',
	vm:'июни',
	tm:'июнями',
	pm:'июнях',
	rod:0,
	skl:2,
	odu:0,
};
lx['июль']={
	ie:'июль',
	re:'июля',
	de:'июлю',
	ve:'июль',
	te:'июлем',
	pe:'июле',
	im:'июли',
	rm:'июлей',
	dm:'июлям',
	vm:'июли',
	tm:'июлями',
	pm:'июлях',
	rod:0,
	skl:2,
	odu:0,
};
lx['кабельтов']={
	ie:'кабельтов',
	re:'кабельтова',
	de:'кабельтову',
	ve:'кабельтов',
	te:'кабельтовым',
	pe:'кабельтовом',
	im:'кабельтовы',
	rm:'кабельтовых',
	dm:'кабельтовым',
	vm:'кабельтовых',
	tm:'кабельтовыми',
	pm:'кабельтовых',
	rod:0,
	skl:2,
	odu:0,
};
lx['Казань']={
	ie:'Казань',
	re:'Казани',
	de:'Казани',
	ve:'Казань',
	te:'Казанью',
	pe:'Казани',
	im:'Казани',
	rm:'Казаней',
	dm:'Казаням',
	vm:'Казани',
	tm:'Казанями',
	pm:'Казанях',
	rod:1,
	skl:3,
	odu:0,
};
lx['кальций']={
	ie:'кальций',
	re:'кальция',
	de:'кальцию',
	ve:'кальций',
	te:'кальцием',
	pe:'кальции',
	im:'кальции',
	rm:'кальциев',
	dm:'кальциям',
	vm:'кальции',
	tm:'кальциями',
	pm:'кальциях',
	rod:0,
	skl:2,
	odu:0,
};
lx['камедь']={
	ie:'камедь',
	re:'камеди',
	de:'камеди',
	ve:'камедь',
	te:'камедью',
	pe:'камеди',
	im:'камеди',
	rm:'камедей',
	dm:'камедям',
	vm:'камеди',
	tm:'камедями',
	pm:'камедях',
	rod:1,
	skl:3,
	odu:0,
};
lx['камень']={
	ie:'камень',
	re:'камня',
	de:'камню',
	ve:'камень',
	te:'камнем',
	pe:'камне',
	im:'камни',
	rm:'камней',
	dm:'камням',
	vm:'камни',
	tm:'камнями',
	pm:'камнях',
	rod:0,
	skl:2,
	odu:0,
};
lx['канцелярия']={
	ie:'канцелярия',
	re:'канцелярии',
	de:'канцелярии',
	ve:'канцелярию',
	te:'канцелярией',
	pe:'канцелярии',
	im:'канцелярии',
	rm:'канцелярий',
	dm:'канцеляриям',
	vm:'канцелярии',
	tm:'канцеляриями',
	pm:'канцеляриях',
	rod:1,
	skl:1,
	odu:0,
};
lx['катет']={
	ie:'катет',
	re:'катета',
	de:'катету',
	ve:'катет',
	te:'катетом',
	pe:'катете',
	im:'катеты',
	rm:'катетов',
	dm:'катетам',
	vm:'катеты',
	tm:'катетами',
	pm:'катетах',
	rod:0,
	skl:2,
	odu:0,
};
lx['квадрат']={
	ie:'квадрат',
	re:'квадрата',
	de:'квадрату',
	ve:'квадрат',
	te:'квадратом',
	pe:'квадрате',
	im:'квадраты',
	rm:'квадратов',
	dm:'квадратам',
	vm:'квадраты',
	tm:'квадратами',
	pm:'квадратах',
	rod:0,
	skl:2,
	odu:0,
};
lx['керосин']={
	ie:'керосин',
	re:'керосина',
	de:'керосину',
	ve:'керосин',
	te:'керосином',
	pe:'керосине',
	im:'керосины',
	rm:'керосинов',
	dm:'керосинам',
	vm:'керосины',
	tm:'керосинами',
	pm:'керосинах',
	rod:0,
	skl:2,
	odu:0,
};
lx['километр']={
	ie:'километр',
	re:'километра',
	de:'километру',
	ve:'километр',
	te:'километром',
	pe:'километре',
	im:'километры',
	rm:'километров',
	dm:'километрам',
	vm:'километры',
	tm:'километрами',
	pm:'километрах',
	rod:0,
	skl:2,
	odu:0,
	skr:'км',
};
lx['киносеть']={
	ie:'киносеть',
	re:'киносети',
	de:'киносети',
	ve:'киносеть',
	te:'киносетью',
	pe:'киносети',
	im:'киносети',
	rm:'киносетей',
	dm:'киносетям',
	vm:'киносети',
	tm:'киносетями',
	pm:'киносетях',
	rod:1,
	skl:3,
	odu:0,
};
lx['кипучесть']={
	ie:'кипучесть',
	re:'кипучести',
	de:'кипучести',
	ve:'кипучесть',
	te:'кипучестью',
	pe:'кипучести',
	im:'кипучести',
	rm:'кипучестей',
	dm:'кипучестям',
	vm:'кипучести',
	tm:'кипучестями',
	pm:'кипучестях',
	rod:1,
	skl:3,
	odu:0,
};
lx['кисть']={
	ie:'кисть',
	re:'кисти',
	de:'кисти',
	ve:'кисть',
	te:'кистью',
	pe:'кисти',
	im:'кисти',
	rm:'кистей',
	dm:'кистям',
	vm:'кисти',
	tm:'кистями',
	pm:'кистях',
	rod:1,
	skl:3,
	odu:0,
	sbs:0,
	chr:1,
};
lx['Китай']={
	ie:'Китай',
	re:'Китая',
	de:'Китаю',
	ve:'Китай',
	te:'Китаем',
	pe:'Китае',
	im:'Китаи',
	rm:'Китаев',
	dm:'Китаям',
	vm:'Китаи',
	tm:'Китаями',
	pm:'Китаях',
	rod:0,
	skl:2,
	odu:0,
};
lx['клавиатура']={
	ie:'клавиатура',
	re:'клавиатуры',
	de:'клавиатуре',
	ve:'клавиатуру',
	te:'клавиатурой',
	pe:'клавиатуре',
	im:'клавиатуры',
	rm:'клавиатур',
	dm:'клавиатурам',
	vm:'клавиатуры',
	tm:'клавиатурами',
	pm:'клавиатурах',
	rod:1,
	skl:1,
	odu:0,
	sbs:0,
	chr:1,
};
lx['кладь']={
	ie:'кладь',
	re:'клади',
	de:'клади',
	ve:'кладь',
	te:'кладью',
	pe:'клади',
	im:'клади',
	rm:'кладей',
	dm:'кладям',
	vm:'клади',
	tm:'кладями',
	pm:'кладях',
	rod:1,
	skl:3,
	odu:0,
};
lx['клеть']={
	ie:'клеть',
	re:'клети',
	de:'клети',
	ve:'клеть',
	te:'клетью',
	pe:'клети',
	im:'клети',
	rm:'клетей',
	dm:'клетям',
	vm:'клети',
	tm:'клетями',
	pm:'клетях',
	rod:1,
	skl:3,
	odu:0,
};
lx['коготь']={
	ie:'коготь',
	re:'когтя',
	de:'когтю',
	ve:'коготь',
	te:'когтём',
	pe:'когте',
	im:'когтей',
	rm:'когтей',
	dm:'когтям',
	vm:'когти',
	tm:'когтями',
	pm:'когтях',
	rod:1,
	skl:3,
	odu:0,
};
lx['коловерть']={
	ie:'коловерть',
	re:'коловерти',
	de:'коловерти',
	ve:'коловерть',
	te:'коловертью',
	pe:'коловерти',
	im:'коловерти',
	rm:'коловертей',
	dm:'коловертям',
	vm:'коловерти',
	tm:'коловертями',
	pm:'коловертях',
	rod:1,
	skl:3,
	odu:0,
};
lx['колючесть']={
	ie:'колючесть',
	re:'колючести',
	de:'колючести',
	ve:'колючесть',
	te:'колючестью',
	pe:'колючести',
	im:'колючести',
	rm:'колючестей',
	dm:'колючестям',
	vm:'колючести',
	tm:'колючестями',
	pm:'колючестях',
	rod:1,
	skl:3,
	odu:0,
};
lx['компакт-диск']={
	ie:'компакт-диск',
	re:'компакт-диска',
	de:'компакт-диску',
	ve:'компакт-диск',
	te:'компакт-диском',
	pe:'компакт-диске',
	im:'компакт-диски',
	rm:'компакт-дисков',
	dm:'компакт-дискам',
	vm:'компакт-диски',
	tm:'компакт-дисками',
	pm:'компакт-дисках',
	rod:0,
	skl:2,
	odu:0,
};
lx['конструкция']={
	ie:'конструкция',
	re:'конструкции',
	de:'конструкции',
	ve:'конструкцию',
	te:'конструкцией',
	pe:'конструкции',
	im:'конструкции',
	rm:'конструкций',
	dm:'конструкциям',
	vm:'конструкции',
	tm:'конструкциями',
	pm:'конструкциях',
	rod:1,
	skl:1,
	odu:0,
};
lx['копейка']={
	ie:'копейка',
	re:'копейки',
	de:'копейке',
	ve:'копейку',
	te:'копейкой',
	pe:'копейке',
	im:'копейки',
	rm:'копеек',
	dm:'копейкам',
	vm:'копейки',
	tm:'копейками',
	pm:'копейках',
	rod:1,
	skl:1,
	odu:0,
	sbs:0,
	chr:1,
};
lx['копоть']={
	ie:'копоть',
	re:'копоти',
	de:'копоти',
	ve:'копоть',
	te:'копотью',
	pe:'копоти',
	im:'копоти',
	rm:'копотей',
	dm:'копотям',
	vm:'копоти',
	tm:'копотями',
	pm:'копотях',
	rod:1,
	skl:3,
	odu:0,
};
lx['корабль']={
	ie:'корабль',
	re:'корабля',
	de:'кораблю',
	ve:'корабль',
	te:'кораблём',
	pe:'корабле',
	im:'корабли',
	rm:'кораблей',
	dm:'кораблям',
	vm:'корабли',
	tm:'кораблями',
	pm:'кораблях',
	rod:0,
	skl:2,
	odu:0,
};
lx['корысть']={
	ie:'корысть',
	re:'корысти',
	de:'корысти',
	ve:'корысть',
	te:'корыстью',
	pe:'корысти',
	im:'корысти',
	rm:'корыстей',
	dm:'корыстям',
	vm:'корысти',
	tm:'корыстями',
	pm:'корыстях',
	rod:1,
	skl:3,
	odu:0,
};
lx['Косово']={
	ie:'Косово',
	re:'Косово',
	de:'Косово',
	ve:'Косово',
	te:'Косово',
	pe:'Косово',
	im:'Косово',
	rm:'Косово',
	dm:'Косово',
	vm:'Косово',
	tm:'Косово',
	pm:'Косово',
	rod:2,
	skl:0,
	odu:0,
};
lx['кость']={
	ie:'кость',
	re:'кости',
	de:'кости',
	ve:'кость',
	te:'костью',
	pe:'кости',
	im:'кости',
	rm:'костей',
	dm:'костям',
	vm:'кости',
	tm:'костями',
	pm:'костях',
	rod:1,
	skl:3,
	odu:0,
	sbs:0,
	chr:1,
};
lx['Красноярск']={
	ie:'Красноярск',
	re:'Красноярска',
	de:'Красноярску',
	ve:'Красноярск',
	te:'Красноярском',
	pe:'Красноярске',
	im:'Красноярски',
	rm:'Красноярсков',
	dm:'Красноярскам',
	vm:'Красноярски',
	tm:'Красноярсками',
	pm:'Красноярсках',
	rod:0,
	skl:2,
	odu:0,
};
lx['Кристина']={
	ie:'Кристина',
	re:'Кристины',
	de:'Кристине',
	ve:'Кристину',
	te:'Кристиной',
	pe:'Кристине',
	im:'Кристины',
	rm:'Кристин',
	dm:'Кристинам',
	vm:'Кристин',
	tm:'Кристинами',
	pm:'Кристинах',
	rod:1,
	skl:1,
	odu:0,
};
lx['кровать']={
	ie:'кровать',
	re:'кровати',
	de:'кровати',
	ve:'кровать',
	te:'кроватью',
	pe:'кровати',
	im:'кровати',
	rm:'кроватей',
	dm:'кроватям',
	vm:'кровати',
	tm:'кроватями',
	pm:'кроватях',
	rod:1,
	skl:3,
	odu:0,
	sbs:0,
	chr:1,
};
lx['кровь']={
	ie:'кровь',
	re:'крови',
	de:'крови',
	ve:'кровь',
	te:'кровью',
	pe:'крови',
	im:'крови',
	rm:'кровей',
	dm:'кровям',
	vm:'крови',
	tm:'кровями',
	pm:'кровях',
	rod:1,
	skl:3,
	odu:0,
	sbs:0,
chr:1,
};
lx['круговерть']={
	ie:'круговерть',
	re:'круговерти',
	de:'круговерти',
	ve:'круговерть',
	te:'круговертью',
	pe:'круговерти',
	im:'круговерти',
	rm:'круговертей',
	dm:'круговертям',
	vm:'круговерти',
	tm:'круговертями',
	pm:'тях',
	rod:1,
	skl:3,
	odu:0,
};
lx['Куба']={
	ie:'Куба',
	re:'Кубы',
	de:'Кубе',
	ve:'Кубу',
	te:'Кубой',
	pe:'Кубе',
	im:'Кубы',
	rm:'Куб',
	dm:'Кубам',
	vm:'Кубы',
	tm:'Кубами',
	pm:'Кубах',
	rod:1,
	skl:1,
	odu:0,
};
lx['кубометр']={
	ie:'кубометр',
	re:'кубометра',
	de:'кубометру',
	ve:'кубометр',
	te:'кубометром',
	pe:'кубометре',
	im:'кубометры',
	rm:'кубометров',
	dm:'кубометрам',
	vm:'кубометры',
	tm:'кубометрами',
	pm:'кубометрах',
	rod:0,
	skl:2,
	odu:0,
};
lx['лапоть']={
	ie:'лапоть',
	re:'лаптя',
	de:'лаптю',
	ve:'лапоть',
	te:'лаптём',
	pe:'лапте',
	im:'лапти',
	rm:'лаптей',
	dm:'лаптям',
	vm:'лапти',
	tm:'лаптями',
	pm:'лаптях',
	rod:1,
	skl:3,
	odu:0,
};
lx['лень']={
	ie:'лень',
	re:'лени',
	de:'лени',
	ve:'лень',
	te:'ленью',
	pe:'лени',
	im:'лени',
	rm:'леней',
	dm:'леням',
	vm:'лени',
	tm:'ленями',
	pm:'ленях',
	rod:1,
	skl:3,
	odu:0,
	sbs:0,
	chr:1,
};
lx['лесть']={
	ie:'лесть',
	re:'лести',
	de:'лести',
	ve:'лесть',
	te:'лестью',
	pe:'лести',
	im:'лести',
	rm:'лестей',
	dm:'лестям',
	vm:'лести',
	tm:'лестями',
	pm:'лестях',
	rod:1,
	skl:3,
	odu:0,
};
lx['летучесть']={
	ie:'летучесть',
	re:'летучести',
	de:'летучести',
	ve:'летучесть',
	te:'летучестью',
	pe:'летучести',
	im:'летучести',
	rm:'летучестей',
	dm:'летучестям',
	vm:'летучести',
	tm:'летучестями',
	pm:'летучестях',
	rod:1,
	skl:3,
	odu:0,
};
lx['линючесть']={
	ie:'линючесть',
	re:'линючести',
	de:'линючести',
	ve:'линючесть',
	te:'линючестью',
	pe:'линючести',
	im:'линючести',
	rm:'линючестей',
	dm:'линючестям',
	vm:'линючести',
	tm:'линючестями',
	pm:'линючестях',
	rod:1,
	skl:3,
	odu:0,
};
lx['липучесть']={
	ie:'липучесть',
	re:'липучести',
	de:'липучести',
	ve:'липучесть',
	te:'липучестью',
	pe:'липучести',
	im:'липучести',
	rm:'липучестей',
	dm:'липучестям',
	vm:'липучести',
	tm:'липучестями',
	pm:'липучестях',
	rod:1,
	skl:3,
	odu:0,
};
lx['литр']={
	ie:'литр',
	re:'литра',
	de:'литру',
	ve:'литр',
	te:'литром',
	pe:'литре',
	im:'литры',
	rm:'литров',
	dm:'литрам',
	vm:'литры',
	tm:'литрами',
	pm:'литрах',
	rod:0,
	skl:2,
	odu:0,
};
lx['ложь']={
	ie:'ложь',
	re:'лжи',
	de:'лжи',
	ve:'ложь',
	te:'ложью',
	pe:'лжи',
	im:'лжи',
	rm:'лжей',
	dm:'лжам',
	vm:'лжи',
	tm:'лжами',
	pm:'лжах',
	rod:1,
	skl:3,
	odu:0,
	sbs:0,
	chr:1,
};
lx['локоть']={
	ie:'локоть',
	re:'локтя',
	de:'локтю',
	ve:'локоть',
	te:'локтём',
	pe:'локте',
	im:'локти',
	rm:'локтей',
	dm:'локтям',
	vm:'локти',
	tm:'локтями',
	pm:'локтях',
	rod:1,
	skl:3,
	odu:0,
};
lx['ломоть']={
	ie:'ломоть',
	re:'ломтя',
	de:'ломтю',
	ve:'ломоть',
	te:'ломтьём',
	pe:'ломте',
	im:'ломти',
	rm:'ломтей',
	dm:'ломтям',
	vm:'ломти',
	tm:'ломтями',
	pm:'ломтях',
	rod:1,
	skl:3,
	odu:0,
};
lx['лопасть']={
	ie:'лопасть',
	re:'лопасти',
	de:'лопасти',
	ve:'лопасть',
	te:'лопастью',
	pe:'лопасти',
	im:'лопасти',
	rm:'лопастей',
	dm:'лопастям',
	vm:'лопасти',
	tm:'лопастями',
	pm:'лопастях',
	rod:1,
	skl:3,
	odu:0,
};
lx['лошадь']={
	ie:'лошадь',
	re:'лошади',
	de:'лошади',
	ve:'лошадь',
	te:'лошадью',
	pe:'лошади',
	im:'лошади',
	rm:'лошадей',
	dm:'лошадям',
	vm:'лошади',
	tm:'лошадями',
	pm:'лошадях',
	rod:1,
	skl:3,
	odu:0,
};
lx['луч']={
	ie:'луч',
	re:'луча',
	de:'лучу',
	ve:'луч',
	te:'лучом',
	pe:'луче',
	im:'лучи',
	rm:'лучей',
	dm:'лучам',
	vm:'лучи',
	tm:'лучами',
	pm:'лучах',
	rod:0,
	skl:2,
	odu:0,
};
lx['Магадан']={
	ie:'Магадан',
	re:'Магадана',
	de:'Магадану',
	ve:'Магадан',
	te:'Магаданом',
	pe:'Магадане',
	im:'Магаданы',
	rm:'Магаданов',
	dm:'Магаданам',
	vm:'Магаданы',
	tm:'Магаданами',
	pm:'Магаданах',
	rod:0,
	skl:2,
	odu:0,
};
lx['магазин']={
	ie:'магазин',
	re:'магазина',
	de:'магазину',
	ve:'магазин',
	te:'магазином',
	pe:'магазине',
	im:'магазины',
	rm:'магазинов',
	dm:'магазинам',
	vm:'магазины',
	tm:'магазинами',
	pm:'магазинах',
	rod:0,
	skl:2,
	odu:0,
};
lx['магия']={
	ie:'магия',
	re:'магии',
	de:'магии',
	ve:'магию',
	te:'магией',
	pe:'магии',
	im:'магии',
	rm:'магий',
	dm:'магиям',
	vm:'магии',
	tm:'магиями',
	pm:'магиях',
	rod:1,
	skl:1,
	odu:0,
};
lx['май']={
	ie:'май',
	re:'мая',
	de:'маю',
	ve:'май',
	te:'маем',
	pe:'мае',
	im:'маи',
	rm:'маев',
	dm:'маям',
	vm:'маи',
	tm:'маями',
	pm:'маях',
	rod:0,
	skl:2,
	odu:0,
};
lx['майка']={
	ie:'майка',
	re:'майки',
	de:'майке',
	ve:'майку',
	te:'майкой',
	pe:'майке',
	im:'майки',
	rm:'маек',
	dm:'майкам',
	vm:'майки',
	tm:'майками',
	pm:'майках',
	rod:1,
	skl:2,
	odu:0,
	sbs:0,
	chr:1,
};
lx['Мария']={
	ie:'Мария',
	re:'Марии',
	de:'Марии',
	ve:'Марию',
	te:'Марией',
	pe:'Марии',
	im:'Марии',
	rm:'Марий',
	dm:'Мариям',
	vm:'Марии',
	tm:'Мариями',
	pm:'Мариях',
	rod:1,
	skl:1,
	odu:0,
};
lx['март']={
	ie:'март',
	re:'марта',
	de:'марту',
	ve:'март',
	te:'мартом',
	pe:'марте',
	im:'марты',
	rm:'мартов',
	dm:'мартам',
	vm:'марты',
	tm:'мартами',
	pm:'мартах',
	rod:0,
	skl:2,
	odu:0,
};
lx['масть']={
	ie:'масть',
	re:'масти',
	de:'масти',
	ve:'масть',
	te:'мастью',
	pe:'масти',
	im:'масти',
	rm:'мастей',
	dm:'мастям',
	vm:'масти',
	tm:'мастями',
	pm:'мастях',
	rod:1,
	skl:3,
	odu:0,
};
lx['матрёшка']={
	ie:'матрёшка',
	re:'матрёшки',
	de:'матрёшке',
	ve:'матрёшку',
	te:'матрёшкой',
	pe:'матрёшке',
	im:'матрёшки',
	rm:'матрёшек',
	dm:'матрёшкам',
	vm:'матрёшки',
	tm:'матрёшками',
	pm:'матрёшках',
	rod:1,
	skl:1,
	odu:0,
};
lx['мать']={
	ie:'мать',
	re:'матери',
	de:'матери',
	ve:'мать',
	te:'матерью',
	pe:'матери',
	im:'матери',
	rm:'матерей',
	dm:'матерям',
	vm:'матерей',
	tm:'матерями',
	pm:'матерях',
	rod:1,
	skl:3,
	odu:0,
};
lx['медсанчасть']={
	ie:'медсанчасть',
	re:'медсанчасти',
	de:'медсанчасти',
	ve:'медсанчасть',
	te:'медсанчастью',
	pe:'медсанчасти',
	im:'медсанчасти',
	rm:'медсанчастей',
	dm:'медсанчастям',
	vm:'медсанчасти',
	tm:'медсанчастями',
	pm:'медсанчастях',
	rod:1,
	skl:3,
	odu:0,
};
lx['медь']={
	ie:'медь',
	re:'меди',
	de:'меди',
	ve:'медь',
	te:'медью',
	pe:'меди',
	im:'меди',
	rm:'медей',
	dm:'медям',
	vm:'меди',
	tm:'медями',
	pm:'медях',
	rod:1,
	skl:3,
	odu:0,
};
lx['Мексика']={
	ie:'Мексика',
	re:'Мексики',
	de:'Мексике',
	ve:'Мексику',
	te:'Мексикой',
	pe:'Мексике',
	im:'Мексики',
	rm:'Мексик',
	dm:'Мексикам',
	vm:'Мексики',
	tm:'Мексиками',
	pm:'Мексиках',
	rod:1,
	skl:1,
	odu:0,
};
lx['меню']={
	ie:'меню',
	re:'меню',
	de:'меню',
	ve:'меню',
	te:'меню',
	pe:'меню',
	im:'меню',
	rm:'меню',
	dm:'меню',
	vm:'меню',
	tm:'меню',
	pm:'меню',
	rod:2,
	skl:0,
	odu:0,
};
lx['месть']={
	ie:'месть',
	re:'мести',
	de:'мести',
	ve:'месть',
	te:'местью',
	pe:'мести',
	im:'мести',
	rm:'местей',
	dm:'местям',
	vm:'мести',
	tm:'местями',
	pm:'местях',
	rod:1,
	skl:3,
	odu:0,
};
lx['месяц']={
	ie:'месяц',
	re:'месяца',
	de:'месяцу',
	ve:'месяц',
	te:'месяцем',
	pe:'месяце',
	im:'месяцы',
	rm:'месяцев',
	dm:'месяцам',
	vm:'месяцы',
	tm:'месяцами',
	pm:'месяцах',
	rod:0,
	skl:2,
	odu:0,
};
lx['метр']={
	ie:'метр',
	re:'метра',
	de:'метру',
	ve:'метр',
	te:'метром',
	pe:'метре',
	im:'метры',
	rm:'метров',
	dm:'метрам',
	vm:'метры',
	tm:'метрами',
	pm:'метрах',
	rod:0,
	skl:2,
	odu:0,
	skr:'м',
};
lx['мечеть']={
	ie:'мечеть',
	re:'мечети',
	de:'мечети',
	ve:'мечеть',
	te:'мечетью',
	pe:'мечети',
	im:'мечети',
	rm:'мечетей',
	dm:'мечетям',
	vm:'мечети',
	tm:'мечетями',
	pm:'мечетях',
	rod:1,
	skl:3,
	odu:0,
};
lx['мешок']={
	ie:'мешок',
	re:'мешка',
	de:'мешку',
	ve:'мешок',
	te:'мешком',
	pe:'мешке',
	im:'мешки',
	rm:'мешков',
	dm:'мешкам',
	vm:'мешки',
	tm:'мешками',
	pm:'мешках',
	rod:0,
	skl:2,
	odu:0,
};
lx['миллиметр']={
	ie:'миллиметр',
	re:'миллиметра',
	de:'миллиметру',
	ve:'миллиметр',
	te:'миллиметром',
	pe:'миллиметре',
	im:'миллиметры',
	rm:'миллиметров',
	dm:'миллиметрам',
	vm:'миллиметры',
	tm:'миллиметрами',
	pm:'миллиметрах',
	rod:0,
	skl:2,
	odu:0,
	skr:'мм',
};
lx['министерство']={
	ie:'министерство',
	re:'министерства',
	de:'министерству',
	ve:'министерство',
	te:'министерством',
	pe:'министерстве',
	im:'министерства',
	rm:'министерств',
	dm:'министерствам',
	vm:'министерства',
	tm:'министерствами',
	pm:'министерствах',
	rod:2,
	skl:2,
	odu:0,
};
lx['Минобрнауки']={
	ie:'Минобрнауки',
	re:'Минобрнауки',
	de:'Минобрнауки',
	ve:'Минобрнауки',
	te:'Минобрнауки',
	pe:'Минобрнауки',
	im:'Минобрнауки',
	rm:'Минобрнауки',
	dm:'Минобрнауки',
	vm:'Минобрнауки',
	tm:'Минобрнауки',
	pm:'Минобрнауки',
	rod:2,
	skl:0,
	odu:0,
};
lx['минута']={
	ie:'минута',
	re:'минуты',
	de:'минуте',
	ve:'минуту',
	te:'минутой',
	pe:'минуте',
	im:'минуты',
	rm:'минут',
	dm:'минутам',
	vm:'минуты',
	tm:'минутами',
	pm:'минутах',
	rod:1,
	skl:1,
	odu:0,
};
lx['могучесть']={
	ie:'могучесть',
	re:'могучести',
	de:'могучести',
	ve:'могучесть',
	te:'могучестью',
	pe:'могучести',
	im:'могучести',
	rm:'могучестей',
	dm:'могучестям',
	vm:'могучести',
	tm:'могучестями',
	pm:'могучестях',
	rod:1,
	skl:3,
	odu:0,
};
lx['Москва']={
	ie:'Москва',
	re:'Москвы',
	de:'Москве',
	ve:'Москву',
	te:'Москвой',
	pe:'Москве',
	im:'Москвы',
	rm:'Москв',
	dm:'Москвам',
	vm:'Москвы',
	tm:'Москвами',
	pm:'Москвах',
	rod:1,
	skl:1,
	odu:0,
	sbs:1,
	chr:1,
};
lx['"Москвич"']={
	ie:'"Москвич"',
	re:'"Москвича"',
	de:'"Москвичу"',
	ve:'"Москвич"',
	te:'"Москвичом"',
	pe:'"Москвиче"',
	im:'"Москвичи"',
	rm:'"Москвичей"',
	dm:'"Москвичам"',
	vm:'"Москвичи"',
	tm:'"Москвичами"',
	pm:'"Москвичах"',
	rod:0,
	skl:2,
	odu:0,
};
lx['моточасть']={
	ie:'моточасть',
	re:'моточасти',
	de:'моточасти',
	ve:'моточасть',
	te:'моточастью',
	pe:'моточасти',
	im:'моточасти',
	rm:'моточастей',
	dm:'моточастям',
	vm:'моточасти',
	tm:'моточастями',
	pm:'моточастях',
	rod:1,
	skl:3,
	odu:0,
};
lx['мысль']={
	ie:'мысль',
	re:'мысли',
	de:'мысли',
	ve:'мысль',
	te:'мыслью',
	pe:'мысли',
	im:'мысли',
	rm:'мыслей',
	dm:'мыслям',
	vm:'мысли',
	tm:'мыслями',
	pm:'мыслях',
	rod:1,
	skl:3,
	odu:0,
	sbs:0,
	chr:1,
};
lx['мышь']={
	ie:'мышь',
	re:'мыши',
	de:'мыши',
	ve:'мышь',
	te:'мышью',
	pe:'мыши',
	im:'мыши',
	rm:'мышей',
	dm:'мышам',
	vm:'мышей',
	tm:'мышами',
	pm:'мышах',
	rod:1,
	skl:3,
	odu:0,
	sbs:0,
	chr:1,
};
lx['муть']={
	ie:'муть',
	re:'мути',
	de:'мути',
	ve:'муть',
	te:'мутью',
	pe:'мути',
	im:'мути',
	rm:'мутей',
	dm:'мутям',
	vm:'мути',
	tm:'мутями',
	pm:'мутях',
	rod:1,
	skl:3,
	odu:0,
};
lx['мякоть']={
	ie:'мякоть',
	re:'мякоти',
	de:'мякоти',
	ve:'мякоть',
	te:'мякотью',
	pe:'мякоти',
	im:'мякоти',
	rm:'мякотей',
	dm:'мякотям',
	vm:'мякоти',
	tm:'мякотями',
	pm:'мякотях',
	rod:1,
	skl:3,
	odu:0,
};
lx['напасть']={
	ie:'напасть',
	re:'напасти',
	de:'напасти',
	ve:'напасть',
	te:'напастью',
	pe:'напасти',
	im:'напасти',
	rm:'напастей',
	dm:'напастям',
	vm:'напасти',
	tm:'напастями',
	pm:'напастях',
	rod:1,
	skl:3,
	odu:0,
};
lx['нашесть']={
	ie:'нашесть',
	re:'нашести',
	de:'нашести',
	ve:'нашесть',
	te:'нашестью',
	pe:'нашести',
	im:'нашести',
	rm:'нашестей',
	dm:'нашестям',
	vm:'нашести',
	tm:'нашестями',
	pm:'нашестях',
	rod:1,
	skl:3,
	odu:0,
};
lx['наукоград']={
	ie:'наукоград',
	re:'наукограда',
	de:'наукограду',
	ve:'наукоград',
	te:'наукоградом',
	pe:'наукограде',
	im:'наукограды',
	rm:'наукоградов',
	dm:'наукоградам',
	vm:'наукограды',
	tm:'наукоградами',
	pm:'наукоградах',
	rod:0,
	skl:2,
	odu:0,
};
lx['неделя']={
	ie:'неделя',
	re:'недели',
	de:'неделе',
	ve:'неделю',
	te:'неделей',
	pe:'неделе',
	im:'недели',
	rm:'недель',
	dm:'неделям',
	vm:'недели',
	tm:'неделями',
	pm:'неделях',
	rod:1,
	skl:1,
	odu:0,
};
lx['нежить']={
	ie:'нежить',
	re:'нежити',
	de:'нежити',
	ve:'нежить',
	te:'нежитью',
	pe:'нежити',
	im:'нежити',
	rm:'нежитей',
	dm:'нежитям',
	vm:'нежити',
	tm:'нежитями',
	pm:'нежитях',
	rod:1,
	skl:3,
	odu:0,
};
lx['ненависть']={
	ie:'ненависть',
	re:'ненависти',
	de:'ненависти',
	ve:'ненависть',
	te:'ненавистью',
	pe:'ненависти',
	im:'ненависти',
	rm:'ненавистей',
	dm:'ненавистям',
	vm:'ненависти',
	tm:'ненавистями',
	pm:'ненавистях',
	rod:1,
	skl:3,
	odu:0,
};
lx['несвежесть']={
	ie:'несвежесть',
	re:'несвежести',
	de:'несвежести',
	ve:'несвежесть',
	te:'несвежестью',
	pe:'несвежести',
	im:'несвежести',
	rm:'несвежестей',
	dm:'несвежестям',
	vm:'несвежести',
	tm:'несвежестями',
	pm:'несвежестях',
	rod:1,
	skl:3,
	odu:0,
};
lx['несхожесть']={
	ie:'несхожесть',
	re:'несхожести',
	de:'несхожести',
	ve:'несхожесть',
	te:'несхожестью',
	pe:'несхожести',
	im:'несхожести',
	rm:'несхожестей',
	dm:'несхожестям',
	vm:'несхожести',
	tm:'несхожестями',
	pm:'несхожестях',
	rod:1,
	skl:3,
	odu:0,
};
lx['неуклюжесть']={
	ie:'неуклюжесть',
	re:'неуклюжести',
	de:'неуклюжести',
	ve:'неуклюжесть',
	te:'неуклюжестью',
	pe:'неуклюжести',
	im:'неуклюжести',
	rm:'неуклюжестей',
	dm:'неуклюжестям',
	vm:'неуклюжести',
	tm:'неуклюжестями',
	pm:'неуклюжестях',
	rod:1,
	skl:3,
	odu:0,
};
lx['Николаевна']={
	ie:'Николаевна',
	re:'Николаевны',
	de:'Николаевне',
	ve:'Николаевну',
	te:'Николаевной',
	pe:'Николаевне',
	im:'Николаевны',
	rm:'Николаевн',
	dm:'Николаевнам',
	vm:'Николаевн',
	tm:'Николаевнами',
	pm:'Николаевнах',
	rod:1,
	skl:1,
	odu:0,
};
lx['ночь']={
	ie:'ночь',
	re:'ночи',
	de:'ночи',
	ve:'ночь',
	te:'ночью',
	pe:'ночи',
	im:'ночи',
	rm:'ночей',
	dm:'ночям',
	vm:'ночи',
	tm:'ночями',
	pm:'ночях',
	rod:2,
	skl:3,
	odu:0,
	sbs:0,
	chr:1,
};
lx['ноябрь']={
	ie:'ноябрь',
	re:'ноября',
	de:'ноябрю',
	ve:'ноябрь',
	te:'ноябрём',
	pe:'ноябре',
	im:'ноябри',
	rm:'ноябрей',
	dm:'ноябрям',
	vm:'ноябри',
	tm:'ноябрями',
	pm:'ноябрях',
	rod:0,
	skl:2,
	odu:0,
};
lx['октябрь']={
	ie:'октябрь',
	re:'октября',
	de:'октябрю',
	ve:'октябрь',
	te:'октябрём',
	pe:'октябре',
	im:'октябри',
	rm:'октябрей',
	dm:'октябрям',
	vm:'октябри',
	tm:'октябрями',
	pm:'октябрях',
	rod:0,
	skl:2,
	odu:0,
};
lx['Олеся']={
	ie:'Олеся',
	re:'Олеси',
	de:'Олесе',
	ve:'Олесю',
	te:'Олесей',
	pe:'Олесе',
	im:'Олеси',
	rm:'Олесь',
	dm:'Олесям',
	vm:'Олесь',
	tm:'Олесями',
	pm:'Олесях',
	rod:1,
	skl:1,
	odu:0,
};
lx['Ольга']={
	ie:'Ольга',
	re:'Ольги',
	de:'Ольге',
	ve:'Ольгу',
	te:'Ольгой',
	pe:'Ольге',
	im:'Ольги',
	rm:'Ольг',
	dm:'Ольгам',
	vm:'Ольг',
	tm:'Ольгами',
	pm:'Ольгах',
	rod:1,
	skl:1,
	odu:0,
};
lx['орёл']={
	ie:'орёл',
	re:'орла',
	de:'орлу',
	ve:'орла',
	te:'орлом',
	pe:'орле',
	im:'орлы',
	rm:'орлов',
	dm:'орлам',
	vm:'орлов',
	tm:'орлами',
	pm:'орлах',
	rod:0,
	skl:2,
	odu:0,
};
lx['осёл']={
	ie:'осёл',
	re:'осла',
	de:'ослу',
	ve:'осла',
	te:'ослом',
	pe:'осле',
	im:'ослы',
	rm:'ослов',
	dm:'ослам',
	vm:'ослов',
	tm:'ослами',
	pm:'ослах',
	rod:0,
	skl:2,
	odu:0,
};
lx['оторопь']={
	ie:'оторопь',
	re:'оторопи',
	de:'оторопи',
	ve:'оторопь',
	te:'оторопью',
	pe:'оторопи',
	im:'оторопи',
	rm:'оторопей',
	dm:'оторопям',
	vm:'оторопи',
	tm:'оторопями',
	pm:'оторопях',
	rod:1,
	skl:3,
	odu:0,
	sbs:0,
	chr:1,
};
lx['отрезок']={
	ie:'отрезок',
	re:'отрезка',
	de:'отрезку',
	ve:'отрезок',
	te:'отрезком',
	pe:'отрезке',
	im:'отрезки',
	rm:'отрезков',
	dm:'отрезкам',
	vm:'отрезки',
	tm:'отрезками',
	pm:'отрезках',
	rod:0,
	skl:2,
	odu:0,
};
lx['офис']={
	ie:'офис',
	re:'офиса',
	de:'офису',
	ve:'офис',
	te:'офисом',
	pe:'офисе',
	im:'офисы',
	rm:'офисов',
	dm:'офисам',
	vm:'офисы',
	tm:'офисами',
	pm:'офисах',
	rod:0,
	skl:2,
	odu:0,
};
lx['очко']={
	ie:'очко',
	re:'очка',
	de:'очку',
	ve:'очко',
	te:'очком',
	pe:'очке',
	im:'очки',
	rm:'очков',
	dm:'очкам',
	vm:'очки',
	tm:'очками',
	pm:'очках',
	rod:2,
	skl:2,
	odu:0,
	sbs:0,
	chr:1,
};
lx['панель']={
	ie:'панель',
	re:'панели',
	de:'панели',
	ve:'панель',
	te:'панелью',
	pe:'панели',
	im:'панели',
	rm:'панелей',
	dm:'панелям',
	vm:'панели',
	tm:'панелями',
	pm:'панелях',
	rod:1,
	skl:2,
	odu:0,
	sbs:0,
	chr:1,
};
lx['параллелограмм']={
	ie:'параллелограмм',
	re:'параллелограмма',
	de:'параллелограмму',
	ve:'параллелограмм',
	te:'параллелограммом',
	pe:'параллелограмме',
	im:'параллелограммы',
	rm:'параллелограммов',
	dm:'параллелограммам',
	vm:'параллелограммы',
	tm:'параллелограммами',
	pm:'параллелограммах',
	rod:0,
	skl:2,
	odu:0,
};
lx['пароход']={
	ie:'пароход',
	re:'парохода',
	de:'пароходу',
	ve:'пароход',
	te:'пароходом',
	pe:'пароходе',
	im:'пароходы',
	rm:'пароходов',
	dm:'пароходам',
	vm:'пароходы',
	tm:'пароходами',
	pm:'пароходах',
	rod:0,
	skl:2,
	odu:0,
};
lx['пахучесть']={
	ie:'пахучесть',
	re:'пахучести',
	de:'пахучести',
	ve:'пахучесть',
	te:'пахучестью',
	pe:'пахучести',
	im:'пахучести',
	rm:'пахучестей',
	dm:'пахучестям',
	vm:'пахучести',
	tm:'пахучестями',
	pm:'пахучестях',
	rod:1,
	skl:3,
	odu:0,
};
lx['ПГТ']={
	ie:'ПГТ',
	re:'ПГТ',
	de:'ПГТ',
	ve:'ПГТ',
	te:'ПГТ',
	pe:'ПГТ',
	im:'ПГТ',
	rm:'ПГТ',
	dm:'ПГТ',
	vm:'ПГТ',
	tm:'ПГТ',
	pm:'ПГТ',
	rod:0,
	skl:0,
	odu:0,
};
lx['певучесть']={
	ie:'певучесть',
	re:'певучести',
	de:'певучести',
	ve:'певучесть',
	te:'певучестью',
	pe:'певучести',
	im:'певучести',
	rm:'певучестей',
	dm:'певучестям',
	vm:'певучести',
	tm:'певучестями',
	pm:'певучестях',
	rod:1,
	skl:3,
	odu:0,
};
lx['пенобетон']={
	ie:'пенобетон',
	re:'пенобетона',
	de:'пенобетону',
	ve:'пенобетон',
	te:'пенобетоном',
	pe:'пенобетоне',
	im:'пенобетоны',
	rm:'пенобетонов',
	dm:'пенобетонам',
	vm:'пенобетоны',
	tm:'пенобетонами',
	pm:'пенобетонах',
	rod:0,
	skl:2,
	odu:0,
};
lx['песок']={
	ie:'песок',
	re:'песка',
	de:'песку',
	ve:'песок',
	te:'песком',
	pe:'песке',
	im:'пески',
	rm:'песков',
	dm:'пескам',
	vm:'пески',
	tm:'песками',
	pm:'песках',
	rod:0,
	skl:2,
	odu:0,
};
lx['песчаник']={
	ie:'песчаник',
	re:'песчаника',
	de:'песчанику',
	ve:'песчаник',
	te:'песчаником',
	pe:'песчанике',
	im:'песчаники',
	rm:'песчаников',
	dm:'песчаникам',
	vm:'песчаники',
	tm:'песчаниками',
	pm:'песчаниках',
	rod:0,
	skl:2,
	odu:0,
};
lx['Петровна']={
	ie:'Петровна',
	re:'Петровны',
	de:'Петровне',
	ve:'Петровну',
	te:'Петровной',
	pe:'Петровне',
	im:'Петровны',
	rm:'Петровн',
	dm:'Петровнам',
	vm:'Петровн',
	tm:'Петровнами',
	pm:'Петровнах',
	rod:1,
	skl:1,
	odu:0,
};
lx['печень']={
	ie:'печень',
	re:'печени',
	de:'печени',
	ve:'печень',
	te:'печенью',
	pe:'печени',
	im:'печени',
	rm:'печеней',
	dm:'печеням',
	vm:'печени',
	tm:'печенями',
	pm:'печенях',
	rod:1,
	skl:3,
	odu:0,
	sbs:0,
	chr:1,
};
lx['пирожок']={
	ie:'пирожок',
	re:'пирожка',
	de:'пирожку',
	ve:'пирожок',
	te:'пирожком',
	pe:'пирожке',
	im:'пирожки',
	rm:'пирожков',
	dm:'пирожкам',
	vm:'пирожки',
	tm:'пирожами',
	pm:'пирожах',
	rod:0,
	skl:2,
	odu:0,
};
lx['плавучесть']={
	ie:'плавучесть',
	re:'плавучести',
	de:'плавучести',
	ve:'плавучесть',
	te:'плавучестью',
	pe:'плавучести',
	im:'плавучести',
	rm:'плавучестей',
	dm:'плавучестям',
	vm:'плавучести',
	tm:'плавучестями',
	pm:'плавучестях',
	rod:1,
	skl:3,
	odu:0,
};
lx['платье']={
	ie:'платье',
	re:'платья',
	de:'платью',
	ve:'платье',
	te:'платьем',
	pe:'платье',
	im:'платья',
	rm:'платьев',
	dm:'платьям',
	vm:'платья',
	tm:'платьями',
	pm:'платьях',
	rod:2,
	skl:2,
	odu:0,
	sbs:0,
	chr:1,
};
lx['площадь']={
	ie:'площадь',
	re:'площади',
	de:'площади',
	ve:'площадь',
	te:'площадью',
	pe:'площади',
	im:'площади',
	rm:'площадей',
	dm:'площадям',
	vm:'площади',
	tm:'площадями',
	pm:'площадях',
	rod:1,
	skl:3,
	odu:0,
	sbs:0,
	chr:1,
};
lx['плывучесть']={
	ie:'плывучесть',
	re:'плывучести',
	de:'плывучести',
	ve:'плывучесть',
	te:'плывучестью',
	pe:'плывучести',
	im:'плывучести',
	rm:'плывучестей',
	dm:'плывучестям',
	vm:'плывучести',
	tm:'плывучестями',
	pm:'плывучестях',
	rod:1,
	skl:3,
	odu:0,
};
lx['повесть']={
	ie:'повесть',
	re:'повести',
	de:'повести',
	ve:'повесть',
	te:'повестью',
	pe:'повести',
	im:'повести',
	rm:'повестей',
	dm:'повестям',
	vm:'повести',
	tm:'повестями',
	pm:'повестях',
	rod:1,
	skl:3,
	odu:0,
};
lx['поезд']={
	ie:'поезд',
	re:'поезда',
	de:'поезду',
	ve:'поезд',
	te:'поездом',
	pe:'поезде',
	im:'поезды',
	rm:'поездов',
	dm:'поездам',
	vm:'поезды',
	tm:'поездами',
	pm:'поездах',
	rod:0,
	skl:2,
	odu:0,
};
lx['ползучесть']={
	ie:'ползучесть',
	re:'ползучести',
	de:'ползучести',
	ve:'ползучесть',
	te:'ползучестью',
	pe:'ползучести',
	im:'ползучести',
	rm:'ползучестей',
	dm:'ползучестям',
	vm:'ползучести',
	tm:'ползучестями',
	pm:'ползучестях',
	rod:1,
	skl:3,
	odu:0,
};
lx['полуинтервал']={
	ie:'полуинтервал',
	re:'полуинтервала',
	de:'полуинтервалу',
	ve:'полуинтервал',
	te:'полуинтервалом',
	pe:'полуинтервале',
	im:'полуинтервалы',
	rm:'полуинтервалов',
	dm:'полуинтервалам',
	vm:'полуинтервалы',
	tm:'полуинтервалами',
	pm:'полуинтервалах',
	rod:0,
	skl:2,
	odu:0,
};
lx['Польша']={
	ie:'Польша',
	re:'Польши',
	de:'Польше',
	ve:'Польшу',
	te:'Польшой',
	pe:'Польше',
	im:'Польши',
	rm:'Польш',
	dm:'Польшам',
	vm:'Польши',
	tm:'Польшами',
	pm:'Польшах',
	rod:1,
	skl:1,
	odu:0,
};
lx['понедельник']={
	ie:'понедельник',
	re:'понедельника',
	de:'понедельнику',
	ve:'понедельник',
	te:'понедельником',
	pe:'понедельнике',
	im:'понедельники',
	rm:'понедельников',
	dm:'понедельникам',
	vm:'понедельники',
	tm:'понедельниками',
	pm:'понедельниках',
	rod:0,
	skl:2,
	odu:0,
};
lx['посёлок']={
	ie:'посёлок',
	re:'посёлка',
	de:'посёлку',
	ve:'посёлок',
	te:'посёлком',
	pe:'посёлке',
	im:'посёлки',
	rm:'посёлков',
	dm:'посёлкам',
	vm:'посёлки',
	tm:'посёлками',
	pm:'посёлках',
	rod:0,
	skl:2,
	odu:0,
};
lx['поступь']={
	ie:'поступь',
	re:'поступи',
	de:'поступи',
	ve:'поступь',
	te:'поступью',
	pe:'поступи',
	im:'поступи',
	rm:'поступей',
	dm:'поступям',
	vm:'поступи',
	tm:'поступями',
	pm:'поступях',
	rod:1,
	skl:3,
	odu:0,
	sbs:0,
	chr:1,
};
lx['похожесть']={
	ie:'похожесть',
	re:'похожести',
	de:'похожести',
	ve:'похожесть',
	te:'похожестью',
	pe:'похожести',
	im:'похожести',
	rm:'похожестей',
	dm:'похожестям',
	vm:'похожести',
	tm:'похожестями',
	pm:'похожестях',
	rod:1,
	skl:3,
	odu:0,
};
lx['почесть']={
	ie:'почесть',
	re:'почести',
	de:'почести',
	ve:'почесть',
	te:'почестью',
	pe:'почести',
	im:'почести',
	rm:'почестей',
	dm:'почестям',
	vm:'почести',
	tm:'почестями',
	pm:'почестях',
	rod:1,
	skl:3,
	odu:0,
};
lx['прелесть']={
	ie:'прелесть',
	re:'прелести',
	de:'прелести',
	ve:'прелесть',
	te:'прелестью',
	pe:'прелести',
	im:'прелести',
	rm:'прелестей',
	dm:'прелестям',
	vm:'прелести',
	tm:'прелестями',
	pm:'прелестях',
	rod:1,
	skl:3,
	odu:0,
};
lx['пригожесть']={
	ie:'пригожесть',
	re:'пригожести',
	de:'пригожести',
	ve:'пригожесть',
	te:'пригожестью',
	pe:'пригожести',
	im:'пригожести',
	rm:'пригожестей',
	dm:'пригожестям',
	vm:'пригожести',
	tm:'пригожестями',
	pm:'пригожестях',
	rod:1,
	skl:3,
	odu:0,
};
lx['приязнь']={
	ie:'приязнь',
	re:'приязни',
	de:'приязни',
	ve:'приязнь',
	te:'приязнью',
	pe:'приязни',
	im:'приязни',
	rm:'приязней',
	dm:'приязням',
	vm:'приязни',
	tm:'приязнями',
	pm:'приязнях',
	rod:1,
	skl:3,
	odu:0,
	sbs:0,
	chr:1,
};
lx['программистка']={
	ie:'программистка',
	re:'программистки',
	de:'программистке',
	ve:'программистку',
	te:'программисткой',
	pe:'программистке',
	im:'программистки',
	rm:'программисток',
	dm:'программисткам',
	vm:'программисток',
	tm:'программистками',
	pm:'программистках',
	rod:1,
	skl:1,
	odu:0,
};
lx['проклятье']={
	ie:'проклятье',
	re:'проклятья',
	de:'проклятью',
	ve:'проклятье',
	te:'проклятьем',
	pe:'проклятье',
	im:'проклятья',
	rm:'проклятий',
	dm:'проклятьям',
	vm:'проклятья',
	tm:'проклятьями',
	pm:'проклятьях',
	rod:2,
	skl:2,
	odu:0,
	sbs:0,
	chr:1,
};
lx['промежуток']={
	ie:'промежуток',
	re:'промежутка',
	de:'промежутку',
	ve:'промежуток',
	te:'промежутком',
	pe:'промежутке',
	im:'промежутки',
	rm:'промежутков',
	dm:'промежуткам',
	vm:'промежутки',
	tm:'промежутками',
	pm:'промежутках',
	rod:0,
	skl:2,
	odu:0,
};
lx['проповедь']={
	ie:'проповедь',
	re:'проповеди',
	de:'проповеди',
	ve:'проповедь',
	te:'проповедью',
	pe:'проповеди',
	im:'проповеди',
	rm:'проповедей',
	dm:'проповедям',
	vm:'проповеди',
	tm:'проповедями',
	pm:'проповедях',
	rod:1,
	skl:3,
	odu:0,
};
lx['прыгучесть']={
	ie:'прыгучесть',
	re:'прыгучести',
	de:'прыгучести',
	ve:'прыгучесть',
	te:'прыгучестью',
	pe:'прыгучести',
	im:'прыгучести',
	rm:'прыгучестей',
	dm:'прыгучестям',
	vm:'прыгучести',
	tm:'прыгучестями',
	pm:'прыгучестях',
	rod:1,
	skl:3,
	odu:0,
};
lx['прямоугольник']={
	ie:'прямоугольник',
	re:'прямоугольника',
	de:'прямоугольнику',
	ve:'прямоугольник',
	te:'прямоугольником',
	pe:'прямоугольнике',
	im:'прямоугольники',
	rm:'прямоугольников',
	dm:'прямоугольникам',
	vm:'прямоугольники',
	tm:'прямоугольниками',
	pm:'прямоугольниках',
	rod:0,
	skl:2,
	odu:0,
};
lx['пункт']={
	ie:'пункт',
	re:'пункта',
	de:'пункту',
	ve:'пункт',
	te:'пунктом',
	pe:'пункте',
	im:'пункты',
	rm:'пунктов',
	dm:'пунктам',
	vm:'пункты',
	tm:'пунктами',
	pm:'пунктах',
	rod:0,
	skl:2,
	odu:0,
};
lx['путь']={
	ie:'путь',
	re:'пути',
	de:'пути',
	ve:'путь',
	te:'путём',
	pe:'пути',
	im:'пути',
	rm:'путей',
	dm:'путям',
	vm:'пути',
	tm:'путями',
	pm:'путях',
	rod:0,
	skl:2,
	odu:0,
};
lx['пядь']={
	ie:'пядь',
	re:'пяди',
	de:'пяди',
	ve:'пядь',
	te:'пядью',
	pe:'пяди',
	im:'пяди',
	rm:'пядей',
	dm:'пядям',
	vm:'пяди',
	tm:'пядями',
	pm:'пядях',
	rod:1,
	skl:3,
	odu:0,
	sbs:0,
	chr:1,
};
lx['пятница']={
	ie:'пятница',
	re:'пятницы',
	de:'пятнице',
	ve:'пятницу',
	te:'пятницей',
	pe:'пятнице',
	im:'пятницы',
	rm:'пятниц',
	dm:'пятницам',
	vm:'пятницы',
	tm:'пятницами',
	pm:'пятницах',
	rod:1,
	skl:1,
	odu:0,
};
lx['радость']={
	ie:'радость',
	re:'радости',
	de:'радости',
	ve:'радость',
	te:'радостью',
	pe:'радости',
	im:'радости',
	rm:'радостей',
	dm:'радостям',
	vm:'радости',
	tm:'радостями',
	pm:'радостях',
	rod:1,
	skl:3,
	odu:0,
	sbs:0,
	chr:1,
};
lx['раз']={
	ie:'раз',
	re:'раза',
	de:'разу',
	ve:'раз',
	te:'разом',
	pe:'разе',
	im:'разы',
	rm:'раз',
	dm:'разам',
	vm:'разы',
	tm:'разами',
	pm:'разах',
	rod:0,
	skl:2,
	odu:0,
	sbs:0,
	chr:1,
};
lx['раствор']={
	ie:'раствор',
	re:'раствора',
	de:'раствору',
	ve:'раствор',
	te:'раствором',
	pe:'растворе',
	im:'растворы',
	rm:'растворов',
	dm:'растворам',
	vm:'растворы',
	tm:'растворами',
	pm:'растворах',
	rod:0,
	skl:2,
	odu:0,
};
lx['ребёнок']={
	ie:'ребёнок',
	re:'ребёнка',
	de:'ребёнку',
	ve:'ребёнка',
	te:'ребёнком',
	pe:'ребёнке',
	im:'ребята',
	rm:'ребят',
	dm:'ребятам',
	vm:'ребят',
	tm:'ребятами',
	pm:'ребятах',
	rod:0,
	skl:2,
	odu:1,
	sbs:0,
	chr:1,
};
lx['рожь']={
	ie:'рожь',
	re:'ржи',
	de:'ржи',
	ve:'рожь',
	te:'рожью',
	pe:'ржи',
	im:'ржи',
	rm:'ржей',
	dm:'ржам',
	vm:'ржи',
	tm:'ржами',
	pm:'ржах',
	rod:1,
	skl:3,
	odu:0,
	sbs:0,
	chr:1,
};
lx['ромб']={
	ie:'ромб',
	re:'ромба',
	de:'ромбу',
	ve:'ромб',
	te:'ромбом',
	pe:'ромбе',
	im:'ромбы',
	rm:'ромбов',
	dm:'ромбам',
	vm:'ромбы',
	tm:'ромбами',
	pm:'ромбах',
	rod:0,
	skl:2,
	odu:0,
};
lx['Рособрнадзор']={
	ie:'Рособрнадзор',
	re:'Рособрнадзора',
	de:'Рособрнадзору',
	ve:'Рособрнадзор',
	te:'Рособрнадзором',
	pe:'Рособрнадзоре',
	im:'Рособрнадзоры',
	rm:'Рособрнадзоров',
	dm:'Рособрнадзорам',
	vm:'Рособрнадзоры',
	tm:'Рособрнадзорами',
	pm:'Рособрнадзорах',
	rod:0,
	skl:2,
	odu:0,
};
lx['Россия']={
	ie:'Россия',
	re:'России',
	de:'России',
	ve:'Россию',
	te:'Россией',
	pe:'России',
	im:'России',
	rm:'Россий',
	dm:'Россиям',
	vm:'России',
	tm:'Россиями',
	pm:'Россиях',
	rod:1,
	skl:1,
	odu:0,
};
lx['ртуть']={
	ie:'ртуть',
	re:'ртути',
	de:'ртути',
	ve:'ртуть',
	te:'ртутью',
	pe:'ртути',
	im:'ртути',
	rm:'ртутей',
	dm:'ртутям',
	vm:'ртути',
	tm:'ртутями',
	pm:'ртутях',
	rod:1,
	skl:3,
	odu:0,
};
lx['рубль']={
	ie:'рубль',
	re:'рубля',
	de:'рублю',
	ve:'рубль',
	te:'рублём',
	pe:'рубле',
	im:'рубли',
	rm:'рублей',
	dm:'рублям',
	vm:'рубли',
	tm:'рублями',
	pm:'рублях',
	rod:0,
	skl:2,
	odu:0,
};
lx['рука']={
	ie:'рука',
	re:'руки',
	de:'руке',
	ve:'руку',
	te:'рукой',
	pe:'руке',
	im:'руки',
	rm:'рук',
	dm:'рукам',
	vm:'руки',
	tm:'руками',
	pm:'руках',
	rod:1,
	skl:1,
	odu:0,
};
lx['ручка']={
	ie:'ручка',
	re:'ручки',
	de:'ручке',
	ve:'ручку',
	te:'ручкой',
	pe:'ручке',
	im:'ручки',
	rm:'ручек',
	dm:'ручкам',
	vm:'ручки',
	tm:'ручками',
	pm:'ручках',
	rod:1,
	skl:1,
	odu:0,
};
lx['Санкт-Петербург']={
	ie:'Санкт-Петербург',
	re:'Санкт-Петербурга',
	de:'Санкт-Петербургу',
	ve:'Санкт-Петербург',
	te:'Санкт-Петербургом',
	pe:'Санкт-Петербурге',
	im:'Санкт-Петербурги',
	rm:'Санкт-Петербургов',
	dm:'Санкт-Петербургам',
	vm:'Санкт-Петербурги',
	tm:'Санкт-Петербургами',
	pm:'Санкт-Петербургах',
	rod:0,
	skl:2,
	odu:0,
};
lx['сантиметр']={
	ie:'сантиметр',
	re:'сантиметра',
	de:'сантиметру',
	ve:'сантиметр',
	te:'сантиметром',
	pe:'сантиметре',
	im:'сантиметры',
	rm:'сантиметров',
	dm:'сантиметрам',
	vm:'сантиметры',
	tm:'сантиметрами',
	pm:'сантиметрах',
	rod:0,
	skl:2,
	odu:0,
	skr:'см',
};
lx['свежесть']={
	ie:'свежесть',
	re:'свежести',
	de:'свежести',
	ve:'свежесть',
	te:'свежестью',
	pe:'свежести',
	im:'свежести',
	rm:'свежестей',
	dm:'свежестям',
	vm:'свежести',
	tm:'свежестями',
	pm:'свежестях',
	rod:1,
	skl:3,
	odu:0,
};
lx['свекровь']={
	ie:'свекровь',
	re:'свекрови',
	de:'свекрови',
	ve:'свекровь',
	te:'свекровью',
	pe:'свекрови',
	im:'свекрови',
	rm:'свекровей',
	dm:'свекровям',
	vm:'свекрови',
	tm:'свекровями',
	pm:'свекровях',
	rod:1,
	skl:3,
	odu:1,
	sbs:0,
	chr:1,
};
lx['сверхтекучесть']={
	ie:'сверхтекучесть',
	re:'сверхтекучести',
	de:'сверхтекучести',
	ve:'сверхтекучесть',
	te:'сверхтекучестью',
	pe:'сверхтекучести',
	im:'сверхтекучести',
	rm:'сверхтекучестей',
	dm:'сверхтекучестям',
	vm:'сверхтекучести',
	tm:'сверхтекучестями',
	pm:'сверхтекучестях',
	rod:1,
	skl:3,
	odu:0,
};
lx['секретариат']={
	ie:'секретариат',
	re:'секретариата',
	de:'секретариату',
	ve:'секретариат',
	te:'секретариатом',
	pe:'секретариате',
	im:'секретариаты',
	rm:'секретариатов',
	dm:'секретариатам',
	vm:'секретариаты',
	tm:'секретариатами',
	pm:'секретариатах',
	rod:0,
	skl:2,
	odu:0,
};
lx['село']={
	ie:'село',
	re:'села',
	de:'селу',
	ve:'село',
	te:'селом',
	pe:'селе',
	im:'сёла',
	rm:'сёл',
	dm:'сёлам',
	vm:'сёла',
	tm:'сёлами',
	pm:'сёлах',
	rod:2,
	skl:2,
	odu:0,
};
lx['Семилуки']={
	ie:'Семилуки',
	re:'Семилук',
	de:'Семилукам',
	ve:'Семилуки',
	te:'Семилуками',
	pe:'Семилуках',
	im:'Семилуки',
	rm:'Семилук',
	dm:'Семилукам',
	vm:'Семилуки',
	tm:'Семилуками',
	pm:'Семилуках',
	rod:3,
	skl:2,
	odu:0,
};
lx['сентябрь']={
	ie:'сентябрь',
	re:'сентября',
	de:'сентябрю',
	ve:'сентябрь',
	te:'сентябре',
	pe:'сентябре',
	im:'сентябри',
	rm:'сентябрей',
	dm:'сентябрям',
	vm:'сентябри',
	tm:'сентябрями',
	pm:'сентябрях',
	rod:0,
	skl:2,
	odu:0,
};
lx['Сербия']={
	ie:'Сербия',
	re:'Сербии',
	de:'Сербии',
	ve:'Сербию',
	te:'Сербией',
	pe:'Сербии',
	im:'Сербии',
	rm:'Сербий',
	dm:'Сербиям',
	vm:'Сербии',
	tm:'Сербиями',
	pm:'Сербиях',
	rod:1,
	skl:1,
	odu:0,
};
lx['Сергеевна']={
	ie:'Сергеевна',
	re:'Сергеевны',
	de:'Сергеевне',
	ve:'Сергеевну',
	te:'Сергеевной',
	pe:'Сергеевне',
	im:'Сергеевны',
	rm:'Сергеевн',
	dm:'Сергеевнам',
	vm:'Сергеевн',
	tm:'Сергеевнами',
	pm:'Сергеевнах',
	rod:1,
	skl:1,
	odu:0,
};
lx['склонение']={
	ie:'склонение',
	re:'склонения',
	de:'склонению',
	ve:'склонение',
	te:'склонением',
	pe:'склонении',
	im:'склонения',
	rm:'склонений',
	dm:'склонениям',
	vm:'склонения',
	tm:'склонениями',
	pm:'склонениях',
	rod:2,
	skl:2,
	odu:0,
	sbs:0,
	chr:1,
};
lx['скотч']={
	ie:'скотч',
	re:'скотча',
	de:'скотчу',
	ve:'скотч',
	te:'скотчем',
	pe:'скотче',
	im:'скотчи',
	rm:'скотчей',
	dm:'скотчам',
	vm:'скотчи',
	tm:'скотчами',
	pm:'скотчах',
	rod:0,
	skl:2,
	odu:0,
	sbs:0,
	chr:1,
};
lx['скрижаль']={
	ie:'скрижаль',
	re:'скрижали',
	de:'скрижали',
	ve:'скрижаль',
	te:'скрижалью',
	pe:'скрижали',
	im:'скрижали',
	rm:'скрижалей',
	dm:'скрижалям',
	vm:'скрижали',
	tm:'скрижалями',
	pm:'скрижалях',
	rod:2,
	skl:3,
	odu:0,
};
lx['Словакия']={
	ie:'Словакия',
	re:'Словакии',
	de:'Словакии',
	ve:'Словакию',
	te:'Словакией',
	pe:'Словакии',
	im:'Словакии',
	rm:'Словакий',
	dm:'Словакиям',
	vm:'Словакии',
	tm:'Словакиями',
	pm:'Словакиях',
	rod:1,
	skl:1,
	odu:0,
};
lx['словарь']={
	ie:'словарь',
	re:'словаря',
	de:'словарю',
	ve:'словарь',
	te:'словарем',
	pe:'словаре',
	im:'словари',
	rm:'словарей',
	dm:'словарям',
	vm:'словари',
	tm:'словарями',
	pm:'словарях',
	rod:0,
	skl:2,
	odu:0,
	chr:1,
};
lx['Словения']={
	ie:'Словения',
	re:'Словении',
	de:'Словении',
	ve:'Словению',
	te:'Словенией',
	pe:'Словении',
	im:'Словении',
	rm:'Словений',
	dm:'Словениям',
	vm:'Словении',
	tm:'Словениями',
	pm:'Словениях',
	rod:1,
	skl:1,
	odu:0,
};
lx['слово']={
	ie:'слово',
	re:'слова',
	de:'слову',
	ve:'слове',
	te:'словом',
	pe:'слове',
	im:'слова',
	rm:'слов',
	dm:'словам',
	vm:'слова',
	tm:'словами',
	pm:'словах',
	rod:2,
	skl:2,
	odu:0,
	chr:1,
};
lx['смерть']={
	ie:'смерть',
	re:'смерти',
	de:'смерти',
	ve:'смерть',
	te:'смертью',
	pe:'смерти',
	im:'смерти',
	rm:'смертей',
	dm:'смертям',
	vm:'смерти',
	tm:'смертями',
	pm:'смертях',
	rod:1,
	skl:3,
	odu:0,
	sbs:0,
	chr:1,
};
lx['совесть']={
	ie:'совесть',
	re:'совести',
	de:'совести',
	ve:'совесть',
	te:'совестью',
	pe:'совести',
	im:'совести',
	rm:'совестей',
	dm:'совестям',
	vm:'совести',
	tm:'совестями',
	pm:'совестях',
	rod:1,
	skl:3,
	odu:0,
	sbs:0,
	chr:1,
};
lx['солярка']={
	ie:'солярка',
	re:'солярки',
	de:'солярке',
	ve:'солярку',
	te:'соляркой',
	pe:'солярке',
	im:'солярки',
	rm:'солярк',
	dm:'соляркам',
	vm:'солярки',
	tm:'солярками',
	pm:'солярках',
	rod:1,
	skl:1,
	odu:0,
};
lx['Сочи']={
	ie:'Сочи',
	re:'Сочи',
	de:'Сочи',
	ve:'Сочи',
	te:'Сочи',
	pe:'Сочи',
	im:'Сочи',
	rm:'Сочи',
	dm:'Сочи',
	vm:'Сочи',
	tm:'Сочи',
	pm:'Сочи',
	rod:1,
	skl:0,
	odu:0,
};
lx['справедливость']={
	ie:'справедливость',
	re:'справедливости',
	de:'справедливости',
	ve:'справедливость',
	te:'справедливостью',
	pe:'справедливости',
	im:'справедливости',
	rm:'справедливостей',
	dm:'справедливостям',
	vm:'справедливости',
	tm:'справедливостями',
	pm:'справедливостях',
	rod:1,
	skl:3,
	odu:0,
	sbs:0,
	chr:1,
};

lx['среда']={
	ie:'среда',
	re:'среды',
	de:'среде',
	ve:'среду',
	te:'средой',
	pe:'среде',
	im:'среды',
	rm:'сред',
	dm:'средам',
	vm:'среды',
	tm:'средами',
	pm:'средах',
	rod:1,
	skl:1,
	odu:0,
};
lx['стекло']={
	ie:'стекло',
	re:'стекла',
	de:'стеклу',
	ve:'стекло',
	te:'стеклом',
	pe:'стекле',
	im:'стёкла',
	rm:'стёкол',
	dm:'стёклам',
	vm:'стёкла',
	tm:'стёклами',
	pm:'стёклах',
	rod:2,
	skl:2,
	odu:0,
	sbs:0,
	chr:1,
};
lx['степь']={
	ie:'степь',
	re:'степи',
	de:'степи',
	ve:'степь',
	te:'степью',
	pe:'степи',
	im:'степи',
	rm:'степей',
	dm:'степям',
	vm:'степи',
	tm:'степями',
	pm:'степях',
	rod:1,
	skl:3,
	odu:0,
	sbs:0,
	chr:1,
};
lx['стерлядь']={
	ie:'стерлядь',
	re:'стерляди',
	de:'стерляди',
	ve:'стерлядь',
	te:'стерлядью',
	pe:'стерляди',
	im:'стерляди',
	rm:'стерлядей',
	dm:'стерлядям',
	vm:'стерляди',
	tm:'стерлядями',
	pm:'стерлядях',
	rod:1,
	skl:3,
	odu:0,
};
lx['сторона']={
	ie:'сторона',
	re:'стороны',
	de:'стороне',
	ve:'сторону',
	te:'стороной',
	pe:'стороне',
	im:'стороны',
	rm:'сторон',
	dm:'сторонам',
	vm:'стороны',
	tm:'сторонами',
	pm:'сторонах',
	rod:1,
	skl:1,
	odu:0,
};
lx['страсть']={
	ie:'страсть',
	re:'страсти',
	de:'страсти',
	ve:'страсть',
	te:'страстью',
	pe:'страсти',
	im:'страсти',
	rm:'страстей',
	dm:'страстям',
	vm:'страсти',
	tm:'страстями',
	pm:'страстях',
	rod:1,
	skl:3,
	odu:0,
	sbs:0,
	chr:1,
};
lx['строгость']={
	ie:'строгость',
	re:'строгости',
	de:'строгости',
	ve:'строгость',
	te:'строгостью',
	pe:'строгости',
	im:'строгости',
	rm:'строгостей',
	dm:'строгостям',
	vm:'строгости',
	tm:'строгостями',
	pm:'строгостях',
	rod:1,
	skl:3,
	odu:0,
	sbs:0,
	chr:1,
};
lx['студентка']={
	ie:'студентка',
	re:'студентки',
	de:'студентке',
	ve:'студентку',
	te:'студенткой',
	pe:'студентке',
	im:'студентки',
	rm:'студенток',
	dm:'студенткам',
	vm:'студенток',
	tm:'студентками',
	pm:'студентках',
	rod:1,
	skl:1,
	odu:0,
};
lx['суббота']={
	ie:'суббота',
	re:'субботы',
	de:'субботе',
	ve:'субботу',
	te:'субботой',
	pe:'субботе',
	im:'субботы',
	rm:'суббот',
	dm:'субботам',
	vm:'субботы',
	tm:'субботами',
	pm:'субботах',
	rod:1,
	skl:1,
	odu:0,
};
lx['сувенир']={
	ie:'сувенир',
	re:'сувенира',
	de:'сувениру',
	ve:'сувенир',
	te:'сувениром',
	pe:'сувенире',
	im:'сувениры',
	rm:'сувениров',
	dm:'сувенирам',
	vm:'сувениры',
	tm:'сувенирами',
	pm:'сувенирах',
	rod:0,
	skl:2,
	odu:0,
};
lx['схожесть']={
	ie:'схожесть',
	re:'схожести',
	de:'схожести',
	ve:'схожесть',
	te:'схожестью',
	pe:'схожести',
	im:'схожести',
	rm:'схожестей',
	dm:'схожестям',
	vm:'схожести',
	tm:'схожестями',
	pm:'схожестях',
	rod:1,
	skl:3,
	odu:0,
};
lx['сыпучесть']={
	ie:'сыпучесть',
	re:'сыпучести',
	de:'сыпучести',
	ve:'сыпучесть',
	te:'сыпучестью',
	pe:'сыпучести',
	im:'сыпучести',
	rm:'сыпучестей',
	dm:'сыпучестям',
	vm:'сыпучести',
	tm:'сыпучестями',
	pm:'сыпучестях',
	rod:1,
	skl:3,
	odu:0,
};
lx['сырок']={
	ie:'сырок',
	re:'сырка',
	de:'сырку',
	ve:'сырок',
	te:'сырком',
	pe:'сырке',
	im:'сырки',
	rm:'сырков',
	dm:'сыркам',
	vm:'сырки',
	tm:'сырками',
	pm:'сырках',
	rod:0,
	skl:2,
	odu:0,
};
lx['тварь']={
	ie:'тварь',
	re:'твари',
	de:'твари',
	ve:'тварь',
	te:'тварью',
	pe:'твари',
	im:'твари',
	rm:'тварей',
	dm:'тварям',
	vm:'тварей',
	tm:'тварями',
	pm:'тварях',
	rod:1,
	skl:3,
	odu:1,
	sbs:0,
	chr:1,
};
lx['текучесть']={
	ie:'текучесть',
	re:'текучести',
	de:'текучести',
	ve:'текучесть',
	te:'текучестью',
	pe:'текучести',
	im:'текучести',
	rm:'текучестей',
	dm:'текучестям',
	vm:'текучести',
	tm:'текучестями',
	pm:'текучестях',
	rod:1,
	skl:3,
	odu:0,
};
lx['тень']={
	ie:'тень',
	re:'тени',
	de:'тени',
	ve:'тень',
	te:'тенью',
	pe:'тени',
	im:'тени',
	rm:'теней',
	dm:'теням',
	vm:'тени',
	tm:'тенями',
	pm:'тенях',
	rod:1,
	skl:3,
	odu:0,
	sbs:0,
	chr:1,
};
lx['теплоход']={
	ie:'теплоход',
	re:'теплохода',
	de:'теплоходу',
	ve:'теплоход',
	te:'теплоходом',
	pe:'теплоходе',
	im:'теплоходы',
	rm:'теплоходов',
	dm:'теплоходам',
	vm:'теплоходы',
	tm:'теплоходами',
	pm:'теплоходах',
	rod:0,
	skl:2,
	odu:0,
};
lx['террариум']={
	ie:'террариум',
	re:'террариума',
	de:'террариуму',
	ve:'террариум',
	te:'террариумом',
	pe:'террариуме',
	im:'террариумы',
	rm:'террариумов',
	dm:'террариумам',
	vm:'террариумы',
	tm:'террариумами',
	pm:'террариумах',
	rod:0,
	skl:2,
	odu:0,
};
lx['тесть']={
	ie:'тесть',
	re:'тестя',
	de:'тестю',
	ve:'тестя',
	te:'тестем',
	pe:'тесте',
	im:'тести',
	rm:'тестей',
	dm:'тестям',
	vm:'тести',
	tm:'тестями',
	pm:'тестях',
	rod:0,
	skl:2,
	odu:0,
};
lx['тетрадь']={
	ie:'тетрадь',
	re:'тетради',
	de:'тетради',
	ve:'тетрадь',
	te:'тетрадью',
	pe:'тетради',
	im:'тетради',
	rm:'тетрадей',
	dm:'тетрадям',
	vm:'тетради',
	tm:'тетрадями',
	pm:'тетрадях',
	rod:1,
	skl:3,
	odu:0,
};
lx['толстокожесть']={
	ie:'толстокожесть',
	re:'толстокожести',
	de:'толстокожести',
	ve:'толстокожесть',
	te:'толстокожестью',
	pe:'толстокожести',
	im:'толстокожести',
	rm:'толстокожестей',
	dm:'толстокожестям',
	vm:'толстокожести',
	tm:'толстокожестями',
	pm:'толстокожестях',
	rod:1,
	skl:3,
	odu:0,
};
lx['тонна']={
	ie:'тонна',
	re:'тонны',
	de:'тонне',
	ve:'тонну',
	te:'тонной',
	pe:'тонне',
	im:'тонны',
	rm:'тонн',
	dm:'тоннам',
	vm:'тонны',
	tm:'тоннами',
	pm:'тоннах',
	rod:1,
	skl:1,
	odu:0,
};
lx['топливо']={
	ie:'топливо',
	re:'топлива',
	de:'топливу',
	ve:'топливо',
	te:'топливом',
	pe:'топливе',
	im:'топливо',
	rm:'топлива',
	dm:'топливу',
	vm:'топливо',
	tm:'топливом',
	pm:'топливе',
	rod:2,
	skl:2,
	odu:0,
};
lx['точка']={
	ie:'точка',
	re:'точки',
	de:'точке',
	ve:'точку',
	te:'точкой',
	pe:'точке',
	im:'точки',
	rm:'точек',
	dm:'точкам',
	vm:'точки',
	tm:'точками',
	pm:'точках',
	rod:1,
	skl:1,
	odu:0,
};
lx['трапеция']={
	ie:'трапеция',
	re:'трапеции',
	de:'трапеции',
	ve:'трапецию',
	te:'трапецией',
	pe:'трапеции',
	im:'трапеции',
	rm:'трапеций',
	dm:'трапециям',
	vm:'трапеции',
	tm:'трапециями',
	pm:'трапециях',
	rod:1,
	skl:1,
	odu:0,
};
lx['тягучесть']={
	ie:'тягучесть',
	re:'тягучести',
	de:'тягучести',
	ve:'тягучесть',
	te:'тягучестью',
	pe:'тягучести',
	im:'тягучести',
	rm:'тягучестей',
	dm:'тягучестям',
	vm:'тягучести',
	tm:'тягучестями',
	pm:'тягучестях',
	rod:1,
	skl:3,
	odu:0,
};
lx['тяжесть']={
	ie:'тяжесть',
	re:'тяжести',
	de:'тяжести',
	ve:'тяжесть',
	te:'тяжестью',
	pe:'тяжести',
	im:'тяжести',
	rm:'тяжестей',
	dm:'тяжестям',
	vm:'тяжести',
	tm:'тяжестями',
	pm:'тяжестях',
	rod:1,
	skl:3,
	odu:0,
};
lx['учебник']={
	ie:'учебник',
	re:'учебника',
	de:'учебнику',
	ve:'учебник',
	te:'учебником',
	pe:'учебнике',
	im:'учебники',
	rm:'учебников',
	dm:'учебникам',
	vm:'учебники',
	tm:'учебниками',
	pm:'учебниках',
	rod:0,
	skl:2,
	odu:0,
};
lx['февраль']={
	ie:'февраль',
	re:'февраля',
	de:'февралю',
	ve:'февраль',
	te:'февралём',
	pe:'феврале',
	im:'феврали',
	rm:'февралей',
	dm:'февралям',
	vm:'феврали',
	tm:'февралями',
	pm:'февралях',
	rod:0,
	skl:2,
	odu:0,
};
lx['Фёдоровна']={
	ie:'Фёдоровна',
	re:'Фёдоровны',
	de:'Фёдоровне',
	ve:'Фёдоровну',
	te:'Фёдоровной',
	pe:'Фёдоровне',
	im:'Фёдоровны',
	rm:'Фёдоровн',
	dm:'Фёдоровнам',
	vm:'Фёдоровн',
	tm:'Фёдоровнами',
	pm:'Фёдоровнах',
	rod:1,
	skl:1,
	odu:0,
};
lx['флэшка']={
	ie:'флэшка',
	re:'флэшки',
	de:'флэшке',
	ve:'флэшку',
	te:'флэшкой',
	pe:'флэшке',
	im:'флэшки',
	rm:'флэшек',
	dm:'флэшкам',
	vm:'флэшки',
	tm:'флэшками',
	pm:'флэшках',
	rod:1,
	skl:1,
	odu:0,
};
lx['фонарик']={
	ie:'фонарик',
	re:'фонарика',
	de:'фонарику',
	ve:'фонарик',
	te:'фонариком',
	pe:'фонарике',
	im:'фонарики',
	rm:'фонариков',
	dm:'фонарикам',
	vm:'фонарики',
	tm:'фонариками',
	pm:'фонариках',
	rod:0,
	skl:2,
	odu:0,
};
lx['форма']={
	ie:'форма',
	re:'формы',
	de:'форме',
	ve:'форму',
	te:'формой',
	pe:'форме',
	im:'формы',
	rm:'форм',
	dm:'формам',
	vm:'формы',
	tm:'формами',
	pm:'формах',
	rod:1,
	skl:1,
	odu:0,
	chr:1,
};
lx['фурлонг']={
	ie:'фурлонг',
	re:'фурлонга',
	de:'фурлонгу',
	ve:'фурлонг',
	te:'фурлонгом',
	pe:'фурлонге',
	im:'фурлонги',
	rm:'фурлонгов',
	dm:'фурлонгам',
	vm:'фурлонги',
	tm:'фурлонгами',
	pm:'фурлонгах',
	rod:0,
	skl:2,
	odu:0,
};
lx['Хабаровск']={
	ie:'Хабаровск',
	re:'Хабаровска',
	de:'Хабаровску',
	ve:'Хабаровск',
	te:'Хабаровском',
	pe:'Хабаровске',
	im:'Хабаровски',
	rm:'Хабаровсков',
	dm:'Хабаровскам',
	vm:'Хабаровски',
	tm:'Хабаровсками',
	pm:'Хабаровсках',
	rod:0,
	skl:2,
	odu:0,
	sbs:1,
	chr:1,
};
lx['хутор']={
	ie:'хутор',
	re:'хутора',
	de:'хутору',
	ve:'хутор',
	te:'хутором',
	pe:'хуторе',
	im:'хутора',
	rm:'хуторов',
	dm:'хуторам',
	vm:'хутора',
	tm:'хуторами',
	pm:'хуторах',
	rod:0,
	skl:2,
	odu:0,
};
lx['час']={
	ie:'час',
	re:'часа',
	de:'часу',
	ve:'час',
	te:'часом',
	pe:'часе',
	im:'часы',
	rm:'часов',
	dm:'часам',
	vm:'часы',
	tm:'часами',
	pm:'часах',
	rod:0,
	skl:2,
	odu:0,
};
lx['человек']={
	ie:'человек',
	re:'человека',
	de:'человеку',
	ve:'человека',
	te:'человеком',
	pe:'человеке',
	im:'люди',
	rm:'людей',
	dm:'людям',
	vm:'людей',
	tm:'людьми',
	pm:'людях',
	rod:0,
	skl:2,
	odu:1,
};
lx['честь']={
	ie:'честь',
	re:'чести',
	de:'чести',
	ve:'честь',
	te:'честью',
	pe:'чести',
	im:'чести',
	rm:'честей',
	dm:'честям',
	vm:'чести',
	tm:'честями',
	pm:'честях',
	rod:1,
	skl:3,
	odu:0,
};
lx['четверг']={
	ie:'четверг',
	re:'четверга',
	de:'четвергу',
	ve:'четверг',
	te:'четвергом',
	pe:'четверге',
	im:'четверги',
	rm:'четвергов',
	dm:'четвергам',
	vm:'четверги',
	tm:'четвергами',
	pm:'четвергах',
	rod:0,
	skl:2,
	odu:0,
};
lx['четырёхугольник']={
	ie:'четырёхугольник',
	re:'четырёхугольника',
	de:'четырёхугольнику',
	ve:'четырёхугольник',
	te:'четырёхугольником',
	pe:'четырёхугольнике',
	im:'четырёхугольники',
	rm:'четырёхугольников',
	dm:'четырёхугольникам',
	vm:'четырёхугольники',
	tm:'четырёхугольниками',
	pm:'четырёхугольниках',
	rod:0,
	skl:2,
	odu:0,
};
lx['Чехия']={
	ie:'Чехия',
	re:'Чехии',
	de:'Чехии',
	ve:'Чехию',
	te:'Чехией',
	pe:'Чехии',
	im:'Чехии',
	rm:'Чехий',
	dm:'Чехиям',
	vm:'Чехии',
	tm:'Чехиями',
	pm:'Чехиях',
	rod:1,
	skl:1,
	odu:0,
};
lx['число']={
	ie:'число',
	re:'числа',
	de:'числу',
	ve:'число',
	te:'числом',
	pe:'числе',
	im:'числа',
	rm:'чисел',
	dm:'числам',
	vm:'числа',
	tm:'числами',
	pm:'числах',
	rod:2,
	skl:2,
	odu:0,
	chr:1,
};
lx['шахматы']={
	ie:'шахматы',
	re:'шахмат',
	de:'шахматам',
	ve:'шахматы',
	te:'шахматами',
	pe:'шахматах',
	im:'шахматы',
	rm:'шахмат',
	dm:'шахматам',
	vm:'шахматы',
	tm:'шахматами',
	pm:'шахматах',
	rod:0,
	skl:2,
	odu:0,
};
lx['шашки']={
	ie:'шашки',
	re:'шашек',
	de:'шашкам',
	ve:'шашки',
	te:'шашками',
	pe:'шашках',
	im:'шашки',
	rm:'шашек',
	dm:'шашкам',
	vm:'шашки',
	tm:'шашками',
	pm:'шашках',
	rod:3,
	skl:1,
	odu:0,
};
lx['шерсть']={
	ie:'шерсть',
	re:'шерсти',
	de:'шерсти',
	ve:'шерсть',
	te:'шерстью',
	pe:'шерсти',
	im:'шерсти',
	rm:'шерстей',
	dm:'шерстям',
	vm:'шерсти',
	tm:'шерстями',
	pm:'шерстях',
	rod:1,
	skl:3,
	odu:0,
	sbs:0,
	chr:1,
};
lx['шипучесть']={
	ie:'шипучесть',
	re:'шипучести',
	de:'шипучести',
	ve:'шипучесть',
	te:'шипучестью',
	pe:'шипучести',
	im:'шипучести',
	rm:'шипучестей',
	dm:'шипучестям',
	vm:'шипучести',
	tm:'шипучестями',
	pm:'шипучестях',
	rod:1,
	skl:3,
	odu:0,
};
lx['школьница']={
	ie:'школьница',
	re:'школьницы',
	de:'школьнице',
	ve:'школьницу',
	te:'школьницей',
	pe:'школьнице',
	im:'школьницы',
	rm:'школьниц',
	dm:'школьницам',
	vm:'школьницы',
	tm:'школьницами',
	pm:'школьницах',
	rod:1,
	skl:1,
	odu:0,
};
lx['шлак']={
	ie:'шлак',
	re:'шлака',
	de:'шлаку',
	ve:'шлак',
	te:'шлаком',
	pe:'шлаке',
	im:'шлаки',
	rm:'шлаков',
	dm:'шлакам',
	vm:'шлаки',
	tm:'шлаками',
	pm:'шлаках',
	rod:0,
	skl:2,
	odu:0,
};
lx['шоколадка']={
	ie:'шоколадка',
	re:'шоколадки',
	de:'шоколадке',
	ve:'шоколадку',
	te:'шоколадкой',
	pe:'шоколадке',
	im:'шоколадки',
	rm:'шоколадок',
	dm:'шоколадкам',
	vm:'шоколадки',
	tm:'шоколадками',
	pm:'шоколадках',
	rod:1,
	skl:1,
	odu:0,
};
lx['щебень']={
	ie:'щебень',
	re:'щебня',
	de:'щебню',
	ve:'щебень',
	te:'щебнем',
	pe:'щебне',
	im:'щебни',
	rm:'щебней',
	dm:'щебням',
	vm:'щебни',
	tm:'щебнями',
	pm:'щебнях',
	rod:0,
	skl:2,
	odu:0,
};
lx['Эквадор']={
	ie:'Эквадор',
	re:'Эквадора',
	de:'Эквадору',
	ve:'Эквадор',
	te:'Эквадором',
	pe:'Эквадоре',
	im:'Эквадоры',
	rm:'Эквадоров',
	dm:'Эквадорам',
	vm:'Эквадоры',
	tm:'Эквадорами',
	pm:'Эквадорах',
	rod:0,
	skl:2,
	odu:0,
};
lx['электричка']={
	ie:'электричка',
	re:'электрички',
	de:'электричке',
	ve:'электричку',
	te:'электричкой',
	pe:'электричке',
	im:'электрички',
	rm:'электричк',
	dm:'электричкам',
	vm:'электрички',
	tm:'электричками',
	pm:'электричках',
	rod:1,
	skl:1,
	odu:0,
};
lx['Элеонора']={
	ie:'Элеонора',
	re:'Элеоноры',
	de:'Элеоноре',
	ve:'Элеонору',
	te:'Элеонорой',
	pe:'Элеоноре',
	im:'Элеоноры',
	rm:'Элеонор',
	dm:'Элеонорам',
	vm:'Элеонор',
	tm:'Элеонорами',
	pm:'Элеонорах',
	rod:1,
	skl:1,
	odu:0,
};
lx['этаж']={
	ie:'этаж',
	re:'этажа',
	de:'этажу',
	ve:'этаж',
	te:'этажом',
	pe:'этаже',
	im:'этажи',
	rm:'этажей',
	dm:'этажам',
	vm:'этажи',
	tm:'этажами',
	pm:'этажах',
	rod:0,
	skl:2,
	odu:0,
};
lx['Юлия']={
	ie:'Юлия',
	re:'Юлии',
	de:'Юлии',
	ve:'Юлию',
	te:'Юлией',
	pe:'Юлии',
	im:'Юлии',
	rm:'Юлий',
	dm:'Юлиям',
	vm:'Юлий',
	tm:'Юлиями',
	pm:'Юлиях',
	rod:1,
	skl:1,
	odu:0,
};
lx['яблоко']={
	ie:'яблоко',
	re:'яблока',
	de:'яблоку',
	ve:'яблоко',
	te:'яблоком',
	pe:'яблоке',
	im:'яблоки',
	rm:'яблок',
	dm:'яблокам',
	vm:'яблоки',
	tm:'яблоками',
	pm:'яблоках',
	rod:2,
	skl:2,
	odu:0,
};
lx['Яна']={
	ie:'Яна',
	re:'Яны',
	de:'Яне',
	ve:'Яну',
	te:'Яной',
	pe:'Яне',
	im:'Яны',
	rm:'Ян',
	dm:'Янам',
	vm:'Ян',
	tm:'Янами',
	pm:'Янах',
	rod:1,
	skl:1,
	odu:0,
};
lx['январь']={
	ie:'январь',
	re:'января',
	de:'январю',
	ve:'январь',
	te:'январём',
	pe:'январе',
	im:'январи',
	rm:'январей',
	dm:'январям',
	vm:'январи',
	tm:'январями',
	pm:'январях',
	rod:0,
	skl:2,
	odu:0,
};
lx['ять']={
	ie:'ять',
	re:'ятя',
	de:'ятю',
	ve:'ять',
	te:'ятьем',
	pe:'яте',
	im:'яти',
	rm:'ятей',
	dm:'ятям',
	vm:'яти',
	tm:'ятями',
	pm:'ятях',
	rod:0,
	skl:2,
	odu:0,
};

//}}Существительные

////////////////////////////////////////////////////////////////////////

lx['выраженный']={};
lx['выраженный'].i=['выраженный','выраженная','выраженное','выраженные'];
lx['выраженный'].r=['выраженного','выраженной','выраженного','выраженных'];
lx['выраженный'].d=['выраженному','выраженной','выраженному','выраженным'];
lx['выраженный'].v=['выраженный','выраженную','выраженное','выраженные'];
lx['выраженный'].t=['выраженным','выраженной','выраженным','выраженными'];
lx['выраженный'].p=['выраженном','выраженной','выраженном','выраженных'];


;;;
///////////////////////////////////////////////////////////////////////
//Здесь - только список наречий
//sl - само слово. Оно же неизменяемое
//sr - сравнительная степень
//pr - превосходная степень
//chr - часть речи.
//0 - наречие
//1 - существительное
//2 - числительное
//3 - прилагательное
//4 - местоимение
'use strict';

lx['абсолютно']={
	sl:'абсолютно',
	chr:0,
}
lx['временно']={
	sl:'временно',
	chr:0,
}

;;;
////////////////////////////////////////////////////////////////////////
//
//	ie: именительный	падеж единственного	числа
//	re: родительный		падеж единственного	числа
//	de: дательный		падеж единственного	числа
//	ve: винительный		падеж единственного	числа
//	te: творительный	падеж единственного	числа
//	pe: предложный		падеж единственного	числа
//	ie: именительный	падеж множественного	числа
//	re: родительный		падеж множественного	числа
//	de: дательный		падеж множественного	числа
//	ve: винительный		падеж множественного	числа
//	te: творительный	падеж множественного	числа
//	pe: предложный		падеж множественного	числа
//
//	rod: род:
//		0: мужской
//		1: женский
//		2: средний
//		3: только множественное число
//
//	odu: одушевлённость:
//		0: неодушевлённое
//		1: одушевлённое
//
//	skl: склонение:
//		0: несклоняемое
//		1: первое
//		2: второе
//		3: третье
//		4: разносклоняемые существительные
////////////////////////////////////////////////////////////////////////
'use strict';
if(lx==undefined)
	var lx=[];	//Объявляем глобальный объект lx
////////////////////////////////////////////////////////////////////////

//{{Словосочетания с главным словом - существительным
lx['американская миля']={
	ie:'американская миля',
	re:'американской мили',
	de:'американской миле',
	ve:'американскую милю',
	te:'американской милей',
	pe:'американской миле',
	im:'американские мили',
	rm:'американских миль',
	dm:'американским милям',
	vm:'американские мили',
	tm:'американскими милями',
	pm:'американских милях',
	rod:1,
	odu:0,
};
lx['бутылка газировки']={
	ie:'бутылка газировки',
	re:'бутылки газировки',
	de:'бутылке газировки',
	ve:'бутылку газировки',
	te:'бутылкой газировки',
	pe:'бутылке газировки',
	im:'бутылки газировки',
	rm:'бутылок газировки',
	dm:'бутылкам газировки',
	vm:'бутылки газировки',
	tm:'бутылками газировки',
	pm:'бутылках газировки',
	rod:0,
	odu:0,
};
lx['буханка хлеба']={
	ie:'буханка хлеба',
	re:'буханки хлеба',
	de:'буханке хлеба',
	ve:'буханку хлеба',
	te:'буханкой хлеба',
	pe:'буханке хлеба',
	im:'буханки хлеба',
	rm:'буханок хлеба',
	dm:'буханкам хлеба',
	vm:'буханки хлеба',
	tm:'буханками хлеба',
	pm:'буханках хлеба',
	rod:1,
	odu:0,
};
lx['вольная борьба']={
	ie:'вольная борьба',
	re:'вольной борьбы',
	de:'вольной борьбе',
	ve:'вольную борьбу',
	te:'вольной борьбой',
	pe:'вольной борьбе',
	im:'вольные борьбы',
	rm:'вольных борьб',
	dm:'вольным борьбам',
	vm:'вольные борьбы',
	tm:'вольными борьбами',
	pm:'вольных борьбах',
	rod:1,
	odu:0,
};
lx['доисторический омнибус']={
	ie:'доисторический омнибус',
	re:'доисторического омнибуса',
	de:'доисторическому омнибусу',
	ve:'доисторический омнибус',
	te:'доисторическим омнибусом',
	pe:'доисторическом омнибусе',
	im:'доисторические омнибусы',
	rm:'доисторических омнибусов',
	dm:'доисторическим омнибусам',
	vm:'доисторические омнибусы',
	tm:'доисторическими омнибусами',
	pm:'доисторических омнибусах',
	rod:0,
	odu:0,
};
lx['книжная полка']={
	ie:'книжная полка',
	re:'книжной полки',
	de:'книжной полке',
	ve:'книжную полку',
	te:'книжной полкой',
	pe:'книжной полке',
	im:'книжные полки',
	rm:'книжных полок',
	dm:'книжным полкам',
	vm:'книжные полки',
	tm:'книжными полками',
	pm:'книжных полках',
	rod:1,
	odu:0,
};
lx['комсомолка, спортсменка, отличница и, наконец, просто красавица']={
	ie:'комсомолка, спортсменка, отличница и, наконец, просто красавица',
	re:'комсомолки, спортсменки, отличницы и, наконец, просто красавицы',
	de:'комсомолке, спортсменке, отличнице и, наконец, просто красавице',
	ve:'комсомолку, спортсменку, отличницу и, наконец, просто красавицу',
	te:'комсомолкой, спортсменкой, отличницей и, наконец, просто красавицей',
	pe:'комсомолке, спортсменке, отличнице и, наконец, просто красавице',
	im:'комсомолки, спортсменки, отличницы и, наконец, просто красавицы',
	rm:'комсомолок, спортсменок, отличниц и, наконец, просто красавиц',
	dm:'комсомолкам, спортсменкам, отличницам и, наконец, просто красавицам',
	vm:'комсомолок, спортсменок, отличниц и, наконец, просто красавиц',
	tm:'комсомолками, спортсменками, отличницами и, наконец, просто красавицами',
	pm:'комсомолках, спортсменках, отличницах и, наконец, просто красавицах',
	rod:1,
	odu:0,
};
lx['круизный лайнер']={
	ie:'круизный лайнер',
	re:'круизного лайнера',
	de:'круизному лайнеру',
	ve:'круизный лайнер',
	te:'круизным лайнером',
	pe:'круизном лайнере',
	im:'круизные лайнеры',
	rm:'круизных лайнеров',
	dm:'круизным лайнерам',
	vm:'круизные лайнеры',
	tm:'круизными лайнерами',
	pm:'круизных лайнерах',
	rod:0,
	odu:0,
};
lx['лёгкая атлетика']={
	ie:'лёгкая атлетика',
	re:'лёкой атлетики',
	de:'лёгкой атлетике',
	ve:'лёгкую атлетику',
	te:'лёгкой атлетикой',
	pe:'лёгкой атлетике',
	im:'лёгкие атлетики',
	rm:'лёгких атлетик',
	dm:'лёгким атлетикам',
	vm:'лёгкие атлетики',
	tm:'лёгкими атлетиками',
	pm:'лёгких атлетиках',
	rod:1,
	odu:0,
};
lx['магнит на холодильник']={
	ie:'магнит на холодильник',
	re:'магнита на холодильник',
	de:'магниту на холодильник',
	ve:'магнит на холодильник',
	te:'магнитом на холодильник',
	pe:'магните на холодильник',
	im:'магниты на холодильник',
	rm:'магнитов на холодильник',
	dm:'магнитам на холодильник',
	vm:'магниты на холодильник',
	tm:'магнитами на холодильник',
	pm:'магнитах на холодильник',
	rod:0,
	odu:0,
};
lx['метиловый спирт']={
	ie:'метиловый спирт',
	re:'метилового спирта',
	de:'метиловому спирту',
	ve:'метиловый спирт',
	te:'метиловым спиртом',
	pe:'метиловом спирте',
	im:'метиловые спирты',
	rm:'метиловых спиртов',
	dm:'метиловым спиртам',
	vm:'метиловые спирты',
	tm:'метиловыми спиртами',
	pm:'метиловых спиртах',
	rod:0,
	odu:0,
};
lx['морская миля']={
	ie:'морская миля',
	re:'морской мили',
	de:'морской миле',
	ve:'морскую милю',
	te:'морской милей',
	pe:'морской миле',
	im:'морские мили',
	rm:'морских миль',
	dm:'морским милям',
	vm:'морские мили',
	tm:'морскими милями',
	pm:'морских милях',
	rod:1,
	odu:0,
};
lx['наименьшее значение']={
	ie:'наименьшее значение',
	re:'наименьшего значения',
	de:'наименьшему значению',
	ve:'наименьшее значение',
	te:'наименьшим значением',
	pe:'наименьшем значении',
	im:'наименьшие значения',
	rm:'наименьших значений',
	dm:'наименьшим значениям',
	vm:'наименьшие значения',
	tm:'наименьшими значениями',
	pm:'наименьших значениях',
	rod:2,
	odu:0,
};
lx['наибольшее значение']={
	ie:'наибольшее значение',
	re:'наибольшего значения',
	de:'наибольшему значению',
	ve:'наибольшее значение',
	te:'наибольшим значением',
	pe:'наибольшем значении',
	im:'наибольшие значения',
	rm:'наибольших значений',
	dm:'наибольшим значениям',
	vm:'наибольшие значения',
	tm:'наибольшими значениями',
	pm:'наибольших значениях',
	rod:2,
	odu:0,
};
lx['населённый пункт']={
	ie:'населённый пункт',
	re:'населённого пункта',
	de:'населённому пункту',
	ve:'населённый пункт',
	te:'населённым пунктом',
	pe:'населённом пункте',
	im:'населённые пункты',
	rm:'населённых пунктов',
	dm:'населённым пунктам',
	vm:'населённые пункты',
	tm:'населёнными пунктами',
	pm:'населённых пунктах',
	r2:'населённых пункта',
	rod:0,
	odu:0,
};
lx['настольный теннис']={
	ie:'настольный теннис',
	re:'настольного тенниса',
	de:'настольному теннису',
	ve:'настольный теннис',
	te:'настольным теннисом',
	pe:'настольном теннисе',
	im:'настольные теннисы',
	rm:'настольных теннисов',
	dm:'настольным теннисам',
	vm:'настольные теннисы',
	tm:'настольными теннисами',
	pm:'настольных теннисах',
	rod:0,
	odu:0,
};
lx['оконная рама']={
	ie:'оконная рама',
	re:'оконной рамы',
	de:'оконной раме',
	ve:'оконную раму',
	te:'оконной рамой',
	pe:'оконной раме',
	im:'оконные рамы',
	rm:'оконных рам',
	dm:'оконным рамам',
	vm:'оконные рамы',
	tm:'оконными рамами',
	pm:'оконных рамах',
	rod:1,
	odu:0,
};
lx['открытый луч']={
	ie:'открытый луч',
	re:'открытого луча',
	de:'открытому лучу',
	ve:'открытый луч',
	te:'открытым лучом',
	pe:'открытом луче',
	im:'открытые лучы',
	rm:'открытых лучей',
	dm:'открытым лучам',
	vm:'открытые лучи',
	tm:'открытыми лучами',
	pm:'открытых лучах',
	rod:0,
	odu:0,
};
lx['прогулочное судно']={
	ie:'прогулочное судно',
	re:'прогулочного судна',
	de:'прогулочному судну',
	ve:'прогулочное судно',
	te:'прогулочным судном',
	pe:'прогулочном судне',
	im:'прогулочные суда',
	rm:'прогулочных судов',
	dm:'прогулочным судам',
	vm:'прогулочные суда',
	tm:'прогулочными судами',
	pm:'прогулочных судах',
	rod:2,
	odu:0,
};
lx['русская миля']={
	ie:'русская миля',
	re:'русской мили',
	de:'русской миле',
	ve:'русскую милю',
	te:'русской милей',
	pe:'русской миле',
	im:'русские мили',
	rm:'русских миль',
	dm:'русским милям',
	vm:'русские мили',
	tm:'русскими милями',
	pm:'русских милях',
	rod:1,
	odu:0,
};
lx['сборник тестов для подготовки к ЕГЭ']={
	ie:'сборник тестов для подготовки к ЕГЭ',
	re:'сборника тестов для подготовки к ЕГЭ',
	de:'сборнику тестов для подготовки к ЕГЭ',
	ve:'сборник тестов для подготовки к ЕГЭ',
	te:'сборником тестов для подготовки к ЕГЭ',
	pe:'сборнике тестов для подготовки к ЕГЭ',
	im:'сборники тестов для подготовки к ЕГЭ',
	rm:'сборников тестов для подготовки к ЕГЭ',
	dm:'сборникам тестов для подготовки к ЕГЭ',
	vm:'сборники тестов для подготовки к ЕГЭ',
	tm:'сборниками тестов для подготовки к ЕГЭ',
	pm:'сборниках тестов для подготовки к ЕГЭ',
	rod:0,
	odu:0,
};
lx['скромный библиотекарь']={
	ie:'скромный библиотекарь',
	re:'скромного библиотекаря',
	de:'скромному библиотекарю',
	ve:'скромного библиотекаря',
	te:'скромным библиотекарем',
	pe:'скромном библиотекаре',
	im:'скромные библиотекари',
	rm:'скромных библиотекарей',
	dm:'скромным библиотекарям',
	vm:'скромных библиотекарей',
	tm:'скромными библиотекарями',
	pm:'скромных библиотекарях',
	rod:0,
	odu:0,
};
lx['суровая воронежская хакерша']={
	ie:'суровая воронежская хакерша',
	re:'суровой воронежской хакерши',
	de:'суровой воронежской хакерше',
	ve:'суровую воронежскую хакершу',
	te:'суровой воронежской хакершой',
	pe:'суровой воронежской хакерше',
	im:'суровые воронежские хакерши',
	rm:'суровых воронежских хакерш',
	dm:'суровым воронежским хакершам',
	vm:'суровых воронежских хакерш',
	tm:'суровыми воронежскими хакершами',
	pm:'суровых воронежских хакершах',
	rod:1,
	odu:0,
};
lx['точка минимума']={
	ie:'точка минимума',
	re:'точки минимума',
	de:'точке минимума',
	ve:'точку минимума',
	te:'точкой минимума',
	pe:'точке минимума',
	im:'точки минимума',
	rm:'точек минимума',
	dm:'точкам минимума',
	vm:'точки минимума',
	tm:'точками минимума',
	pm:'точках минимума',
	rod:1,
	odu:0,
};
lx['точка максимума']={
	ie:'точка максимума',
	re:'точки максимума',
	de:'точке максимума',
	ve:'точку максимума',
	te:'точкой максимума',
	pe:'точке максимума',
	im:'точки максимума',
	rm:'точек максимума',
	dm:'точкам максимума',
	vm:'точки максимума',
	tm:'точками максимума',
	pm:'точках максимума',
	rod:1,
	odu:0,
};
lx['тяжелая атлетика']={
	ie:'тяжелая атлетика',
	re:'тяжелой атлетики',
	de:'тяжелой атлетике',
	ve:'тяжелую атлетику',
	te:'тяжелой атлетикой',
	pe:'тяжелой атлетике',
	im:'тяжелые атлетики',
	rm:'тяжелых атлетик',
	dm:'тяжелым атлетикам',
	vm:'тяжелые атлетики',
	tm:'тяжелыми атлетиками',
	pm:'тяжелых атлетиках',
	rod:1,
	odu:0,
};
lx['упаковка сока']={
	ie:'упаковка сока',
	re:'упаковки сока',
	de:'упаковке сока',
	ve:'упаковку сока',
	te:'упаковкой сока',
	pe:'упаковке сока',
	im:'упаковки сока',
	rm:'упаковок сока',
	dm:'упаковкам сока',
	vm:'упаковки сока',
	tm:'упаковками сока',
	pm:'упаковках сока',
	rod:1,
	odu:0,
};
lx['флакон шампуня']={
	ie:'флакон шампуня',
	re:'флакона шампуня',
	de:'флакону шампуня',
	ve:'флакон шампуня',
	te:'флаконом шампуня',
	pe:'флаконе шампуня',
	im:'флаконы шампуня',
	rm:'флаконов шампуня',
	dm:'флаконам шампуня',
	vm:'флаконы шампуня',
	tm:'флаконами шампуня',
	pm:'флаконах шампуня',
	rod:0,
	odu:0,
};
lx['фунт стерлингов']={
	ie:'фунт стерлингов',
	re:'фунта стерлингов',
	de:'фунту стерлингов',
	ve:'фунт стерлингов',
	te:'фунтом стерлингов',
	pe:'фунте стерлингов',
	im:'фунты стерлингов',
	rm:'фунтов стерлингов',
	dm:'фунтам стерлингов',
	vm:'фунты стерлингов',
	tm:'фунтами стерлингов',
	pm:'фунтах стерлингов',
	rod:0,
	skl:2,
	odu:0,
};
lx['цветочный горшок']={
	ie:'цветочный горшок',
	re:'цветочного горшка',
	de:'цветочному горшку',
	ve:'цветочный горшок',
	te:'цветочным горшком',
	pe:'цветочном горшке',
	im:'цветочные горшки',
	rm:'цветочных горшков',
	dm:'цветочным горшкам',
	vm:'цветочные горшки',
	tm:'цветочными горшками',
	pm:'цветочных горшках',
	rod:0,
	skl:2,
	odu:0,
};
//}}Словосочетания с главным словом - существительным


;;;
'use strict';
////////////////////////////////////////////////////////////////////////
var lxskl=[];	//Объявляем глобальный объект lxskl - типичные окончания
////////////////////////////////////////////////////////////////////////
var lxpad={ie:1,re:1,de:1,ve:1,te:1,pe:1,im:1,rm:1,dm:1,vm:1,tm:1,pm:1,};

//Пустой шаблон

lxskl['']={
	ie:'',
	re:'',
	de:'',
	ve:'',
	te:'',
	pe:'',
	im:'',
	rm:'',
	dm:'',
	vm:'',
	tm:'',
	pm:'',
	rod:0,
	skl:2,
	odu:0,
};
//Первое склонение. Род считаем женским, если что, ставим вручную.
{
lxskl['я']={
	ie:'я',
	re:'и',
	de:'е',
	ve:'ю',
	te:'ей',
	pe:'е',
	im:'и',
	rm:'',
	dm:'ям',
	vm:'и',
	tm:'ями',
	pm:'ях',
	rod:1,
	skl:1,
	odu:0,
};
lxskl['а']={
	ie:'а',
	re:'ы',
	de:'е',
	ve:'у',
	te:'ой',
	pe:'е',
	im:'ы',
	rm:'',
	dm:'ам',
	vm:'ы',
	tm:'ами',
	pm:'ах',
	rod:1,
	skl:1,
	odu:0,
};
['ж','ш','ч','щ','к','х','г'].map(function(a){
	lxskl[a+'а']={
		ie:a+'а',
		re:a+'и',
		de:a+'е',
		ve:a+'у',
		te:a+'ой',
		pe:a+'е',
		im:a+'и',
		rm:a+'',
		dm:a+'ам',
		vm:a+'и',
		tm:a+'ами',
		pm:a+'ах',
		rod:1,
		skl:1,
		odu:0,
	};
});
['ж','ш','ч'].map(function(a){
	lxskl[a+'ка']={
		ie:a+'ка',
		re:a+'ки',
		de:a+'ке',
		ve:a+'ку',
		te:a+'кой',
		pe:a+'ке',
		im:a+'ки',
		rm:a+'ек',
		dm:a+'кам',
		vm:a+'ки',
		tm:a+'ками',
		pm:a+'ках',
		rod:1,
		skl:1,
		odu:0,
	};
});
['б','в','д','з','л','м','н','п','р','с','т'].map(function(a){
	lxskl[a+'ка']={
		ie:a+'ка',
		re:a+'ки',
		de:a+'ке',
		ve:a+'ку',
		te:a+'кой',
		pe:a+'ке',
		im:a+'ки',
		rm:a+'ок',
		dm:a+'кам',
		vm:a+'ки',
		tm:a+'ками',
		pm:a+'ках',
		rod:1,
		skl:1,
		odu:0,
	};
});
lxskl['ия']={
	ie:'ия',
	re:'ии',
	de:'ии',
	ve:'ию',
	te:'ией',
	pe:'ии',
	im:'ии',
	rm:'ий',
	dm:'иям',
	vm:'ии',
	tm:'иями',
	pm:'иях',
	rod:1,
	skl:1,
	odu:0,
};
}
//Второе склонение, средний род
lxskl['ие']={
	ie:'ие',
	re:'ия',
	de:'ию',
	ve:'ие',
	te:'ием',
	pe:'ии',
	im:'ия',
	rm:'ий',
	dm:'иям',
	vm:'ия',
	tm:'иями',
	pm:'иях',
	rod:2,
	skl:2,
	odu:0,
};
['ё','е'].map(function(a){
	lxskl[a]={
		ie:a,
		re:'я',
		de:'ю',
		ve:a,
		te:'ем',
		pe:'е',
		im:'я',
		rm:'ей',
		dm:'ям',
		vm:'я',
		tm:'ями',
		pm:'ях',
		rod:2,
		skl:2,
		odu:0,
	};
});

lxskl['о']={
	ie:'о',
	re:'а',
	de:'у',
	ve:'о',
	te:'ом',
	pe:'е',
	im:'а',
	rm:'',
	dm:'ам',
	vm:'а',
	tm:'ами',
	pm:'ах',
	rod:2,
	skl:2,
	odu:0,
};
//Второе склонение, мужской род
lxskl['ий']={
	ie:'ий',
	re:'ия',
	de:'ию',
	ve:'ий',
	te:'ием',
	pe:'ии',
	im:'ии',
	rm:'иев',
	dm:'иям',
	vm:'ии',
	tm:'иями',
	pm:'иях',
	rod:0,
	skl:2,
	odu:0,
};
lxskl['ь']={
	ie:'ь',
	re:'я',
	de:'ю',
	ve:'ь',
	te:'ем',
	pe:'е',
	im:'и',
	rm:'ей',
	dm:'ям',
	vm:'и',
	tm:'ями',
	pm:'ях',
	rod:0,
	skl:2,
	odu:0,
};
lxskl['й']={
	ie:'й',
	re:'я',
	de:'ю',
	ve:'й',
	te:'ем',
	pe:'е',
	im:'и',
	rm:'ев',
	dm:'ям',
	vm:'и',
	tm:'ями',
	pm:'ях',
	rod:0,
	skl:2,
	odu:0,
};
['б','в','д','з','л','м','н','п','р','с','т','ф','ц'].map(function(a){
	lxskl[a]={
		ie:a,
		re:a+'а',
		de:a+'у',
		ve:a,
		te:a+'ом',
		pe:a+'е',
		im:a+'ы',
		rm:a+'ов',
		dm:a+'ам',
		vm:a+'ы',
		tm:a+'ами',
		pm:a+'ах',
		rod:0,
		skl:2,
		odu:0,
	};
});
['ж','ш','ч','щ','к','х','г'].map(function(a){
	lxskl[a]={
		ie:a,
		re:a+'а',
		de:a+'у',
		ve:a,
		te:a+'ом',
		pe:a+'е',
		im:a+'и',
		rm:a+'ей',
		dm:a+'ам',
		vm:a+'и',
		tm:a+'ами',
		pm:a+'ах',
		rod:0,
		skl:2,
		odu:0,
	};
});
lxskl['к'].rm='ков';
lxskl['г'].rm='гов';
lxskl['х'].rm='хов';

['ё','е','о'].map(function(a){
	lxskl[a+'к']={
		ie:a+'к',
		re:'ка',
		de:'ку',
		ve:a+'к',
		te:'ком',
		pe:'ке',
		im:'ки',
		rm:'ков',
		dm:'кам',
		vm:'ки',
		tm:'ками',
		pm:'ках',
		rod:0,
		skl:2,
		odu:0,
	};
});
//Костыли
lxskl['0']={
	ie:'',
	re:'',
	de:'',
	ve:'',
	te:'',
	pe:'',
	im:'',
	rm:'',
	dm:'',
	vm:'',
	tm:'',
	pm:'',
	rod:0,
	skl:0,
	odu:0,
};
lxskl['мя']={
	ie:'мя',
	re:'мени',
	de:'мени',
	ve:'мя',
	te:'менем',
	pe:'мени',
	im:'мена',
	rm:'мён',
	dm:'менам',
	vm:'мена',
	tm:'менами',
	pm:'менах',
	rod:0,
	skl:4,
	odu:0,
};
//И отдельный набор костылей для третьего склонения
lxskl['ь3']={
	ie:'ь',
	re:'и',
	de:'и',
	ve:'ь',
	te:'ью',
	pe:'и',
	im:'и',
	rm:'ей',
	dm:'ям',
	vm:'и',
	tm:'ями',
	pm:'ях',
	rod:1,
	skl:3,
	odu:0,
};
['ж','ш','ч','щ'].map(function(a){
	lxskl[a+'ь']={
		ie:a+'ь',
		re:a+'и',
		de:a+'и',
		ve:a+'ь',
		te:a+'ью',
		pe:a+'и',
		im:a+'и',
		rm:a+'ей',
		dm:a+'ам',
		vm:a+'и',
		tm:a+'ами',
		pm:a+'ах',
		rod:1,
		skl:3,
		odu:0,
	};
});
//Несклоняемые
['у','ю','э'].map(function(a){
	lxskl[a]={
		ie:a,
		re:a,
		de:a,
		ve:a,
		te:a,
		pe:a,
		im:a,
		rm:a,
		dm:a,
		vm:a,
		tm:a,
		pm:a,
		rod:1,
		skl:1,
		odu:0,
	};
});

//Субстантивированные - по мере необходмости
lxskl['ый']={
	ie:'ый',
	re:'ого',
	de:'ому',
	ve:'ого',
	te:'ым',
	pe:'ом',
	im:'ые',
	rm:'ых',
	dm:'ым',
	vm:'ых',
	tm:'ыми',
	pm:'ых',
	rod:0,
	skl:5,
	odu:1,
};
lxskl['ыйся']={
	ie:'ыйся',
	re:'огося',
	de:'омуся',
	ve:'огося',
	te:'ымся',
	pe:'омся',
	im:'ыеся',
	rm:'ыхся',
	dm:'ымся',
	vm:'ыхся',
	tm:'ымися',
	pm:'ыхся',
	rod:0,
	skl:5,
	odu:1,
};
lxskl['ийся']={
	ie:'ийся',
	re:'егося',
	de:'емуся',
	ve:'егося',
	te:'имся',
	pe:'емся',
	im:'иеся',
	rm:'ихся',
	dm:'имся',
	vm:'ихся',
	tm:'имися',
	pm:'ихся',
	rod:0,
	skl:5,
	odu:1,
};
lx['йка']={
	ie:'йка',
	re:'йки',
	de:'йке',
	ve:'йку',
	te:'йкой',
	pe:'йке',
	im:'йки',
	rm:'ек',
	dm:'йкам',
	vm:'йки',
	tm:'йками',
	pm:'йках',
	rod:1,
	skl:2,
	odu:0,
	sbs:0,
	chr:1,
};
lxskl['янин']={
	ie:'янин',
	re:'янина',
	de:'янину',
	ve:'янина',
	te:'янином',
	pe:'янине',
	im:'яне',
	rm:'ян',
	dm:'янам',
	vm:'ян',
	tm:'янами',
	pm:'янах',
	rod:0,
	skl:2,
	odu:1,
};
lxskl['анин']={
	ie:'анин',
	re:'анина',
	de:'анину',
	ve:'анина',
	te:'анином',
	pe:'анине',
	im:'ане',
	rm:'ан',
	dm:'анам',
	vm:'ан',
	tm:'анами',
	pm:'анах',
	rod:0,
	skl:2,
	odu:1,
};
lxskl['шня']={
	ie:'шня',
	re:'шню',
	de:'шне',
	ve:'шню',
	te:'шней',
	pe:'шне',
	im:'шни',
	rm:'шен',
	dm:'шням',
	vm:'шни',
	tm:'шнями',
	pm:'шнях',
	rod:1,
	skl:1,
	odu:0,
};
lxskl['ость']={
	ie:'ость',
	re:'ости',
	de:'ости',
	ve:'ость',
	te:'остью',
	pe:'ости',
	im:'ости',
	rm:'остей',
	dm:'остям',
	vm:'ости',
	tm:'остями',
	pm:'остях',
	rod:1,
	skl:3,
	odu:0,
	sbs:0,
	chr:1,
};

;;;
'use strict';
lx['один']={
	chr:2,
	i:'один',
	r:'одного',
	d:'одному',
	v:'один',
	t:'одним',
	p:'одном',
};
lx['одна']={
	chr:2,
	i:'одна',
	r:'одной',
	d:'одной',
	v:'одну',
	t:'одной',
	p:'одной',
};
lx['одно']={
	chr:2,
	i:'одно',
	r:'одного',
	d:'одному',
	v:'одно',
	t:'одним',
	p:'одном',
};
lx['одни']={
	chr:2,
	i:'одни',
	r:'одних',
	d:'одним',
	v:'одни',
	t:'одними',
	p:'одних',
};
lx['две']={
	chr:2,
	i:'две',
	r:'двух',
	d:'двум',
	v:'две',
	t:'двумя',
	p:'двух',
};
lx['два']={
	chr:2,
	i:'два',
	r:'двух',
	d:'двум',
	v:'два',
	t:'двумя',
	p:'двух',
};
lx['три']={
	chr:2,
	i:'три',
	r:'трёх',
	d:'трём',
	v:'три',
	t:'тремя',
	p:'трех',
};
lx['четыре']={
	chr:2,
	i:'четыре',
	r:'четырёх',
	d:'четырём',
	v:'четыре',
	t:'четырьмя',
	p:'четырёх',
};
lx['пять']={
	chr:2,
	i:'пять',
	r:'пяти',
	d:'пяти',
	v:'пять',
	t:'пятью',
	p:'пяти',
};
lx['шесть']={
	chr:2,
	i:'шесть',
	r:'шести',
	d:'шести',
	v:'шесть',
	t:'шестью',
	p:'шести',
};
lx['семь']={
	chr:2,
	i:'семь',
	r:'семи',
	d:'семи',
	v:'семь',
	t:'семью',
	p:'семи',
};
lx['восемь']={
	chr:2,
	i:'восемь',
	r:'восьми',
	d:'восьми',
	v:'восемь',
	t:'восемью',
	p:'восьми',
};
lx['девять']={
	chr:2,
	i:'девять',
	r:'девяти',
	d:'девяти',
	v:'девять',
	t:'девятью',
	p:'девяти',
};
lx['десять']={
	chr:2,
	i:'десять',
	r:'десяти',
	d:'десяти',
	v:'десять',
	t:'десятью',
	p:'десяти',
};
lx['одиннадцать']={
	chr:2,
	i:'одиннадцать',
	r:'одиннадцати',
	d:'одиннадцати',
	v:'одиннадцать',
	t:'одиннадцатью',
	p:'одиннадцати',
};
lx['двенадцать']={
	chr:2,
	i:'двенадцать',
	r:'двенадцати',
	d:'двенадцати',
	v:'двенадцать',
	t:'двенадцатью',
	p:'двенадцати',
};
lx['тринадцать']={
	chr:2,
	i:'тринадцать',
	r:'тринадцати',
	d:'тринадцати',
	v:'тринадцать',
	t:'тринадцатью',
	p:'тринадцати',
};
lx['четырнадцать']={
	chr:2,
	i:'четырнадцать',
	r:'четырнадцати',
	d:'четырнадцати',
	v:'четырнадцать',
	t:'четырнадцатью',
	p:'четырнадцати',
};
lx['пятнадцать']={
	chr:2,
	i:'пятнадцать',
	r:'пятнадцати',
	d:'пятнадцати',
	v:'пятнадцать',
	t:'пятнадцатью',
	p:'пятнадцати',
};
lx['шестнадцать']={
	chr:2,
	i:'шестнадцать',
	r:'шестнадцати',
	d:'шестнадцати',
	v:'шестнадцать',
	t:'шестнадцатью',
	p:'шестнадцати',
};
lx['семнадцать']={
	chr:2,
	i:'семнадцать',
	r:'семнадцати',
	d:'семнадцати',
	v:'семнадцать',
	t:'семнадцатью',
	p:'семнадцати',
};
lx['восемнадцать']={
	chr:2,
	i:'восемнадцать',
	r:'восемнадцати',
	d:'восемнадцати',
	v:'восемнадцать',
	t:'восемнадцатью',
	p:'восемнадцати',
};
lx['девятнадцать']={
	chr:2,
	i:'девятнадцать',
	r:'девятнадцати',
	d:'девятнадцати',
	v:'девятнадцать',
	t:'девятнадцатью',
	p:'девятнадцати',
};
lx['двадцать']={
	chr:2,
	i:'двадцать',
	r:'двадцати',
	d:'двадцати',
	v:'двадцать',
	t:'двадцатью',
	p:'двадцати',
};
lx['тридцать']={
	chr:2,
	i:'тридцать',
	r:'тридцати',
	d:'тридцати',
	v:'тридцать',
	t:'тридцатью',
	p:'тридцати',
};
lx['сорок']={
	chr:2,
	i:'сорок',
	r:'сорока',
	d:'сорока',
	v:'сорок',
	t:'сорока',
	p:'сорока',
};
lx['пятьдесят']={
	chr:2,
	i:'пятьдесят',
	r:'пятидесяти',
	d:'пятидесяти',
	v:'пятьдесят',
	t:'пятьюдесятью',
	p:'пятидесяти',
};
lx['шестьдесят']={
	chr:2,
	i:'шестьдесят',
	r:'шестидесяти',
	d:'шестидесяти',
	v:'шестьдесят',
	t:'шестьюдесятью',
	p:'шестидесяти',
};
lx['семьдесят']={
	chr:2,
	i:'семьдесят',
	r:'семидесяти',
	d:'семидесяти',
	v:'семьдесят',
	t:'семьюдесятью',
	p:'семидесяти',
};
lx['восемьдесят']={
	chr:2,
	i:'восемьдесят',
	r:'восьмидесяти',
	d:'восьмидесяти',
	v:'восемьдесят',
	t:'восемьюдесятью',
	p:'восьмидесяти',
};
lx['девяносто']={
	chr:2,
	i:'девяносто',
	r:'девяноста',
	d:'девяноста',
	v:'девяносто',
	t:'девяноста',
	p:'девяноста',
};
lx['сто']={
	chr:2,
	i:'сто',
	r:'ста',
	d:'ста',
	v:'сто',
	t:'ста',
	p:'ста',
};
lx['двести']={
	chr:2,
	i:'двести',
	r:'двухсот',
	d:'двумстам',
	v:'двести',
	t:'двумястами',
	p:'двухстах',
};
lx['триста']={
	chr:2,
	i:'триста',
	r:'трёхсот',
	d:'трёмстам',
	v:'триста',
	t:'тремястами',
	p:'трёхстах',
};
lx['четыреста']={
	chr:2,
	i:'четыреста',
	r:'четырёхсот',
	d:'четырёмстам',
	v:'четыреста',
	t:'четырьмястами',
	p:'четырёхстах',
};
lx['пятьсот']={
	chr:2,
	i:'пятьсот',
	r:'пятисот',
	d:'пятистам',
	v:'пятьсот',
	t:'пятьюстами',
	p:'пятистах',
};
lx['шестьсот']={
	chr:2,
	i:'шестьсот',
	r:'шестисот',
	d:'шестистам',
	v:'шестьсот',
	t:'шестьюстами',
	p:'шестистах',
};
lx['семьсот']={
	chr:2,
	i:'семьсот',
	r:'семисот',
	d:'семистам',
	v:'семисот',
	t:'семьюстами',
	p:'семистах',
};
lx['восемьсот']={
	chr:2,
	i:'восемьсот',
	r:'восьмисот',
	d:'восьмистам',
	v:'восемьсот',
	t:'восемьюстами',
	p:'восьмистах',
};
lx['девятьсот']={
	chr:2,
	i:'девятьсот',
	r:'девятисот',
	d:'девятистам',
	v:'девятьсот',
	t:'девятьюстами',
	p:'девятистах',
};
lx['тысяча']={
	chr:2,
	i:'тысяча',
	r:'тысячи',
	d:'тысяче',
	v:'тысячу',
	t:'тысячей',
	p:'тысяче',
};
lx['тысячи']={
	chr:2,
	i:'тысячи',
	r:'тысяч',
	d:'тысячам',
	v:'тысячи',
	t:'тысячами',
	p:'тысячах',
};
lx['миллион']={
	chr:2,
	i:'миллион',
	r:'миллиона',
	d:'миллиону',
	v:'миллион',
	t:'миллионом',
	p:'миллионе',
};
lx['миллионы']={
	chr:2,
	i:'миллионы',
	r:'миллионов',
	d:'миллионам',
	v:'миллионы',
	t:'миллионами',
	p:'миллионах',
};
lx['миллиард']={
	chr:2,
	i:'миллиард',
	r:'миллиарда',
	d:'миллиарду',
	v:'миллиард',
	t:'миллиардом',
	p:'миллиарде',
};
lx['миллиарды']={
	chr:2,
	i:'миллиарды',
	r:'миллиардов',
	d:'миллиардам',
	v:'миллиарды',
	t:'миллиардами',
	p:'миллиардах',
};
lx['двое']={
	chr:2,
	i:'двое',
	r:'двоих',
	d:'двоим',
	v:'двое',
	t:'двоими',
	p:'двоих',
};
lx['трое']={
	chr:2,
	i:'трое',
	r:'троих',
	d:'троим',
	v:'трое',
	t:'троими',
	p:'троих',
};
lx['четверо']={
	chr:2,
	i:'четверо',
	r:'четверых',
	d:'четверым',
	v:'четверо',
	t:'четверыми',
	p:'четверых',
};
lx['пятеро']={
	chr:2,
	i:'пятеро',
	r:'пятерых',
	d:'пятерым',
	v:'пятеро',
	t:'пятерыми',
	p:'пятерых',
}; 
lx['шестеро']={
	chr:2,
	i:'шестеро',
	r:'шестерых',
	d:'шестерым',
	v:'шестеро',
	t:'шестерыми',
	p:'шестерых',
};
lx['семеро']={
	chr:2,
	i:'семеро',
	r:'семерых',
	d:'семерым',
	v:'семеро',
	t:'семерыми',
	p:'семерых',
};
lx['восьмеро']={
	chr:2,
	i:'восьмеро',
	r:'восьмерых',
	d:'восьмерым',
	v:'восьмеро',
	t:'восьмерыми',
	p:'восьмерых',
};
lx['девятеро']={
	chr:2,
	i:'девятеро',
	r:'девятерых',
	d:'девятерым',
	v:'девятеро',
	t:'девятерыми',
	p:'девятерых',
};
lx['десятеро']={
	chr:2,
	i:'десятеро',
	r:'десятерых',
	d:'десятерым',
	v:'десятеро',
	t:'десятерыми',
	p:'десятерых',
};
//http://pastebin.com/Dpv8pQWW - Любовь Ерышова
//http://pastebin.com/jJ8CWxd0 - Екатерина Трегубова
//+Николай Авдеев

;;;
'use strict';

function Word(o){
	if(!o)
		o={};
	if(o.isString)
		return new Word(sklonlxkand(o));
	for(var prop in o)
		this[prop]=o[prop];
};

Word.prototype.toString = function(){
	return '[Ошибка: падеж или иная форма слова "'+(this.ie||JSON.strungify(this))+'" не указаны]';
}

function autosklon(slovo,p1){
	if(slovo.isArray){
		for(var lensl=slovo.length-1;lensl>=0;lensl--)
			autosklon(slovo[lensl],p1);
		return;
	}
	if(lx[slovo])
		return console.log('Такое слово уже есть в словаре.');
	var rez=setlx(slovo);
	if(p1!=undefined)
		slovo+=p1;
	var sl=slovo;
	for(;sl.length && !lx[sl] && !lxskl[sl]; sl=sl.udalPerv()){};
	var lxparent=lx[sl]?lx[sl]:lxskl[sl];
	var osnova=slovo.udalPosl(sl.length);
	for(var padezh in lxpad)
		rez+=logparam(padezh,osnova+lxparent[padezh]);
	rez+=logparam('rod',lxparent.rod);
	rez+=logparam('skl',lxparent.skl);
	rez+=logparam('odu',lxparent.odu);
	rez+='};\n'
	console.log(rez);//Это НЕ ОТЛАДКА!!!
}

var lxkand=[];

function sklonlxkand(slovo,p1,al){
	if(slovo.isArray){
		return slovo.map(function(str){return sklonlxkand(str);});
	}
	if(slovo.ie)
		return sklonlxkand(slovo.ie,p1,al);
	if(lx[slovo]){
		if(al)
			alert('Такое слово уже есть в словаре.');
		return new Word(lx[slovo]);
	}
	lxkand[slovo]=new Word();
	if(p1!=undefined)
		slovo+=p1;
	var sl=slovo;
	for(;sl.length && !lx[sl] && !lxskl[sl]; sl=sl.udalPerv()){};
	var lxparent=lx[sl]?lx[sl]:lxskl[sl];
	var osnova=slovo.udalPosl(sl.length);
	lxkand[slovo]=lxparent.clone();
	for(var padezh in lxpad)
		lxkand[slovo][padezh]=osnova+lxparent[padezh];
	lxkand[slovo].chr=1;
	return lxkand[slovo];
}

var lxdop={
	rod:1,
	skl:1,
	odu:1,
	sbs:1,
	sl:1,
	sr:1,
	pr:1,
	chr:1,
};

function strlxkand(slovo,p1,al){
	var rez=setlx(slovo);
	var sl;
	if(!lxkand[slovo])
		sl=sklonlxkand(slovo,p1,al).clone();
	else
		sl=lxkand[slovo].clone();
	for(var pad in lxpad){
		rez+=logparam(pad,sl[pad]);
		sl[pad]=undefined;
	}
	for(var pad in lxdop){
		rez+=logparam(pad,sl[pad]);
		sl[pad]=undefined;
	}
	for(var pad in sl)
		rez+=logparam(pad,sl[pad]);
	rez+='};\n';
	return rez;
}

function loglxkand(slovo,p1){
	console.log(strlxkand(slovo,p1,1));
}

function setlx(p1){
	return('\nlx[\''+p1+'\']={\n');
}

function logparam(p1,p2){
	return p2!=undefined? 
		p2.isString?
			('\t'+p1+':\''+p2+'\',\n'):
			('\t'+p1+':'+p2+',\n')
		:'';
}

function logsklon(a){
	if(slovo.isArray){
		for(var lensl=slovo.length-1;lensl>=0;lensl--)
			logsklon(slovo[lensl],p1);
		return;
	}
	console.log(sklon(a))
}

function sklon(a){
	setlx(a);
	var osn;//"Основа" слова. Выбирается так, чтобы было удобно.
	var rez='';//То, что отправим в результат. Например, в консоль.
	rez+=setlx(a);
	if(a.posl()=='а'){
		osn=a.udalPosl();
		rez+=logparam('ie',a);
		rez+=logparam('re',osn+'ы');
		rez+=logparam('de',osn+'е');
		rez+=logparam('ve',osn+'у');
		rez+=logparam('te',osn+'ой');
		rez+=logparam('pe',osn+'е');
		rez+=logparam('im',osn+'ы');
		rez+=logparam('rm',osn);
		rez+=logparam('dm',osn+'ам');
		rez+=logparam('vm',osn+'ы');
		rez+=logparam('tm',osn+'ами');
		rez+=logparam('pm',osn+'ах');
		rez+=logparam('rod',1);
		rez+=logparam('skl',1);
		rez+=logparam('odu',0);
	}else
	if(a.posl()=='ь'){
		osn=a.udalPosl();
		rez+=logparam('ie',a);
		rez+=logparam('re',osn+'я');
		rez+=logparam('de',osn+'ю');
		rez+=logparam('ve',a);
		rez+=logparam('te',osn+'ем');
		rez+=logparam('pe',osn+'е');
		rez+=logparam('im',osn+'и');
		rez+=logparam('rm',osn+'ей');
		rez+=logparam('dm',osn+'ям');
		rez+=logparam('vm',osn+'и');
		rez+=logparam('tm',osn+'ями');
		rez+=logparam('pm',osn+'ях');
		rez+=logparam('rod',0);
		rez+=logparam('skl',2);
		rez+=logparam('odu',0);
	}else
	{
		osn=a;
		rez+=logparam('ie',a);
		rez+=logparam('re',osn+'а');
		rez+=logparam('de',osn+'у');
		rez+=logparam('ve',a);
		rez+=logparam('te',osn+'ом');
		rez+=logparam('pe',osn+'е');
		rez+=logparam('im',osn+'ы');
		rez+=logparam('rm',osn+'ов');
		rez+=logparam('dm',osn+'ам');
		rez+=logparam('vm',osn+'ы');
		rez+=logparam('tm',osn+'ами');
		rez+=logparam('pm',osn+'ах');
		rez+=logparam('rod',0);
		rez+=logparam('skl',2);
		rez+=logparam('odu',0);
	}
	rez+='};\n'
	return rez;
}

var lxcompositions={
	'в': {
		'вторник':'во вторник',
	},
}
//TODO: добавить больше ситуаций
function lxcompose(a,b){
	if(lxcompositions[a] && lxcompositions[a][b]){
		return lxcompositions[a][b];
	}
	return a+' '+b;
}

;;;
'use strict';

function Complex(re,im){
	this.re=+re?+re:0;
	this.im=+im?+im:0;
	this.isComplex=1;
	this.toString=function(){
	/**Представляет число в виде a+bi*/
		var rez;
		if(!this.re && !this.im)
			rez='0';
		else if( this.re && !this.im)
			rez=''+this.re;
		else if(!this.re &&  this.im)
			rez=''+this.im+'i';
		else if( this.re &&  this.im)
			rez= ''+this.re+'+'+this.im+'i';
		return rez.plusminus();
	}
	this.ts=function(){
		return this.toString().ts();
	}

	this.minus=function(){
	/**Противоположное число: -a-bi*/
		return new Complex( -(this.re), - (this.im));
	}

	this.sopr=function(){
	/**Сопряжёное число: a-bi*/
		return new Complex(this.re, - (this.im));
	}

	this.abs=
	this.norma=function(){
	/**Норма (модуль, абсолютное значение) комплексного числа*/
		return (this.re.sqr()+this.im.sqr()).sqrt();
	}

	this.obrat=function(){
	/**Обратное число: a-bi*/
		var n=this.norma().sqr();
		return new Complex(this.re/n, - (this.im)/n);
	}
	
	this.sum=function(){
	/**Прибавить к комплексному числу комплексные или действительные*/
		var rez=this.clone();
//		arguments[0].isComplex?arguments[0].clone():new Complex(arguments[0]);
		for(var i=arguments.length-1;i>=0;i--){
			var operand=arguments[i];
			if(operand.isNumber){
				rez.re+=operand;
			}else{
				if(operand.re){
					rez.re+=operand.re;
				}
				if(operand.im){
					rez.im+=operand.im;
				}
			}
		}
		return rez;
	}

	this.umn=function(){
	/**Умножить комплексное число на комплексные или действительные*/
		var rez=this.clone();
		for(var i=arguments.length-1;i>=0;i--){
			var operand=arguments[i];
			if(operand.isNumber){
				if(operand===0){
					return new Complex();
				}
				rez.re*=operand;
				rez.im*=operand;
			}else{
				if(!operand.re && !operand.im){
					//Нуль
					return new Complex();
				}else{
					var r=rez.re,
						m=rez.im;
					rez.re=r*operand.re-m*operand.im;
					rez.im=r*operand.im+m*operand.re;
				} 
			}
		}
		return rez;
	}
}

;;;
'use strict';

/** @namespace chaslib
 * Утилиты
 */
var chaslib = {
	/** @namespace chaslib._
	 * Функционал, используемый только внутри модуля chaslib
	 * @private
	 */
	_ : {
		/** @function chaslib._.loadLibModule
		 * Загрузить модуль chaslib
		 * @param {String} name название модуля
		 * @private
		 */
		loadLibModule : function(name) {
			document.write('<script charset="utf-8" src="../lib/chaslib/' + name + '.js" onload="console.log(\'[chaslib] Загружен модуль ' + name + '\');"></script>');
		}
	},


	/** @function chaslib.typeOf
	 * @param object объект
	 * @return тип объекта ввиде [object ТИП]
	 */
	typeOf : function(object) {
		return Object.prototype.toString.call(object);
	},


	/** @function chaslib.toStringsArray
	 * @param arr объект, которые необходимо превратить
	 * @return arr в виде массива строк
	 */
	toStringsArray : function(arr) {
		switch (chaslib.typeOf(arr)) {
		case '[object Array]':
			var newArr = [];
			for (var i = 0; i < arr.length; i++) {
				switch (chaslib.typeOf(arr[i])) {
				case '[object Number]':
					newArr.push(arr[i].ts().toString());
					break;
				case '[object String]':
					newArr.push(arr[i]);
					break;
				default:
					throw TypeError('Параметр arr должен содержать только строки и числа');
				}
			}
			return newArr;
		case '[object Number]':
			return [arr.ts()];
		case '[object String]':
			return [arr];
		default:
			throw TypeError('Невозможно преобразовать в строковый массив параметр: ' + JSON.stringify(arr));
		}
	},


	/** @function chaslib.toArray
	 * @param arr объект, которые необходимо превратить
	 * @param len длина массива из одинаковых значений
	 * @return arr, если arr - массив, и массив длиной len из элементов arr в противном случае
	 */
	toArray : function(arr, len) {
		if (chaslib.typeOf(arr) == '[object Array]') {
			return arr;
		}
		var result = [];
		for (var i = 0; i < len; i++) {
			result.push(arr);
		}
		return result;
	},
};

;;;
'use strict';

/** @function Array#getRandomItems
 * Получение случайные (не повторяющиеся) элементы массива
 * @param {Number} count кол-во случайных элеметнов
 * @return Массив случайных элементов массива
 */
/*Array.prototype.getRandomItems = function(count) {
	var items = [];
	for (var i = 0; i < count; i++) {
		if (this.length >= 1) {
			items.push(this[chaslib.math.randomize(0, this.length - 1)]);
		} else {
			items.push(this[0]);
		}
	}
	return items;
};
*/

//Так, как было, выдаёт повторяющиеся, что недопустимо.
Array.prototype.getRandomItems = Array.prototype.iz;

/** @function Array#getRandomItem
 * Получение случайный элемент массива
 * @return Случайный элемент массива
 */
Array.prototype.getRandomItem = function() {
	return this.getRandomItems(1);
};

Array.prototype.addToGlobal('docsArray', 1);

;;;
'use strict';

/** @function Number#round
 * Округление числа
 * @param {Number} decPlaces точность округления
 * @return число num округлённое до dp
 */
Number.prototype.round = function(decPlaces) {
	var decPlaces = decPlaces || 1;
	// ЩИТО?!!
	return Math.round(this / decPlaces) * decPlaces;
};


/** @function Number#is_divied_by
 * Проверка кратности
 * @param {Number} divisor делитель
 * @return Кратно ли числу divisor
 */
Number.prototype.isDividedBy = function(divisor) {
	return this % divisor == 0;
};


/** @function Number#isDivisorOf
 * Проверка на кратность числу
 * @param {Number} num делимое
 * @return Является ли число делителем num
 */
Number.prototype.isDivisorOf = function(num) {
	return num % this == 0;
};


/** @function Number#getDivisors
 * Получение делителей числа
 * @return Массив делителей числа
 */
Number.prototype.getDivisors = function() {
	if (this == 0) {
		return [1];
	}
	var divisors = [];
	for (var d = 1; d <= num; d++) {
		if (this.isDividedBy(d)) {
			divisors.push(d);
		}
	}
	return divisors;
};


/** @function Number#getRandomDivisor
 * Случайные делитель
 * @return Случайный делитель числа num
 */
Number.prototype.getRandomDivisor = function() {
	return this.getDivisors().getRandomItem();
};

Number.prototype.addToGlobal('docsNumber', 1);

;;;
'use strict';

String.prototype.parseHumanReadableToJSON = function() {
	var result = {};
	var rows = this.split(/\s*[\n\r]+\s*/g);
	var currentProperty = 0;
	for (var i = 0; i < rows.length; i++) {
		if (/:$/.test(rows[i])) {
			currentProperty = rows[i].replace(/:$/, '');
			result[currentProperty] = '';
		} else {
			result[currentProperty] += ' '.esli(result[currentProperty]) + rows[i];
		}
	}
	return result;
};

String.prototype.addToGlobal('docsString', 1);

;;;
'use strict';

String.prototype.udalPerv =
String.prototype.deleteFirst = function(n) {
/**Удаляет n первых символов строки. При вызове без параметров удаляет 1 символ.*/
	if (n == undefined) {
		n = 1;
	}
	return this.substr(n, this.length - n);
};

String.prototype.udalPosl =
String.prototype.deleteLast = function(n) {
/**Удаляет n последних символов строки. При вызове без параметров удаляет 1 символ.*/
	if (n == undefined) {
		n = 1;
	}
	return this.substr(0, this.length - n);
};

String.prototype.insert = function(i, str) {
// TODO: переписать через printIf
//вставляет в строку после i-го символа
	var ss = '';
	if (i > 0) {
		ss = this.substring(0, i);
	}
	var sss = '';
	if (i < this.length - 1) {
		sss = this.substring(i);
	}
	return ss + str + sss;
};

String.prototype.isSpace = function() {
/**Состоит ли строка только из пробельных символов?*/
	return (/^\s+$/).test(this);
};

String.prototype.posl = // Deprecated
String.prototype.getLast = // Исключительно для того, чтобы было отглагольное название
String.prototype.last = function() {
/**Возвращает последний символ строки*/
	return this[this.length - 1];
};

String.prototype.multiply = function(n) {
/**Возвращает строку, записанную n раз подряд*/
	var rez = this;
	for (var i = 1; i < n; i++) {
		rez += this;
	}
	return rez;
};

String.prototype.dopdo = // Deprecated
String.prototype.padTo = function(padWith, targetLength) {
/**Дополняет строку подстроками спереди, пока длина строки не станет не менее n.*/
	var str = this;
	while (str.length < targetLength) {
		str = padWith + str;
	}
	return str;
};

String.prototype.esli = // Deprecated
String.prototype.printIf = function(p1) {
/**Возвращает данную строку, если p1, и пустую в противном случае.*/
	return p1 ? this : '';
};

String.prototype.reverse = function() {
/**Переворачивает строку*/
	return this.split('').reverse().soed();
};//http://blog.stevenlevithan.com/archives/mimic-lookbehind-javascript //Товарищ очень сильно выручил

String.prototype.mesh =
String.prototype.shuffle = function() {
/**Перемешивает строку посимвольно в случайном порядке*/
	return this.split('').shuffle().soed();
};


String.prototype.addToGlobal('docsString', 1);

;;;
'use strict';

String.prototype.plusminus = // Deprecated
String.prototype.beautifyAlgebraicNotation = function() {
/**Примитивное упрощение математических выражений. Меняет "++" на "+", например.*/
	var a = this;
	for (;a.match(/[+-][+-]/);) {
		a = a.replace(/[+][+]/g, '+');
		a = a.replace(/--/g, '+');
		a = a.replace(/[+]-/g, '-');
		a = a.replace(/-[+]/g, '-');
		a = a.replace(/[+]$/g, '');
		a = a.replace(/[{][+]/g, '{');
		a = a.replace(/[+][}]/g, '}');
		a = a.replace(/\(\+/g, '(');
		a = a.replace(/\+\)/g, ')');
	}
	a = a.replace(/[=]\s*[+]/g, '=');
	a = a.replace(/[+]1(?=[A-Za-zА-Яа-яЁё\\(])/g, '+');
	a = a.replace(/[-]1(?=[A-Za-zА-Яа-яЁё\\(])/g, '-');
	a = a.replace(/[{]1(?=[A-Za-zА-Яа-яЁё\\(])/g, '{');
	a = a.replace(/[}]1(?=[A-Za-zА-Яа-яЁё\\(])/g, '}');
	a = a.replace(/[ ]1(?=[A-Za-zА-Яа-яЁё\\(])/g, ' ');
	a = a.replace(/[~]1(?=[A-Za-zА-Яа-яЁё\\(])/g, '~');
	a = a.replace(/[(]1(?=[A-Za-zА-Яа-яЁё\\(])/g, '(');
	a = a.replace(/[)]1(?=[A-Za-zА-Яа-яЁё\\(])/g, ')');
	a = a.replace(/[=]1(?=[A-Za-zА-Яа-яЁё\\(])/g, '=');
	a = a.replace(/[;]1(?=[A-Za-zА-Яа-яЁё\\(])/g, ';');
	a = a.replace(/\^1(?=[A-Za-zА-Яа-яЁё\\(])/g, '^');
	a = a.replace(/\$1(?=[A-Za-zА-Яа-яЁё\\(])/g, '$');
	a = a.replace(/^1(?=[A-Za-zА-Яа-яЁё])/g, '');
	a = a.replace(/^[+]/g, '');
	a = a.replace(/[;][-]0/g, ';0');
	a = a.reverse();
	a = a.replace(/[.]{2}(?=[A-Za-zА-Яа-яЁё])/g, '.');
	a = a.replace(/[.]{1}[$][.]{1}(?=[A-Za-zА-Яа-яЁё\\])/g, '$.');
	a = a.reverse();
	return a;
};

String.prototype.negativeBracketsTeX = function() {
/**Отрицательное число (начинающееся со символа "-") берётся в скобки*/
	return this[0] ==  '-' ? '\\left(' + this + '\\right)' : '' + this;
};

String.prototype.ob$ = function() {
/**Оборачивает строку в символы начала/конца формулы TeX - $*/
	return '$' + this + '$';
};

String.prototype.frac = //Deprecated
String.prototype.texfrac = function(denominator) {
/**Возвращает TeX-запись дроби, в которой числитель - данная строка, знаменатель denominator.*/
	return '\\frac{' + this + '}{' + denominator + '}';
};

String.prototype.ts =
String.prototype.toStandart = function(wrapComma) {
/**Приводит строку к записи "по стандарту": заменяет точку на запятую.
Если wrapComma, то берёт запятую в фигурные скобки, чтобы убрать отступы в TeX.
Предназначена для строк, содержащих представление числа.*/
	var a = this.replace(/[.]/g, ',');
	if (wrapComma) {
		a = a.replace(/[,]/, '{,}');
	}
	return a;
};

String.prototype.addToGlobal('docsString', 1);

;;;
'use strict';

String.prototype.neutralizeXSS = function() {
/**Нейтрализует (экранирует) XSS-угрозы. По крайней мере, должна. Будет пополняться.*/
	return this.replace(/<\//g, '');
};

String.prototype.vTabl =
String.prototype.toTable = function(p1, p2) {
/**"Оборачивает" данную строку в тэг таблицы. Применяется крайне редко и узко.*/
	return (p1 ? p1 : '<br/><br/>') +
		this.vTag('table', p2 ? p2 : 'style="text-align:center;font:inherit;" border=1');
		//.vTag('center');
};

String.prototype.vTag =
String.prototype.toTag = function(p1, p2) {
/**"Оборачивает" данную строку с тэг p1 c параметрами p2. p2 можно опускать.*/
	return '<' + p1 + (' ' + p2).esli(p2) + '>' + this + '</' + p1 + '>';
};

String.prototype.addToGlobal('docsString', 1);

;;;
'use strict';

/** @namespace chaslib.math
 * Работа с числами
 */
chaslib.math = {
	Vec2 : function(x, y) {
		return { x : x || 0, y : y || 0 };
	},


	Vec3 : function(x, y, z) {
		return { x : x || 0, y : y || 0, z : z || 0 };
	},

	/** @function chaslib.math.randomize
	 * Генерация случайного числа
	 * @param {Number} min минимальное значение
	 * @param {Number} max минимальное значение
	 * @param {Number} decPlaces кол-во знаков после запятой
	 * @return случайное число
	 */
	randomize : function(min, max, decPlaces) {
		return (Math.random() * ((max || 9007199254740992) - (min || 0))).round(decPlaces || 1);
	}
};


;;;
'use strict';

/** @namespace chaslib.sets
 * Наборы
 */
chaslib.sets = {
	/** @namespace chaslib.sets.alphabets
	 * Алфавиты/Азбуки
	 */
	alphabets : {
		/**
		 * Английский алфавит
		 */
		english : [ 'A', 'B', 'C', 'D', 'F', 'G', 'H', 'J', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'Q', 'U', 'W', 'X', 'Y', 'Z' ],


		/**
		 * Русская азбука
		 */
		russian : [ 'А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ё', 'Ж', 'И', 'Й', 'К', 'Л', 'М', 'Н', 'П', 'Р', 'С', 'Т', 'У', 'Ф',
		            'Х', 'Ц', 'Ч', 'Ш', 'Щ', 'Ъ', 'Ы', 'Ь', 'Э', 'Ю', 'Я' ],
	},


	/**
	 * Единицы длинны
	 */
	lengthUnits : [
		{ name : 'русская миля', inMeters : 7467.6 },
		{ name : 'верста', inMeters : 1066.8 },
		{ name : 'кабельтов', inMeters : 185.2 },
		{ name : 'морская миля', inMeters : 1852 },
		{ name : 'американская миля', inMeters : 1609.34 },
		{ name : 'фурлонг', inMeters : 201.16 },
		{ name : 'метр', inMeters : 1 },
		{ name : 'километр', inMeters : 1000 },
		{ name : 'дециметр', inMeters : 0.1 },
		{ name : 'сантиметр', inMeters : 0.01 },
		{ name : 'миллиметр', inMeters : 0.001 },
	],


	/**
	 * Единицы измерения грузов
	 */
	weightUnits : [ 'тонна', 'кубометр' ],


	/**
	 * Стороны монеты
	 */
	sidesOfCoin : [ 'орёл', 'решка' ],


	/**
	 * Разы
	 */
	times : [ 'ни разу', 'один раз', 'дважды', 'трижды', 'четырежды', 'пятикратно', 'шестикратно', 'семикратно', 'восьмикратно',
	          'девятикратно', 'десятикратно' ],

	/**
	 * Качества
	 */
	merits  : [ 'безопасность', 'комфорт', 'функциональность', 'качество', 'внешний вид', 'простота ремонта', 'надёжность',
	            'гарантийный срок', 'скорость запуска', 'настраиваемость' ],

	/**
	 * Товары
	 */
	goods : [ 'автомобиль', 'кофеварка', 'чайник', 'ноутбук', 'бензопила', 'СВЧ-печь', 'велосипед', 'садовый насос' ],


	/**
	 * Имена (женские)
	 */
	womanNames : [ 'Анастасия', 'Юлия', 'Елена', 'Ольга', 'Яна', 'Олеся', 'Кристина', 'Вероника', 'Элеонора', 'Дарья', 'Мария',
	                'Екатерина', 'Софья', 'Наталия', 'Надежда', 'Александра' ],


	/**
	 * Отчества (женские)
	 */
	womanPatronymic : [ 'Ивановна', 'Петровна', 'Фёдоровна', 'Васильевна', 'Анатольевна', 'Николаевна', 'Сергеевна', 'Игоревна',
	                     'Михайловна', 'Владимировна', 'Олеговна', 'Степановна', 'Юрьевна', 'Александровна', 'Алексеевна' ],


	/**
	 * Професии (женские)
	 */
	womanProfessions : [ 'суровая хакерша', 'программистка', 'веб-дизайнер', 'аспирантка', 'скромный библиотекарь', 'блондинка',
	                      'студентка', 'школьница', 'комсомолка, спортсменка, отличница и, наконец, просто красавица', '' ],


	/**
	 * Транспортные средства
	 */
	transportation : [ '\'Запорожец\'', '\'Москвич\'', /*'автомобиль',*/ 'грузовик', 'велосипед', 'доисторический омнибус', 'автобус' ],


	/**
	 * Месяца
	 */
	months : [
		{ name : 'январь', daysCount : 31 },
		{ name : 'февраль', daysCount : 28 },
		{ name : 'март', daysCount : 31 },
		{ name : 'апрель', daysCount : 30 },
		{ name : 'май', daysCount : 31 },
		{ name : 'июнь', daysCount : 30 },
		{ name : 'июль', daysCount : 31 },
		{ name : 'август', daysCount : 31 },
		{ name : 'сентябрь', daysCount : 30 },
		{ name : 'октябрь', daysCount : 31 },
		{ name : 'ноябрь', daysCount : 30 },
		{ name : 'декабрь', daysCount : 31 }
	],


	/**
	 * Валюты
	 */
	currencies : [ 'российский рубль', 'доллар США', 'евро', 'фунт стерлингов' ],


	/**
	 * Еда
	 */
	food : [ 'сырок', 'шоколадка', 'яблоко', 'груша', 'упаковка сока', 'бутерброд', 'бутылка газировки', 'батон', 'буханка хлеба' ],


	/**
	 * Корабли
	 */
	ships : [ 'корабль', 'круизный лайнер', 'прогулочное судно', 'теплоход', 'пароход', 'атомоход' ],


	/**
	 * Сроки
	 */
	terms : [ 'неделя', 'декада', 'месяц' ],


	/**
	 * Учереждения
	 */
	agencies : [ 'офис', 'канцелярия', 'секретариат', 'министерство', 'ведомство', 'Рособрнадзор', 'Минобрнауки' ],


	/**
	 * Дни недели
	 */
	weekDays : [ 'воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота' ],

	/**
	 * Страны
	 */
	countries : [ 'Россия', 'Белоруссия', 'Китай', 'ЮАР', 'Эквадор', 'Венесуэла', 'Куба', 'Австралия', 'Австрия', 'Бельгия',
	              'Англия', 'Германия', 'Польша', 'Сербия', 'Чехия', 'Словакия', 'Словения', 'Израиль', 'Бразилия', 'Мексика' ],


	/**
	 * Игры на двоих
	 */
	gamesForTwo : [ 'шахматы', 'вольная борьба', 'настольный теннис', 'бадминтон', 'шашки' ],


	/**
	 * Виды спорта
	 */
	sports : [ 'гимнастика', 'вольная борьба', 'лёгкая атлетика', 'тяжёлая атлетика' ],


	/**
	 * Стеклянные изделия
	 */
	vitrics : [ 'витрина', 'оконная рама', 'аквариум', 'книжная полка', 'террариум' ],


	/**
	 * Жидкости
	 */
	liquids : [ 'воды', 'ртути', 'жидкости', 'раствора', 'бензина', 'керосина', 'метилового спирта', 'газировки', 'уксуса',
	            'нефти' ],

	/**
	 * Города
	 */
	cities : [ 'Киров', 'Воронеж', 'Москва', 'Санкт-Петербург', 'Казань', 'Сочи', 'Семилуки', 'Хабаровск', 'Магадан', 'Красноярск' ],


	/**
	 * Просьбы ответить
	 */
	answer : [ 'выразите', 'дайте', 'приведите', 'запишите' ],


	/**
	 * Просьбы найти
	 */
	answerFind : [ 'найдите', 'определите', 'вычислите' ],


	/**
	 * Металы
	 */
	metals : [ 'меди', 'алюминия', 'чугуна', 'железа', 'стали', 'никеля', 'хрома' ],


	/**
	 * Топлива
	 */
	fuels : [ 'топливо', 'бензин', 'дизель', 'газ', 'керосин', 'солярка' ],


	/**
	 * Междугородний транспорт
	 */
	longDistanceTransport : [ 'автобус', 'поезд' ],


	/**
	 * Виды населённых пунтков
	 */
	typesOfSettlements : [ 'пункт', 'населённый пункт', 'город', 'городок', 'ПГТ', 'деревня', 'село', 'хутор', 'посёлок',
	                         'инноград', 'наукоград' ],


	/**
	 * Стройматериалы
	 */
	buildingMaterials : [ 'пенобетон', 'бетон', 'брус', 'шлак', 'песок', 'щебень', 'гранит', 'известняк', 'песчаник',
	                       'камень', 'гравий' ],


	/**
	 * Строения
	 */
	buildings : ['гараж', 'дом', 'дача', 'магазин']
};


;;;
'use strict';

/**
   @deprecated
 */
var NLib = chaslib;

/**
   @deprecated
 */
var NLmath = NLib.math;


/**
   @deprecated
 */
var NLsets = NLib.sets;


/**
   @deprecated
 */
chaslib.getTypeOf = chaslib.typeOf;

;;;
//Синонимы функций: сокращение, транслит, антитранслит и тому подобное

//Для func.js
var sl=sluchch;

//Для прототипных
String.prototype.ts=String.prototype.toStandart;
