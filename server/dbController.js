const db = require('./../db')

const dbController = {};

dbController.test = (req, res, next) => {
  console.log('hellloooooo')
  db.query('SELECT * FROM users', (err, result) => {
    if (err) {
      console.log(err);
    }
    console.log('here', result.rows)
    next();
  })
}

dbController.createUser = (req, res, next) => {
  let user = req.body;
  let phone = '+1' + user.area + user.prefix + user.suffix;
  let emergency = '+1' + user.earea + user.eprefix + user.esuffix;
  console.log(phone);
  const text = 'INSERT INTO users (firstname, lastname, phone, emergency, dur, followup) VALUES($1, $2, $3, $4, $5, $6) RETURNING *;';
  const values = [user.firstname, user.lastname, phone, emergency, user.dur, user.followup]
  db.query(text, values, (err, results) => {
    if (err) {
      console.log(err);
    } else {
      res.locals.user = {
        firstname: user.firstname,
        lastname: user.lastname,
        phone: phone,
        emergency: emergency,
        dur: user.dur,
        followup: user.followup,
        safe: true
      }
      next();
    }
  });
}

//get user data from DB using phone number from incoming message
dbController.getUserFromIncoming = (req, res, next) => {
  let senderNum = req.body.From;
  console.log(senderNum);
  const text = 'SELECT firstname, lastname, phone, emergency, dur, followup, safe FROM users WHERE phone = $1'
  const values = [senderNum];
  db.query(text, values, (err, result) => {
  	if (err) {
      console.log(err);
     } else {
      res.locals.user = result.rows[0];
       next();
     }
  })
}

dbController.checkUserStatus = (req, res, next) => {
  let senderNum = req.body.From;
  console.log(senderNum);
  const text = 'SELECT safe FROM users WHERE phone = $1'
  const values = [senderNum];
  db.query(text, values, (err, result) => {
  	if (err) {
      console.log(err);
     } else {
      res.locals.user.safe = result.rows[0].safe;
       next();
     }
  })
}

module.exports = dbController;