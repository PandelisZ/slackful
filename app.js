var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var rimraf = require('rimraf');
require('dotenv').config()

const slack = require('@slack/client');
const token = process.env.SLACK_TOKEN;
const web = new slack.WebClient(token);
const axios = require('axios');
const fs = require('fs-extra')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/slackCommand', async (req, res) => {

  const channelId = req.body.channel_id

  const files = await web.files.list({channel: channelId})

  const fileContents = await Promise.all(files.files.map(async (file) => {
     return await web.files.info({file: file.id})
  }));

  const writeFiles = await Promise.all(fileContents.map(async (f) => {
    const url = f.file.url_private_download
    try {
       rimraf('public', function () { console.log('Directory cleaned.'); });
    } catch (e) {
      console.log(e)
    }
   

    // if(!f.file.title == RegExp(`.+\..+`)){ // TODO: Check for file extension in name
    //   resp.send(`File name '` + f.file.title + `' is invalid. Add file extension to name!`)
    // }

    // if(!f.file.title == RegExp(`.+\..+`)){ // TODO: Check for file extension in name
    //   resp.send(`File name '` + f.file.title + `' is invalid. Add file extension to name!`)
    // }

    console.log(f)

    const download = await axios.get(
      url,
      {
        responseType: 'buffer',
        headers: {
        "Authorization": `Bearer ${token}`
        }
      }
    );

    await fs.outputFile(path.join(__dirname, 'public') + `/${f.file.title}`, download.data, err => {
      console.log(err)
    })

    res.json({
    "response_type": "ephemeral",
    "text": `Deployed to ${process.env.DEPLOY}`,
    })
  }))
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
