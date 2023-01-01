const MazeBot = require("./MazeBot");
const BuilderMazeBot = require("./BuilderMazeBot");
const Maze = require("./Maze.js");
const config = require("../config.json");
var Item;  // loaded after bot spawns in minecraft server
var mcData; // loaded after bot spawns in minecraft server
const vec3 = require('vec3');

const NUM_OF_BUILDERS = 4;
const MAX_LENGTH_COMMAND = 4;

class BossMazeBot extends MazeBot {
    constructor(username) {
        super(username);
        this.builders = [];
        this.mazeHeight = -1;
        this.mazeWidth = -1;
        this.buildBlockName = "oak_leaves";
        this.buildItem = null;
        this.buildBlock = null;
        this.initEventListeners();
    }

    initEventListeners() {
        this.bot.once("spawn", () => {
            this.bot.chat("Hey, I'm here");
            console.log(`${this.username} spawned`);
            mcData = require('minecraft-data')(this.bot.version);
            Item = require('prismarine-item')(this.bot.version);
            this.bot.creative.stopFlying();
        });
        
        // --- bot command listener
        this.bot.on("chat", async (username, message) => {
            if (username == this.username) return;

            let tokens = message.split(' ');

            if (tokens[0] == "buildMaze") {
                if (!this.validateAndSetTokens(tokens.slice(1))) {
                    console.log("failed");
                    return;
                };
                console.log("passed")
                await this.initFly();
                let currPos = this.bot.entity.position;
                let offset = [4, 0, 0];
                for (var i = 0; i < NUM_OF_BUILDERS; ++ i) {
                    let builder = new BuilderMazeBot(`${config.settings.usernameBuilder}_${i}`);
                    this.builders.push(builder);
                    await this.bot.waitForTicks(60);
                    await builder.initBuildingBlock(this.buildItem, this.buildBlock);
                    await builder.initFly();
                    await builder.flyToPosition(currPos);
                    currPos = currPos.offset(...offset);
                }
                await Promise.all([this.builders.forEach( b => b.buildStraightLine() )]);
            }
        });
    }

    setMazeHeight(height) {
        this.mazeHeight = height
    }

    setMazeWidth(width) {
        this.mazeWidth = width;
    }

    setBuildBlockName(blockName) {
        this.buildBlockName = blockName;
    }

    setBuildItem(block) {
        try {
            this.buildItem = new Item(block, 1);
            return true;
        } catch(e) {
            console.log(e);
            return false;
        }
    }

    // --- Give name of a block as a string returns the mcData blocks id
    setBuildBlock(blockName) {
        try {
            this.buildBlock = mcData.itemsByName[blockName].id;
            return true;
        } catch(e) {
            this.bot.chat(`Failed, specified block does not exist: ${blockName}`);
            console.log(`getBlock() failed, specified block does not exist: ${blockName}`);
            return false;
        }
    }

    validateAndSetTokens(tokens) {
        // validate command length
        if (tokens.length > MAX_LENGTH_COMMAND - 1) return false;
        // validate and set maze height and width arguments
        if (isNaN(tokens[0]) || isNaN(tokens[1])) return false;
        if (Maze.areValidArguments(parseInt(tokens[0]), parseInt(tokens[1]))) {
            this.setMazeHeight = parseInt(tokens[0]);
            this.setMazeWidth = parseInt(tokens[1]);
        }
        else return false;
        // set buildBlockName to block argument if it exists
        if (tokens.length == MAX_LENGTH_COMMAND - 1) {
            this.setBuildBlockName(tokens[2]);
        }
        // validate and set buildBlock
        if (!this.setBuildBlock(this.buildBlockName)) return false;
        // validate and set buildItem
        if (!this.setBuildItem(this.buildBlock)) return false;
        return true;
    }
}

module.exports = BossMazeBot;