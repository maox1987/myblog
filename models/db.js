var mongodb = require('mongodb');
var settings = require('../settings');

var Db = mongodb.Db;
var Connection = mongodb.Connection;
var Server = mongodb.Server;

module.exports = new Db(settings.db,new Server(settings.host,settings.port),{safe:true});