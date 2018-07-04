var AWS = require('aws-sdk');


AWS.config.region = process.env.REGION

const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const http = require('http');

const twilioController = require('./server/twilioController');
const timeController = require('./server/timeController');



const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/client/index.html');
});

app.get('/test',
  twilioController.welcome
);

app.post('/sms',
	twilioController.getMessageType
);

app.post('/starttrip',
  twilioController.getUserFromIncoming,
  twilioController.composeResponse,
  twilioController.sendResponse,
  timeController.basicTimer,
  twilioController.checkIn
);

app.post('/endtrip', 
	twilioController.getUserFromIncoming,
	twilioController.confirmArrival,
	twilioController.sendResponse
)

var port = process.env.PORT || 3000;

var server = app.listen(port, function() {
  console.log('Server running at http://127.0.0.1:' + port + '/');
});