/**
 * Created by MaoX on 2016/3/9.
 */
var express = require('express');
var path = require('path');
var logger = require('morgan');//日志
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);//保存session到mongodb
var favicon = require('serve-favicon');
var routes = require('./routes/index');
var mongoose = require('mongoose');
var settings = require('./settings');
var flash = require('connect-flash');
var moment = require('moment');
var markdown = require('markdown').markdown;
var fs = require('fs');
var app = express();
var FileStreamRotator = require('file-stream-rotator');

var logDirectory = __dirname+'/logs';
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);//保证日志目录存在




//连接数据库
var dbUrl = 'mongodb://localhost:27017/blog';
mongoose.connect(dbUrl);

// 加载数据模型
var models_path = __dirname+'/models';
var walk = function(path){
    fs
        .readdirSync(path)
        .forEach(function(file){
            var newPath = path+'/'+file;
            var stat = fs.statSync(newPath);
            if(stat.isFile()){
                if(/(.*)\.(js|coffe)/.test(file)){
                    require(newPath);
                }
            }else if(stat.isDirectory()){
                walk(newPath);
            }
        })

};
walk(models_path);

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
        url:dbUrl,
        collection:'sessions'
    })
}));
app.use(favicon(path.join(__dirname,'public/favicon.ico')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

routes(app);

if('development' === app.get('env')){
    app.set('showStackError',true);
    app.use(logger('dev'));
    app.locals.pretty = true;
}else{
    var accessLogStream = FileStreamRotator.getStream({
        date_format:'YYYYMMDD',
        filename:logDirectory+'/access-%DATE%.log',
        frequency:'daily',
        verbose:false
    });
    app.use(logger('combined',{stream: accessLogStream}));
}

moment.locale('zh-cn');
app.locals.moment = moment;
app.locals.markdown = markdown;
app.listen(app.get('port'), function(){
    console.log('Express server listening on port '+app.get('port'));
});

