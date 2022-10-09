const http = require('http');
const fs = require('fs');
const url = require('url');

// read in configuration from file .config
//const baseDir = '/Users/stu/Sites/unified'; // tbd read from config object

// create in-memory index object of all files in site
const index = indexCreate('/Users/stu/Sites/unified');

http.createServer((request, response) => {
	let body = [];
	request.on('error', (err) => {
		console.error(err);
	}).on('data', (chunk) => {
		body.push(chunk);
	}).on('end', () => {
		
		// assemble body
		body = Buffer.concat(body).toString();
	
		// catch response errors
		response.on('error', (err) => {
			console.error(err);
		});
	
		// tbd: get identity

		// get resource record
		const reqURL = url.parse(request.url, true);

		let resource = indexGetNode(index, reqURL.pathname);
		console.log('resource: ', resource);
		if (resource === null) {
			console.warn('404');
			response.statusCode = 404;
			response.end('file not found');
			return;
		}

		const reqFile = resource.path;
		console.log('reqFile: '+reqFile);

		if (request.method === 'GET') {
			processGet(request, response);
		//} else if (request.method === 'POST') {
			//processPost(request, response);
		//} else if (request.method === 'PUT') {
			//processPut(request, response);
		//} else if (request.method === 'DELETE') {
			//processDelete(request, response);
		} else {
			// other requests not yet supported so return an error
			console.error('unsupported request method: ' + request.method);
			response.statusCode = 405;
			response.end('unsupported request method' + request.method);
			return;
		}

		function processGet(req, resp) {
			// check it exists by opening to read
			fs.readFile(reqFile, 'utf8', function (err,data) {
				if (err) {
					console.error(err);
					// return a 404 on any error for now
					response.statusCode = 404;
					response.end('file not able to be opened');
					return;
				}
				// construct response
				// stream to response
				response.statusCode = 200;
				response.setHeader('Content-Type', 'application/json');
		
				//data.pipe(response);
				response.write(data);
				response.end();
			});
		}
	});
}).listen(8080);

function indexCreate(baseDir) {
	let index = indexCreateNode(baseDir, '/', null);
	console.log('index: ', index);
	return index;
}

function indexCreateNode(path, name, parentNode) {
	// object to be returned
	let newNode = {
		name: name,
		path: path,
		children: {},
		parent: parentNode
	};

	try {
		// read directory contents
		let files = fs.readdirSync(path, { withFileTypes: true });
		files.forEach( (file) => {
			let filepath = path+'/'+file.name;
			if (file.isFile()) {
				newNode.children[file.name] = {
					name: file.name,
					path: filepath,
					children: {},
					parent: newNode
				};
			}
			else if (file.isDirectory()) {
				newNode.children[file.name] = indexCreateNode(filepath, file.name, newNode);;
			}
		});
	}
	catch (err) {
		console.error(err);
	}
	return indexBuild;
}

function indexGetNode(index, filepath) {

	const pieces = filepath.split('/'); // [ '', 'a', 'b', 'c.html' ]
	const length = pieces.length;
	let n = 1; // iterator through pieces
	let r = index; // resource cursor through index; starts at root

	while (n < length) {
		let p = pieces[n]; // next path element to find
		if (r.children[p] === undefined) {
			return null; // not found
		}
		r = r.children[p];
		n++;
	}
	return r;
}
