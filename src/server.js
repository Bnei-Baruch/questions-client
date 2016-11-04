var http = require('http');
var faye = require('faye');
var config = require('./config');

var server = http.createServer();
var bayeux = new faye.NodeAdapter({ mount: config.fayePrefix, timeout: 45 });

bayeux.attach(server);
server.listen(8000);