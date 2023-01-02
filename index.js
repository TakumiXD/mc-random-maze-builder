const BossMazeBot = require("./src/BossMazeBot.js")
const config = require("./config.json");

let createBot = new BossMazeBot(config.settings.usernameBoss);