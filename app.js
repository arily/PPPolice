var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
//Access-Control-Allow-Origin: *
var cors = require('cors');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var bannedUsersRouter = require('./routes/banned');
var sotrash = require('./routes/sotrash');
var apiRouter = require('./routes/api');
var farm = require('./routes/farm');
var final = require('./routes/final');

var app = express();

//Access-Control-Allow-Origin: *
app.use(cors());


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

if (process.env.NODE_ENV != 'production') app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/banned', bannedUsersRouter);
app.use('/sotrash', sotrash);
app.use('/api', apiRouter);
app.use('/farm', farm);
app.use('/final', final);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});





var server = require('http').Server(app);
var io = require('socket.io')(server);
var { port } = require('./config/pppolice.js');
server.listen(port);

module.exports = { app, io };