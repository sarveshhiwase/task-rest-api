const express = require("express");
const User = require("../models/user");
const auth = require("../middleware/auth");
const multer = require("multer");
const sharp = require("sharp");
const sendEmail = require("../emails/account");

const welcomeMessage = (name) =>
  `Thanks for Using Our API, Welcome ${name} I hope You Enjoy.`;
const CancelingMessage = (name) =>
  `GoodBye ${name}, I hope we see you comeback again anytime soon.`;
const signUpmsg = "WELCOME to TASK API";
const deleteMsg = "CANCELING TASK API SERVICE";

const router = new express.Router();
router.post("/users", async (req, res) => {
  const newuser = new User(req.body);

  try {
    await newuser.save();

    sendEmail(
      newuser.email,
      signUpmsg.toLowerCase(),
      welcomeMessage(newuser.name)
    );
    const token = await newuser.generateAuthToken();
    res.status(201).send({ user: newuser, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );

    const token = await user.generateAuthToken();

    res.send({ user, token });
  } catch (error) {
    res.status(400).send();
  }
});

router.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
});

router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      (token) => token.token !== req.token
    );
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

router.patch("/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password", "age"];
  const isValidUpdation = updates.every((update) =>
    allowedUpdates.includes(update)
  );
  if (!isValidUpdation) {
    return res.status(400).send({ error: "Invalid Updates" });
  }

  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();

    res.send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete("/users/me", auth, async (req, res) => {
  try {
    await req.user.remove();
    sendEmail(
      req.user.email,
      deleteMsg.toLowerCase(),
      CancelingMessage(req.user.name)
    );
    res.send(req.user);
  } catch (e) {
    res.status(500).send();
  }
});

const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(
        new Error("Please Upload image with png,jpeg or jpg extensions")
      );
    }

    cb(undefined, true);
  },
});

router.post(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    const newfilebuffer = await sharp(req.file.buffer)
      .resize({
        width: 256,
        height: 256,
      })
      .png()
      .toBuffer();
    req.user.avatar = newfilebuffer;
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({
      error: error.message,
    });
  }
);

router.delete("/users/me/avatar", auth, async (req, res) => {
  try {
    req.user.avatar = undefined;
    await req.user;
    res.send();
  } catch (error) {
    res.send(500).send(e);
  }
});

router.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) {
      throw new Error();
    }

    res.set("Content-Type", "image/jpg");
    res.send(user.avatar);
  } catch (error) {
    res.send(400).send(e);
  }
});

module.exports = router;
