//
// fileserver.js
//

var http = require('http'),
path = require('path'),
fs = require('fs'),
util = require('util');
 
// create server to handle HTTP requests

http.createServer(httpServer).listen(8080);
console.log('Server running at http://127.0.0.1:8080/');
 
function httpServer(req, res) {
    var documentRoot = "docs",
	filePath = "";

    // for now only do GET requests for static files from disk
    if (req.method !== 'GET') {
	res.writeHead(405);
	res.end('Method not allowed - only GET currently supported', 'utf8');
	return;
    }

    // check requested file
    if ('.' + req.url === './') {
	res.writeHead(400);
	res.end('Directory listing and default file not supported', 'utf8');
	return;
    }	
    filePath = documentRoot + req.url;

    // serve file from disk if it exists
    fs.exists(filePath, serveFile);	

    function serveFile(fileExists) {
	if (fileExists === false) {
	    res.writeHead(404);
	    res.end('File not found', 'utf8');
	    return;
	}

	// stream file from disk
	var stream = fs.createReadStream(filePath);

	stream.on('error', function(error) {
	    res.writeHead(500);
	    res.end();
	    return;
	});

	// set mime type of response
	var mimeTypes = {
	    '.html' : 'text/html',
	    '.js' : 'text/javascript',
	    '.css' : 'text/css',
	    '.gif' : 'image/gif'
	};

	var contentType = "text/plain";
	contentType = mimeTypes[path.extname(filePath)];

	res.setHeader('Content-Type', contentType);
	res.writeHead(200);

	util.pump(stream, res, function(error) {
	    res.end();
	    return;
	});

    }
}
