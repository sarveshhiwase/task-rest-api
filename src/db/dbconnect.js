const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then((conn) =>
    console.log(
      `MongoDB successfully connected with ${conn.connections[0].host}`
    )
  )
  .catch((e) => console.log("Error Connecting"));
