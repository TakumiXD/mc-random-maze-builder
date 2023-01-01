const MazeBot = require("./MazeBot");
const BuilderMazeBot = require("./BuilderMazeBot");
const config = require("../config.json");
var Item;  // loaded after bot spawns in minecraft server
var mcData; // loaded after bot spawns in minecraft server
const vec3 = require('vec3');

const NUM_OF_BUILDERS = 4;

class BossMazeBot extends MazeBot {
    constructor(username) {
        super(username);
        this.builders = [];
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

            if (tokens[0] == "build") {
                await this.initFly();
                let currPos = this.bot.entity.position;
                let offset = [4, 0, 0];
                let blockToUse = await this.getBlock("oak_leaves");
                if (!blockToUse) return;
                let buildItem = this.getItem(blockToUse);
                if (!buildItem) return;
                for (var i = 0; i < NUM_OF_BUILDERS; ++ i) {
                    let builder = new BuilderMazeBot(`${config.settings.usernameBuilder}_${i}`);
                    this.builders.push(builder);
                    await this.bot.waitForTicks(60);
                    await builder.initBuildingBlock(buildItem, blockToUse);
                    await builder.initFly();
                    await builder.flyToPosition(currPos);
                    currPos = currPos.offset(...offset);
                }
                await Promise.all([this.builders.forEach( b => b.buildStraightLine() )]);
            }
        });
    }

    // --- Give name of a block as a string returns the mcData blocks id
    getBlock(blockName) {
        try {
            return mcData.itemsByName[blockName].id;
        } catch(e) {
            this.bot.chat(`Failed, specified block does not exist: ${blockName}`);
            console.log(`getBlock() failed, specified block does not exist: ${blockName}`);
            return null;
        }
    }

    getItem(block) {
        try {
            return new Item(block, 1);
        } catch(e) {
            console.log(e);
            return null;
        }
    }
}

module.exports = BossMazeBot;