const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');

const twilioController = require('./server/twilioController');
const timeController = require('./server/timeController');

const testUser = {
	_id: 1,
	name: 'Nate',
	phone: '+13109457549',
	dur: 30000
}

const app = express();

app.use(bodyParser.json());

app.get('/', (req, res) => {
  console.log(req.url);
});

app.listen(3000);