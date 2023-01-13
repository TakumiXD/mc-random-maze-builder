const MazeBot = require("./MazeBot");
const BuilderMazeBot = require("./BuilderMazeBot");
const Maze = require("./Maze.js");
const config = require("../config.json");
let Item;  // loaded after bot spawns in minecraft server
let mcData; // loaded after bot spawns in minecraft server
const vec3 = require('vec3');

const NUM_OF_BUILDERS = Math.max(parseInt(config.settings.numOfBuilders), 1);
const DEFAULT_BUILD_BLOCK_NAME = "oak_leaves";
const MAX_LENGTH_ARGUMENTS = 3;
const NUM_OF_TICKS_BOT_SPAWN = 60;

// --- The bot that listens to user commands, creates the blueprint of the maze, splits tasks 
// --- for the BuilderMazeBots, and assigns them which subsections of the maze to build
class BossMazeBot extends MazeBot {
    constructor(username) {
        super(username);
        this.builders = [];
        this.blueprint = {
            height: -1,
            width: -1,
            buildBlockName: DEFAULT_BUILD_BLOCK_NAME,
            buildItem: null,
            buildBlock: -1,
            shape: null
        };
        this.initEventListeners();
    }

    // --- Initializes event listeners
    initEventListeners() {
        this.bot.once("spawn", () => {
            console.log(`${this.username} spawned`);
            mcData = require("minecraft-data")(this.bot.version);
            Item = require("prismarine-item")(this.bot.version);
            this.bot.creative.stopFlying();
        });
        
        // --- bot command listener
        this.bot.on("chat", async (username, message) => {
            if (username == this.username) return;

            let tokens = message.split(" ");

            if (tokens[0] == "buildMaze") {
                await this.onBuildMaze(tokens.slice(1));
            }
        });
    }

    // --- Given block returns the corresponding prismarine-item
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
            return -1;
        }
    }

    // --- Validate tokens and sets the blueprint of the maze
    setBlueprint(tokens) {
        // validate command length
        if (tokens.length > MAX_LENGTH_ARGUMENTS) return false;

        // validate and set maze height and width arguments
        if (isNaN(tokens[0]) || isNaN(tokens[1])) return false;
        let heightToken = parseInt(tokens[0]);
        let widthToken = parseInt(tokens[1]);
        if (Maze.areValidArguments(heightToken), parseInt(widthToken) 
            && heightToken > NUM_OF_BUILDERS && widthToken > NUM_OF_BUILDERS) {
            this.blueprint.height = parseInt(heightToken);
            this.blueprint.width = parseInt(widthToken);
        }
        else return false;

        // set buildBlockName to block argument if it exists
        if (tokens.length == MAX_LENGTH_ARGUMENTS) {
            this.blueprint.buildBlockName = tokens[2];
        }

        // validate and set buildBlock
        this.blueprint.buildBlock = this.getBuildBlock(this.blueprint.buildBlockName);
        if (this.blueprint.buildBlock == -1) return false;

        // validate and set buildItem
        this.blueprint.buildItem = this.getBuildItem(this.blueprint.buildBlock);
        if (!this.blueprint.buildItem) return false;

        // set maze shape
        this.blueprint.shape = 
            Maze.makeRandomMaze(this.blueprint.height, this.blueprint.width);

        return true;
    }

    // --- Returns an array where the integer in the ith index represents the number of rows
    // --- the ith builder is responsible for building the maze
    getNumOfRowsPerBuilder() {
        let numsOfRowsPerBuilder = []
        let avgNumOfRowsPerBuilder = Math.floor(this.blueprint.height / NUM_OF_BUILDERS);
        let leftoverNumsOfRows = this.blueprint.height % NUM_OF_BUILDERS;

        for (let i = 0; i < NUM_OF_BUILDERS; ++i) {
            let numOfRows = avgNumOfRowsPerBuilder;
            if (leftoverNumsOfRows > 0) {
                numOfRows += 1
                leftoverNumsOfRows -= 1
            }
            numsOfRowsPerBuilder.push(numOfRows);
        }

        return numsOfRowsPerBuilder;
    }

    // --- Returns an array where the integer in the ith index represents the starting position
    // --- (in row number) the ith builder starts building the maze
    getBuilderStartingPositions(numsOfRowsPerBuilder) {
        let currentPosition = 0
        let builderStartingPositions = []

        for (let i = 0; i < NUM_OF_BUILDERS; ++i) {
            builderStartingPositions.push(currentPosition);
            currentPosition += numsOfRowsPerBuilder[i];
        }

        return builderStartingPositions;
    };

    // --- Orders all builders to spawn and go to their initial positions
    async orderInitialPositions(bossPosition) {
        let numOfRowsPerBuilder = this.getNumOfRowsPerBuilder();
        let builderStartingPositions = this.getBuilderStartingPositions(numOfRowsPerBuilder);
        
        for (let i = 0; i < NUM_OF_BUILDERS; ++ i) {
            // spawn builders
            let builder = new BuilderMazeBot(`${config.settings.usernameBuilder}_${i}`);
            this.builders.push(builder);
            await this.bot.waitForTicks(NUM_OF_TICKS_BOT_SPAWN);
            await builder.initBuildMode(this.blueprint.buildItem, this.blueprint.buildBlock);

            // make builders go to their inital positions
            let builderPosition = bossPosition.offset(0, 0, builderStartingPositions[i]);
            await builder.flyToPosition(builderPosition);
            builder.setMazeShapeToBuild(this.blueprint.shape.slice(builderStartingPositions[i], 
                builderStartingPositions[i] + numOfRowsPerBuilder[i]));
        }
    }

    // --- Orders all builders to start building their maze
    async orderBuild() {
        let operations = this.builders.map(async builder => {
            await builder.buildMaze();
        });
        return Promise.all(operations);
    }

    // --- When the player asks to build the maze
    async onBuildMaze(tokens) {
        // try creating the blueprint and return if it fails
        if (!this.setBlueprint(tokens)) {
            this.bot.chat("buildMaze failed, invalid arguments");
            console.log("buildMaze failed, invalid arguments");
            return;
        };

        await this.initFly();

        let bossPosition = this.bot.entity.position;
        await this.orderInitialPositions(bossPosition);

        console.log(`${this.username} has ordered the builders to start building`);
        await this.orderBuild();

        console.log("The maze is finished");
        this.bot.chat("The maze is finished");
    }

}

module.exports = BossMazeBot;