const MazeBot = require('./MazeBot');
const vec3 = require('vec3');

const QUICKBAR_SLOT_ONE = 36;

// --- The bot that builds the maze, gets orders by BossMazeBot
class BuilderMazeBot extends MazeBot {
    constructor(username) {
        super(username);
        this.mazeToBuild = null;
        this.initEventListeners();
    }

    // --- Initializes event listeners
    initEventListeners() {
        this.bot.once("spawn", () => {
            console.log(`${this.username} spawned`);
            this.bot.creative.stopFlying();
        });
    }

    // --- Setters for the maze that the builder should build
    setMazeShapeToBuild(maze) {
        this.mazeToBuild = maze;
    }

    // --- Get the minecraft item the bot uses to build the maze and make the bot equip it
    async initBuildMode(Item, blockToUse) {
        await this.bot.creative.setInventorySlot(QUICKBAR_SLOT_ONE, Item);
        await this.bot.equip(blockToUse, "hand");
        await this.initFly();
        console.log(`${this.username} ready to build using ${Item.name}`);
    }

    // --- Makes the bot fly to specified position
    async flyToPosition(position) {
        try {
            await this.bot.creative.flyTo(position);
            return true;
        } catch (e) {
            console.log(e);
            return false;
        }
    }

    // --- Assuming the bot is flying 2.5 blocks above the ground, makes the bot place 2 blocks
    // --- under it. 
    async buildTwoBlocksBelow() {
        const currentPosition = this.bot.entity.position.offset(0, -1 * this.flyHeight, 0);
        let referenceBlock = this.bot.blockAt(currentPosition.offset(0, -1, 0));
        await this.bot.placeBlock(referenceBlock, new vec3(0, 1, 0));

        referenceBlock = this.bot.blockAt(currentPosition);
        await this.bot.placeBlock(referenceBlock, new vec3(0, 1, 0));
    }

    // --- Makes the bot build one tile of the maze
    async buildAt(position) {
        await this.flyToPosition(position);
        await this.buildTwoBlocksBelow();
    }

    // Makes the bot build the assigned maze
    async buildMaze() {
        const initialPosition = this.bot.entity.position;
        const height = this.mazeToBuild.length;
        const width = this.mazeToBuild[0].length;
        
        // build in a zig zag
        for (let i = 0; i < height; ++i) {
            if (i % 2 == 0) {
                for (let j = 0; j < width; ++ j) {
                    let position = initialPosition.offset(j, 0, i);
                    if (this.mazeToBuild[i][j]) await this.buildAt(position);
                }
            }
            else {
                for (let j = width - 1; j >= 0; --j) {
                    let position = initialPosition.offset(j, 0, i);
                    if (this.mazeToBuild[i][j]) await this.buildAt(position);
                }
            }
        }
        console.log(`${this.username} is done building its part`);
    }

}


module.exports = BuilderMazeBot;