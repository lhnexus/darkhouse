var debug = require('debug')('darkhouse');
var _ = require('underscore');
var express = require('express');
var session = require('express-session')
var path = require('path');
var ejs = require('ejs');
//var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var async = require('async');
var passport = require('passport');
//var uuid = require('node-uuid');
var app = express();

// views engine setup
app.set('views', path.join(__dirname, 'app/views'));
app.engine('.html',ejs.__express);
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(express.static(path.join(__dirname, 'app')));

//app.get('env') return the environment variable NODE_ENV, same as process.env.NODE_ENV
if (app.get('env') === 'development') {
    app.use(logger('dev'));
}else{
    app.use(logger());
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({name: 'sessionID',
                 secret:'darkhouse',
                 cookie: { httpOnly: false }
       }));
app.use(passport.initialize());
app.use(passport.session());


async.series([
    function(callback){
        var entityDB = require('./server/models/connections/conn_mysql_mdb.js');
        entityDB.setTenantDomain('darkhouse.com');
        entityDB.loadEntities(callback);
    },
    function(callback){
        var auth = require('./server/controllers/server_auth.js');
        passport.use(auth.LocalStrategy);
        passport.serializeUser(auth.serializeUser);
        passport.deserializeUser(auth.deserializeUser);

/*        var user = require('./models/user.js');
       user.getUserByEmail('zklee@hotmail.com', function(err, userAttributes){
           for(var i in userAttributes){
               console.log(userAttributes[i].attr_name+"="+userAttributes[i].attr_value);
           }
       });*/
       callback(null, 0);
    },
    function(callback){
        var routes = require('./server/server_routes');
        app.use('/', routes);

        // catch 404 and forward to error handler
        app.use(function(req, res, next) {
            var err = new Error('Not Found');
            err.status = 404;
            next(err);
        });

        // error handlers
        // development error handler
        // will print stacktrace
        if (app.get('env') === 'development') {
            app.use(function(err, req, res, next) {
                res.status(err.status || 500);
                res.render('server_error', {
                    message: err.message,
                    error: err
                });
            });
        }

        // production error handler
        // no stacktraces leaked to user
        app.use(function(err, req, res, next) {
            res.status(err.status || 500);
            res.render('server_error', {
                message: err.message,
                error: err
            });
        });

        callback(null, 0);
    },
    function(callback){
        app.set('port', process.env.PORT || 3000);
        var server = app.listen(app.get('port'), function() {
            debug('Express server listening on port ' + server.address().port);
        });
        callback(null, 0);
    }
])

