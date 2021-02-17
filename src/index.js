const express = require("express");
const cors = require("cors");
const getip = require("./middleware/getip");
const cl = console.log;
require("./db/dbconnect");

const userRouter = require("./routers/user");
const taskRouter = require("./routers/task");

const port = process.env.PORT || 3000;

const app = express();
const corsOptions = {
  origin: process.env.ORIGIN,
};
app.use(cors());
app.use(getip);

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => cl(`Server is running on ${port}`));
