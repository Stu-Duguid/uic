//
// main.js
//

var http = require('http');
var fs = require('fs');

http.createServer(function (request, response) {
   response.end();
}).listen(8080, 'localhost');
console.log('Server running at http://localhost:8080/.');

