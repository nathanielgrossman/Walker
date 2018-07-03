const accountSid = 'AC8265c3af624d3ceeefdfc6f02919a105'; // Your Account SID from www.twilio.com/console
const authToken = '4eab0a2fc8bd2c399ae3b15197e678d4';   // Your Auth Token from www.twilio.com/console

const twilio = require('twilio');
const client = new twilio(accountSid, authToken);
console.log('sending');
client.messages.create({
    body: 'Hello from Node',
    to: '+13109457549',  // Text this number
    from: '+18057492557' // From a valid Twilio number
})
.then((message) => console.log(message.sid));

//(805) 749-2557