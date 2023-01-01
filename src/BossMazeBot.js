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
        this.blueprint = {
            mazeHeight: -1,
            mazeWidth: -1,
            buildBlockName: "oak_leaves",
            buildItem: null,
            buildBlock: null
        };
        this.initEventListeners();
    }

    initEventListeners() {
        this.bot.once("spawn", () => {
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
                if (!this.setBlueprint(tokens.slice(1))) {
                    this.bot.chat("buildMaze failed, invalid arguments");
                    console.log("buildMaze failed, invalid arguments");
                    return;
                };
                await this.initFly();
                let currPos = this.bot.entity.position;
                let offset = [4, 0, 0];
                for (var i = 0; i < NUM_OF_BUILDERS; ++ i) {
                    let builder = new BuilderMazeBot(`${config.settings.usernameBuilder}_${i}`);
                    this.builders.push(builder);
                    await this.bot.waitForTicks(60);
                    await builder.initBuildingBlock(this.blueprint.buildItem, this.blueprint.buildBlock);
                    await builder.initFly();
                    await builder.flyToPosition(currPos);
                    currPos = currPos.offset(...offset);
                }
                await Promise.all([this.builders.forEach( b => b.buildStraightLine() )]);
            }
        });
    }

    getBuildItem(block) {
        try {
            return new Item(block, 1);
        } catch(e) {
            console.log(e);
            return null;
        }
    }

    // --- Give name of a block as a string returns the mcData blocks id
    getBuildBlock(blockName) {
        try {
            return mcData.itemsByName[blockName].id;
        } catch(e) {
            this.bot.chat(`Failed, specified block does not exist: ${blockName}`);
            console.log(`getBlock() failed, specified block does not exist: ${blockName}`);
            return null;
        }
    }

    setBlueprint(tokens) {
        // validate command length
        if (tokens.length > MAX_LENGTH_COMMAND - 1) return false;
        // validate and set maze height and width arguments
        if (isNaN(tokens[0]) || isNaN(tokens[1])) return false;
        if (Maze.areValidArguments(parseInt(tokens[0]), parseInt(tokens[1]))) {
            this.blueprint.mazeHeight = parseInt(tokens[0]);
            this.blueprint.mazeWidth = parseInt(tokens[1]);
        }
        else return false;
        // set buildBlockName to block argument if it exists
        if (tokens.length == MAX_LENGTH_COMMAND - 1) {
            this.blueprint.buildBlockName = tokens[2];
        }
        // validate and set buildBlock
        this.blueprint.buildBlock = this.getBuildBlock(this.blueprint.buildBlockName);
        if (!this.blueprint.buildBlock) return false;
        // validate and set buildItem
        this.blueprint.buildItem = this.getBuildItem(this.blueprint.buildBlock);
        if (!this.blueprint.buildItem) return false;
        return true;
    }
}

module.exports = BossMazeBot;