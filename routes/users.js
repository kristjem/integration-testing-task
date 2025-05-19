var express = require('express');
var router = express.Router();
var db = require("../models");
var UserService = require("../services/userService");
var userService = new UserService(db);


router.get('/', function(req, res, next) {
  userService.getAll().then((users) => {
    res.status(200).json({
      success: true,
      data: users
    });
  }).catch((err) => {
    console.log(err);
    res.status(500).json({ success: false, message: "Something threw a wrench into the CPU fan... That was unexpected." });
  });
});

router.get('/:username', function(req, res, next) {
  const username = req.params.username;
  userService.getOneByUsername(username).then((user) => {
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    res.status(200).json({
      success: true,
      data: user
    });
  }).catch((err) => {
    console.log(err);
    res.status(500).json({ success: false, message: "Something threw a wrench into the CPU fan... That was unexpected." });
  });
});


router.post('/', async function(req, res, next) {
  const { username, password, score } = req.body;
  const validation = await validateUserObjectInput(username, password, score);
  if (!validation.success) {
    return res.status(400).json({ success: false, message: validation.message });
  }
  userService.create(username, password, score).then((user) => {
    res.status(201).json({
      success: true,
      data: user
    });
  }).catch((err) => {
    if (err.name === 'SequelizeValidationError') {
      // Extract all error messages
      const messages = err.errors.map(e => e.message);
      return res.status(400).json({ success: false, errors: messages });
    }
    res.status(500).json({ success: false, message: "Something threw a wrench into the CPU fan... That was unexpected." });
  });
});

router.delete('/:username', function(req, res, next) {
  const username = req.params.username;
  userService.deleteOneByUsername(username).then((result) => {
    if (result) {
      res.status(200).json({
        success: true,
        message: "User deleted successfully."
      });
    } else {
      res.status(404).json({ success: false, message: "User not found." });
    }
  }).catch((err) => {
    console.log(err);
    res.status(500).json({ success: false, message: "Something threw a wrench into the CPU fan... That was unexpected." });
  });
});

async function validateUserObjectInput(username, password, score) {
  if (!username || !password || score === undefined) {
    return { success: false, message: "username, password and score are required." };
  }
  if (typeof username !== 'string' || typeof password !== 'string' || typeof score !== 'number') {
    return { success: false, message: "username and password must be strings, score must be a number." };
  }
  const existingUser = await userService.getOneByUsername(username);
  console.log(`Called getOneByUsername with username: ${username}`);
  console.log(`Existing user: ${existingUser}`);
  if (existingUser) {
    return { success: false, message: "Username already taken." };
  }
  return { success: true };
}

module.exports = {router, userService};
