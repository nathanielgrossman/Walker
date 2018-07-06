const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const http = require('http');
const pg = require('pg');
var AWS = require('aws-sdk');

const twilioController = require('./server/twilioController');
const timeController = require('./server/timeController');
const dbController = require('./server/dbController');

AWS.config.region = process.env.REGION



const app = express();
app.use(bodyParser());
app.use(express.static('client')
)

app.get('/', (req, res) => {
  console.log('requesting root');
});

app.get('/test',
	dbController.test
);


app.post('/sms',
  twilioController.getMessageType
);

app.post('/createuser',
  dbController.createUser,
  twilioController.welcome
);

app.post('/starttrip',
  dbController.getUserFromIncoming,
  twilioController.composeReply,
  twilioController.sendReply,
  timeController.arrivalTimer,
  dbController.checkUserStatus,
  twilioController.checkIn
);

app.post('/followup',
  dbController.getUserFromIncoming,
  twilioController.followup,
  timeController.followupTimer,
  dbController.checkUserStatus,
  twilioController.finalCheckIn
);

app.post('/endtrip',
  dbController.getUserFromIncoming,
  twilioController.confirmArrival,
  twilioController.sendResponse
);

app.post('/alert',
  dbController.getUserFromIncoming,
  twilioController.alert
);

app.post('/catch',
  dbController.getUserFromIncoming,
  twilioController.catch,
  twilioController.sendReply
);

var port = process.env.PORT || 3000;

var server = app.listen(port, function() {
  console.log('Server running at http://127.0.0.1:' + port + '/');
});