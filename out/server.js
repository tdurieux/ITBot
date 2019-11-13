
function randn_bm(min, max, skew) {
    var u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );

    num = num / 10.0 + 0.5; // Translate to 0 -> 1
    if (num > 1 || num < 0) num = randn_bm(min, max, skew); // resample between 0 and 1 if out of range
    num = Math.pow(num, skew); // Skew
    num *= max - min; // Stretch to fill range
    num += min; // offset to min
    return num;
}

function sleepRandom() {
    const lapse =  randn_bm(10, 500, 3)
    var e = new Date().getTime() + lapse;
    console.log("Sleeping...", lapse)
    while (new Date().getTime() <= e) {;}
}
    

    var http = require('http');

var url = require('url'); // Linear password checking


function checkInput(params) {
  sleepRandom();
  var correct = "password"; // params into array

  var p = params["word"];

  if (p.length != correct.length) {
    sleepRandom();
    result = false;
  }

  for (var i = 0; i < correct.length; i++) {
    sleepRandom();
    if (correct[i] !== p[i]) return false; //sleep(Math.random()*100)
  }

  return true;
}

http.createServer(function (request, response) {
  sleepRandom();
  var u = url.parse(request.url, true);

  if (u.path.indexOf('/check') == 0) {
    sleepRandom();
    var result = checkInput(u.query);
    response.writeHeader(200, {
      'Content-Type': 'text/html'
    });

    if (result) {
      sleepRandom();
      response.write('Congrats, correct password');
    } else {
      sleepRandom();
      response.write('At least one value is wrong!</br>');
    }

    response.end();
  }
}).listen(8081);
console.log('Server running at http://localhost:8081/');

            