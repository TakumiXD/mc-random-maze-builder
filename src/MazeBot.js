const mineflayer = require("mineflayer");
const config = require("../config.json");

const settings = {
    host: "localhost",
    port: config.settings.portNumber,
    username: config.settings.username
};

class MazeBot {
    constructor(username) {
        this.username = username;
        this.bot = mineflayer.createBot({
            host: "localhost",
            port: config.settings.portNumber,
            username: username
        });
        this.initBasicEventListeners();
    }

    initBasicEventListeners() {
        // --- bot event listeners
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

    async initFly() {
        let currPos = this.bot.entity.position;
        await this.bot.creative.flyTo(currPos.offset(0, 2.5, 0));
    }
}

module.exports = MazeBot