const MazeBot = require('./MazeBot');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const vec3 = require('vec3');

class BuilderMazeBot extends MazeBot {
    constructor(username) {
        super(username);
        this.mazeToBuild = null;
        this.initEventListeners();
    }

    initEventListeners() {
        this.bot.once("spawn", () => {
            console.log(`${this.username} spawned`);
            this.bot.creative.stopFlying();
        });
    }

    async initBuildingBlock(Item, blockToUse) {
        await this.bot.creative.setInventorySlot(36, Item);
        await this.bot.equip(blockToUse, "hand");
        console.log(`${this.username} ready to build using ${Item.name}`);
    }

    async flyToPosition(position) {
        try {
            await this.bot.creative.flyTo(position);
            return true;
        } catch (e) {
            return false;
        }
    }

    async buildTwoBlocksBelow() {
        let currPos = this.bot.entity.position.offset(0, -2.5, 0);
        let referenceBlock = this.bot.blockAt(currPos.offset(0, -1, 0));
        await this.bot.placeBlock(referenceBlock, new vec3(0,1,0));
        referenceBlock = this.bot.blockAt(currPos);
        await this.bot.placeBlock(referenceBlock, new vec3(0,1,0));
    }

    async buildMaze() {
        let currPos = this.bot.entity.position;
        let height = this.mazeToBuild.length;
        let width = this.mazeToBuild[0].length;
        for (var i = 0; i < height; ++i) {
            for (var j = 0; j < width; ++ j) {
                let position = currPos.offset(j, 0, i);
                if (this.mazeToBuild[i][j]) {
                    await this.flyToPosition(position);
                    await this.buildTwoBlocksBelow();
                }
            }
        }
    }

    setMazeToBuild(maze) {
        this.mazeToBuild = maze;
    }

}

module.exports = BuilderMazeBot;