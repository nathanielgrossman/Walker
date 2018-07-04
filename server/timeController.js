const timeController = {};

//initial timer to check if user arrives in their set duration
timeController.arrivalTimer = (req, res, next) => {
  let start = Date.now();
  let end = start + res.locals.user.dur;
  console.log('starting now');
  let timer = setInterval(() => {
    let now = Date.now();
    if (now >= end) {
      console.log('ending now. user is safe:', res.locals.user.safe)
      clearInterval(timer);
      next();
    };
  }, 333)
}

//timer to check if user checks in before their followup duration expires
timeController.followupTimer = (req, res, next) => {
  let start = Date.now();
  let end = start + res.locals.user.followup;
  console.log('starting now');
  let timer = setInterval(() => {
    let now = Date.now();
    if (now >= end) {
      console.log('ending followup now. user is safe:', res.locals.user.safe)
      clearInterval(timer);
      next();
    };
  }, 333)
}
module.exports = timeController;