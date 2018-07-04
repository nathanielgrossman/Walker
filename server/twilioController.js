const accountSid = 'AC8265c3af624d3ceeefdfc6f02919a105'; // Your Account SID from www.twilio.com/console
const authToken = '4eab0a2fc8bd2c399ae3b15197e678d4'; // Your Auth Token from www.twilio.com/console

const twilio = require('twilio');
const client = new twilio(accountSid, authToken);
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const keywords = require('./twilioKeywords');

const testUser = {
  _id: 1,
  name: 'Nate',
  phone: '+13109457549',
  emergency: '+13109457549',
  dur: 30000,
  safe: null
};

const twilioController = {};

twilioController.welcome = (req, res, next) => {
  const user = testUser;
  const message = `Hello ${user.name}, nice to meet you! Text me "leaving", "omw", or "On my way!", and I'll keep an eye out for you till you get home.`
  client.messages.create({
      body: message,
      to: user.phone, // Text this number
      from: '+18057492557' // From a valid Twilio number
    })
    .then((message) => {
      console.log(message.sid);
      next();
    });
}

twilioController.getUserFromIncoming = (req, res, next) => {
  let sender = req.body.From;
  console.log(sender);
  //insert logic here to get user from database using sender's number
  res.locals.user = testUser;
  //end db logic
  next();
}

twilioController.getMessageType = (req, res, next) => {
	let text = req.body.Body.toLowerCase();
	if (keywords.starters.includes(text)) {
		res.redirect('/starttrip')
	} else if (keywords.stops.includes(text)) {
		res.redirect('endtrip')
	}
	//check if message is 'omw', 'home', or 'help' and route accordingly
}

twilioController.composeResponse = (req, res, next) => {
  const user = res.locals.user;
  res.locals.message = `Alright, see you soon!`
  user.safe = false;
  next();
}

twilioController.sendResponse = (req, res, next) => {
  const message = res.locals.message;
  const twiml = new MessagingResponse();
  twiml.message(message);
  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end(twiml.toString());
  next();
}

twilioController.checkIn = (req, res, next) => {
  const user = res.locals.user;
  if (user.safe === false) {
    const message = `Are you alright?`
    client.messages.create({
        body: message,
        to: user.phone, // Text this number
        from: '+18057492557' // From a valid Twilio number
      })
      .then((message) => {
        console.log(message.sid);
        next();
      });
  } else {
    next();
  }
}

twilioController.confirmArrival = (req, res, next) => {
	const user = res.locals.user;
	user.safe = true;
	res.locals.message = `Good!`;
	next()
}


module.exports = twilioController;