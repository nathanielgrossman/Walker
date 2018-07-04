const accountSid = require('./../twilioKeys').accountSid;
const authToken = require('./../twilioKeys').authToken;

const twilio = require('twilio');
const client = new twilio(accountSid, authToken);
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const keywords = require('./twilioKeywords');

const testUser = {
  _id: 1,
  firstName: 'Nate',
  lastName: 'Grossman',
  phone: '+13109457549',
  emergency: '+13109457549',
  dur: 10000,
  followup: 10000,
  safe: null
};

const twilioController = {};

//send welcome message to new user
twilioController.welcome = (req, res, next) => {
  const user = testUser;
  const message = `Hello ${user.firstName}, nice to meet you! Text me "leaving", "omw", or "On my way!", and I'll keep an eye out for you till you get home.`
  client.messages.create({
      body: message,
      to: user.phone, 
      from: '+18057492557' 
    })
    .then((message) => {
      console.log(message.sid);
      next();
    });
}

//check content of message to determine what action to take
twilioController.getMessageType = (req, res, next) => {
  let text = req.body.Body.toLowerCase().replace(/\s/g, '');
  if (keywords.starters.includes(text)) {
    res.redirect('/starttrip')
  } else if (keywords.stops.includes(text) || keywords.affirmatives.includes(text)) {
    res.redirect('/endtrip')
  } else if (keywords.triggers.includes(text)) {
    res.redirect('/alert')
  } else {
    res.redirect('/catch')
  }
  //check if message is 'omw', 'home', or 'help' and route accordingly
}

//get user data from DB using phone number from incoming message
twilioController.getUserFromIncoming = (req, res, next) => {
  let sender = req.body.From;
  console.log(sender);
  //insert logic here to get user from database using sender's number
  res.locals.user = testUser;
  //end db logic
  next();
}

//compose reply to incoming message
twilioController.composeReply = (req, res, next) => {
  const user = res.locals.user;
  res.locals.message = `Alright, see you soon!`
  user.safe = false;
  next();
}

//send reply to incoming message (doesn't end response)
twilioController.sendReply = (req, res, next) => {
  const message = res.locals.message;
  const user = res.locals.user;
  client.messages.create({
      body: message,
      to: user.phone,
      from: '+18057492557'
    })
    .then((message) => {
      console.log('followup sent: ', message.sid);
      next();
    });
}

//check in with user if arrival has not been confirmed by the time timer expires
twilioController.checkIn = (req, res, next) => {
  console.log('reached checkin. user is safe: ', res.locals.user.safe)
  const user = res.locals.user;
  if (user.safe === false) {
    res.redirect('/followup')
  } else {
    next();
  }
}

//send followup message
twilioController.followup = (req, res, next) => {
  console.log('reached followup');
  const user = res.locals.user;
  const message = `Are you alright?`
  client.messages.create({
      body: message,
      to: user.phone,
      from: '+18057492557'
    })
    .then((message) => {
      console.log('followup sent: ', message.sid);
      next();
    });
}

//determine if user has responded to followup and send alert if necessary
twilioController.finalCheckIn = (req, res, next) => {
  console.log('reached finalCheckIn. user is safe: ', res.locals.user.safe)
  const user = res.locals.user;
  if (user.safe === false) {
    res.redirect('/alert');
  } else {
    next();
  }
}

//set user status to safe if they confirm they've arrived
twilioController.confirmArrival = (req, res, next) => {
  const user = res.locals.user;
  user.safe = true;
  res.locals.message = `Good!`;
  next()
}

//contact emergency contact if user is not safe
twilioController.alert = (req, res, next) => {
  console.log('reached alert')
  const user = res.locals.user;
  const message = `You are recieving this message because you are the emergency contact for ${user.firstName} ${user.lastName}. They have not checked in and may need assistance. Please act accordingly.`;
  client.messages.create({
      body: message,
      to: user.emergency,
      from: '+18057492557'
    })
    .then((message) => {
      console.log('alert sent: ', message.sid);
      user.safe = null;
      next();
    });
}

//send response to incoming message (ends response)
twilioController.sendResponse = (req, res, next) => {
  const message = res.locals.message;
  const twiml = new MessagingResponse();
  twiml.message(message);
  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end(twiml.toString());
  next();
}

//respond's to unrecognized message
twilioController.catch = (req, res, next) => {
  const user = res.locals.user;
  res.locals.message = `Sorry ${user.firstName}, didn't catch that.`
  next();
}

module.exports = twilioController;