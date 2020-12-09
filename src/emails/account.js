const sendGrid = require("@sendgrid/mail");

const sendgridAPIkey = process.env.SEND_GRID_API_KEY;

sendGrid.setApiKey(sendgridAPIkey);

const sendEmail = (email, signCheck, message) => {
  sendGrid.send({
    to: email,
    from: "sarveshitachi07@gmail.com",
    subject: signCheck,
    text: message,
  });
};

module.exports = sendEmail;
