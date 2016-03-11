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
var fs = require('fs');
var app = express();
var settings = require('./settings');
var flash = require('connect-flash');
var moment = require('moment');

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
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

routes(app);
moment.locale('zh-cn');
app.locals.moment = moment;

app.listen(app.get('port'), function(){
    console.log('Express server listening on port '+app.get('port'));
});

