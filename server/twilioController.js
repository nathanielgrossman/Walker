const accountSid = require('./../keys').accountSid;
const authToken = require('./../keys').authToken;
const twilioNum = require('./../keys').twilioNum;

const twilio = require('twilio');
const client = new twilio(accountSid, authToken);
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const keywords = require('./twilioKeywords');
const db = require('./../db');


const twilioController = {};

//send welcome message to new user
twilioController.welcome = (req, res, next) => {
  const user = res.locals.user;
  const message = `Hello ${user.firstname}, nice to meet you! Text me "leaving", "omw", or "On my way!", and I'll keep an eye out for you till you get home.`
  client.messages.create({
      body: message,
      to: user.phone,
      from: twilioNum
    })
    .then((message) => {
      console.log(message.sid);
      res.end();
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

//compose reply to incoming message
twilioController.composeReply = (req, res, next) => {
  const user = res.locals.user;
  res.locals.message = `Alright, see you soon!`
  const text = 'UPDATE users SET safe = $1 WHERE phone = $2'
  const values = [false, user.phone];
  db.query(text, values, (err, result) => {
    if (err) {
      console.log(err);
    }
    res.locals.user.safe = false;
    next();
  })
}

//send reply to incoming message (doesn't end response)
twilioController.sendReply = (req, res, next) => {
  const message = res.locals.message;
  const user = res.locals.user;
  client.messages.create({
      body: message,
      to: user.phone,
      from: twilioNum
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
      from: twilioNum
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
  const text = 'UPDATE users SET safe = $1 WHERE phone = $2'
  const values = [true, user.phone];
  db.query(text, values, (err, result) => {
    if (err) {
      console.log(err);
    }
    res.locals.user.safe = true;
    next();
  })
  res.locals.message = `Good!`;
  next()
}

//contact emergency contact if user is not safe
twilioController.alert = (req, res, next) => {
  console.log('reached alert')
  const user = res.locals.user;
  const message = `You are recieving this message because you are the emergency contact for ${user.firstname} ${user.lastname}. They have not checked in and may need assistance. Please act accordingly.`;
  client.messages.create({
      body: message,
      to: user.emergency,
      from: twilioNum
    })
    .then((message) => {
      console.log('alert sent: ', message.sid);
      const text = 'UPDATE users SET safe = $1 WHERE phone = $2'
      const values = [true, user.phone];
      db.query(text, values, (err, result) => {
        if (err) {
          console.log(err);
        }
        res.locals.user.safe = true;
        next();
      })
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
  res.locals.message = `Sorry ${user.firstname}, didn't catch that.`
  next();
}

module.exports = twilioController;