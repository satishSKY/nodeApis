'use strict';
const express = require('express'),
	app = express(),
	logger = require('morgan'),
	util = require('util'),
	bodyParser = require('body-parser'),
	hostname = '0.0.0.0',
	os = require( 'os' );

var config = require('./api/config/config');
app.set('port', process.env.PORT || config.port);

/*Error Handler */
process.addListener("uncaughtException", function (err) {
	util.log("Uncaught exception: " + err);
	console.log(err.stack);
	console.log(typeof (this));
});
process.on('SIGINT', function () {	
		//process.exit(0);	
});
process.on('message', function (msg) {
	if (msg == 'shutdown') {
		console.log('Closing all connections...');
		setTimeout(function () {
			console.log('Finished closing connections');
			process.exit(0);
		}, 1500);
	}
});
app.on('error', function (e) {	
	if (e.code === 'EADDRINUSE') {
		console.log('Failed to bind to port - address already in use ');
		process.exit(1);
	}
});
/**
 * Express Use
 */
app.use(express.static(__dirname + '/assets/images'));
app.use(bodyParser.urlencoded({
	extended: true,
	limit: '2000mb'
}));
app.use(bodyParser.json({limit: '2000mb'}));
app.use(logger());
app.use(function (req, res, next) {
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
	res.header('Access-Control-Allow-Headers', 'X-Requested-With, Content-type,Accept,apikey');
	res.header('Access-Control-Allow-Origin', '*');
	next();
	/*console.log(req.headers.apikey  );
	if (req.headers.apikey != config.apiKey && req.url.search("download_file") <= -1)
	 		res.status(403).end("NOT FOUND");
	 else
		next();
	*/
});

app.get('/', (req, res, next) => {
	//res.send("Server running......");
	res.writeHead(404, {
		'content-type': 'text/html'
	});
	res.status(404).end("<h1 style='text-align:center;color:red;margin-top:100px;'>NOT FOUND</h1>");
	/*res.end(
		'<form action="/api/v1/upload_img" enctype="multipart/form-data" method="post">' +
		'<input type="text" name="title"><br>' +
		'<input type="file" name="file" multiple="multiple"><br>' +
		'<input type="submit" value="Upload">' +
		'</form>'
	);*/
});

var routes = require('./api/routes/routes');
routes(app);

if (!String.prototype.trim) {
	String.prototype.trim = function () {
		return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
	};
}


app.listen(app.get("port"), hostname, () => {
	let ip = "";// os.networkInterfaces().en0.find(elm=>elm.family=='IPv4').address;
	console.log(`Server running at http://${ip}:${app.get("port")}/`);
});




/**
//http://jsfiddle.net/nikoshr/02ugrbzr/	
var myArray = [
    {name:"Bob",b:"text22",c:true},
    {name:"Tom",b:"text25",c:true},
    {name:"Adam",b:"text22",c:true},
    {name:"Tom",b:"text2",c:true},
    {name:"Bob",b:"text21",c:true}
];

console.dir(
    _.uniq(myArray, _.property('name'))
);
var t =  _.uniq(myArray, 'name');
console.dir(t);
var s = _.uniq(t, 'b');
console.dir(s);

 */

//npm install xlsx-to-json-lc