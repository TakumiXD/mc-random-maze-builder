const mineflayer = require("mineflayer");
const config = require("../config.json");

const settings = {
    host: "localhost",
    port: config.settings.portNumber,
    username: config.settings.username
};

const FLY_HEIGHT = 2.5; 

// --- Parent clas of BossMazeBot and BuilderMazeBot
class MazeBot {
    constructor(username) {
        this.username = username;
        this.flyHeight = FLY_HEIGHT;
        this.bot = mineflayer.createBot({
            host: "localhost",
            port: config.settings.portNumber,
            username: username
        });
        this.initBasicEventListeners();
    }

    // --- Initializes basic event listeners
    initBasicEventListeners() {
        this.bot.on("death", () => {
            console.log(`${this.username} died`);
        });

        this.bot.on("kicked", (reason, loggedIn) => {
            console.log(`${this.username} kicked`);
            console.log(reason, loggedIn);
        });

        this.bot.on("error", err => {
            console.log(`${this.username} error`);
            console.log(err);
        });
    }

    // --- Sends the bot to its initial position, "FLY_HEIGHT" blocks above ground.
    async initFly() {
        let currPos = this.bot.entity.position;
        await this.bot.creative.flyTo(currPos.offset(0, FLY_HEIGHT, 0));
    }

}

module.exports = MazeBot;