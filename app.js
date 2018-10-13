var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var slackRouter = require('./routes/slack');
const slackExpress = require('express-slack')
const slack = require('@slack/client');
const token = process.env.SLACK_TOKEN;
const web = new slack.WebClient(token);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/slackBuildWebhook', slackExpress({
  scope: process.env.SCOPE,
  token: token,
  store: 'data.json',
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET
}));

// register a slash command handler
slackExpress.on('/deploy', (payload, message)=> {

  console.log(payload)

  // web.files.list({channel})s

  message.reply('Weeee')
})

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

module.exports = app;
