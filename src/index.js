const express = require("express");

const cl = console.log;
require("./db/dbconnect");

const userRouter = require("./routers/user");
const taskRouter = require("./routers/task");

const port = process.env.PORT || 3000;

const app = express();

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => cl(`Server is running on ${port}`));
