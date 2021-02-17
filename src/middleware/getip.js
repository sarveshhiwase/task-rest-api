const axios = require("axios");
const browser = require("browser-detect");

const getip = async (req, res, next) => {
  try {
    const clientbrowser = browser(req.headers["user-agent"]);
    // console.log(clientbrowser)
    const ipurl = `https://api.ipify.org?format=json`;
    const result = await axios(ipurl);
    // console.log(result.data.ip);
    req.ClientInfo = { ip: result.data.ip, clientbrowser };
    // console.log(req.ClientInfo)
    next();
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
};
module.exports = getip;
