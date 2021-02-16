const express = require("express");
const User = require("../models/user");
const auth = require("../middleware/auth");
const multer = require("multer");
const sharp = require("sharp");
// const request = require('request');
const axios = require('axios')
const fs = require('fs');
const path = require('path')



const router = new express.Router();
router.post("/users", async (req, res) => {
  // console.log(__dirname);
  const imagedata = fs.readFileSync(path.join(__dirname, "../avatar"))
  req.body.avatar = imagedata;

  const newuser = new User(req.body);

  try {
    await newuser.save();
    const token = await newuser.generateAuthToken();
    res.status(201).send({ user: newuser, token, clientinfo: req.ClientInfo });
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

    res.send({ user, token,clientinfo: req.ClientInfo  });
  } catch (error) {
    res.status(400).send();
  }
});

router.get("/users/me", auth, async (req, res) => {
  res.send({user: req.user,clientinfo: req.ClientInfo });
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

    res.send({user: req.user,clientinfo: req.ClientInfo });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete("/users/me", auth, async (req, res) => {
  try {
    await req.user.remove();
    res.send({user: req.user,clientinfo: req.ClientInfo });
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
    // console.log(user)
    if (!user || !user.avatar) {
      throw new Error();
    }

    res.set("Content-Type", "image/jpg");
    res.send(user.avatar);
  } catch (error) {
    console.log(error)
    res.sendStatus(400);
  }
});

module.exports = router;
