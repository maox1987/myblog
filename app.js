/**
 * Created by MaoX on 2016/3/9.
 */
var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var favicon = require('serve-favicon');
var routes = require('./routes/index');

var app = express();
var settings = require('./settings');
var flash = require('connect-flash');

app.set('port',process.env.PORT || 3000);
app.set('views', path.join(__dirname,'views'));
app.set('view engine', 'jade');

app.use(flash());
app.use(session({
    secret:settings.cookieSecret,
    cookie:{maxAge:1000*60*60*24*30}, //30 days
    resave:true,
    saveUninitialized:false,
    store: new MongoStore({
        url:'mongodb://localhost:27017/blog',
        collection:'sessions'
    })
}));
app.use(favicon(path.join(__dirname,'public/favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

routes(app);

app.listen(app.get('port'), function(){
    console.log('Express server listening on port '+app.get('port'));
});

