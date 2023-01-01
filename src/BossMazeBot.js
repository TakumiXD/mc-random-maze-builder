const MazeBot = require("./MazeBot");
const BuilderMazeBot = require("./BuilderMazeBot");
const Maze = require("./Maze.js");
const config = require("../config.json");
var Item;  // loaded after bot spawns in minecraft server
var mcData; // loaded after bot spawns in minecraft server
const vec3 = require('vec3');

const NUM_OF_BUILDERS = 4;
const MAX_LENGTH_ARGUMENTS = 3;

class BossMazeBot extends MazeBot {
    constructor(username) {
        super(username);
        this.builders = [];
        this.blueprint = {
            height: -1,
            width: -1,
            buildBlockName: "oak_leaves",
            buildItem: null,
            buildBlock: null,
            shape: null
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
                await this.onBuildMaze(tokens.slice(1));
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
        if (tokens.length > MAX_LENGTH_ARGUMENTS) return false;
        // validate and set maze height and width arguments
        if (isNaN(tokens[0]) || isNaN(tokens[1])) return false;
        if (Maze.areValidArguments(parseInt(tokens[0]), parseInt(tokens[1]))) {
            this.blueprint.height = parseInt(tokens[0]);
            this.blueprint.width = parseInt(tokens[1]);
        }
        else return false;
        // set buildBlockName to block argument if it exists
        if (tokens.length == MAX_LENGTH_ARGUMENTS) {
            this.blueprint.buildBlockName = tokens[2];
        }
        // validate and set buildBlock
        this.blueprint.buildBlock = this.getBuildBlock(this.blueprint.buildBlockName);
        if (!this.blueprint.buildBlock) return false;
        // validate and set buildItem
        this.blueprint.buildItem = this.getBuildItem(this.blueprint.buildBlock);
        if (!this.blueprint.buildItem) return false;
        // set maze shape
        this.blueprint.shape = 
            Maze.makeRandomMaze(this.blueprint.height, this.blueprint.width);
        return true;
    }

    getNumOfRowsPerBuilder() {
        let numsOfRowsPerBuilder = []
        let avgNumOfRowsPerBuilder = Math.floor(this.blueprint.height / NUM_OF_BUILDERS);
        let leftoverNumsOfRows = this.blueprint.height % NUM_OF_BUILDERS;
        for (var i = 0; i < NUM_OF_BUILDERS; ++i) {
            let numOfRows = avgNumOfRowsPerBuilder;
            if (leftoverNumsOfRows > 0) {
                numOfRows += 1
                leftoverNumsOfRows -= 1
            }
            numsOfRowsPerBuilder.push(numOfRows);
        }
        return numsOfRowsPerBuilder;
    }

    getBuilderStartingPositions(numsOfRowsPerBuilder) {
        let currentPosition = 0
        let builderStartingPositions = []
        for (var i = 0; i < NUM_OF_BUILDERS; ++i) {
            builderStartingPositions.push(currentPosition);
            currentPosition += numsOfRowsPerBuilder[i];
        }
        return builderStartingPositions;
    };

    async onBuildMaze(tokens) {
        if (!this.setBlueprint(tokens)) {
            this.bot.chat("buildMaze failed, invalid arguments");
            console.log("buildMaze failed, invalid arguments");
            return;
        };
        await this.initFly();
        let numOfRowsPerBuilder = this.getNumOfRowsPerBuilder();
        let builderStartingPositions = this.getBuilderStartingPositions(numOfRowsPerBuilder);
        let bossPos = this.bot.entity.position;
        for (var i = 0; i < NUM_OF_BUILDERS; ++ i) {
            let builder = new BuilderMazeBot(`${config.settings.usernameBuilder}_${i}`);
            this.builders.push(builder);
            await this.bot.waitForTicks(60);
            await builder.initBuildingBlock(this.blueprint.buildItem, this.blueprint.buildBlock);
            await builder.initFly();
            let builderPos = bossPos.offset(0, 0, builderStartingPositions[i]);
            await builder.flyToPosition(builderPos);
            builder.setMazeToBuild(this.blueprint.shape.slice(builderStartingPositions[i], builderStartingPositions[i] + numOfRowsPerBuilder[i]));
        }
        await Promise.all([this.builders.forEach( b => b.buildMaze() )]);
    }
}

module.exports = BossMazeBot;