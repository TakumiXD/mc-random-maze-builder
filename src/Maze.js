const { Stack } = require("js-sdsl");

const offsets = [[-2, 0], [0, 2], [2, 0], [0, -2]];

// helper function
function make2DArray(height, width, val) {
    let res = []
    for (var i = 0; i < height; ++i) {
        res[i] = [];
        for(var j = 0; j < width; ++j) {
            res[i][j] = val;
        }
    }
    return res;
}

// Functions used to create a maze shape
const Maze = {
    areValidArguments: function (height, width) {
        return height > 0 && width > 0;
    },
    // Creates a random maze of specified height and width and returns it as a 2D array 
    // of boolean where "true" indicates the walls and "false" indicates the non-walls/path
    // Algorithm used: randomized DFS that traverses two indices at a time
    makeRandomMaze: function (height, width) {
        let maze = make2DArray(height, width, true);
        let visited = new Set();
        let stack = new Stack([]);
        // base case, start a path at [1,1]
        stack.push([1,1]);
        visited.add(JSON.stringify([1, 1]));
        maze[1][1] = false;
        let numOfVisitableBlocks = Math.round((height - 2) / 2) * Math.round((width - 2) / 2);
        // maze algorithm
        while (visited.size < numOfVisitableBlocks) {
            // compute the visitable neighbors of the top element of the stack
            let topElem = stack.top();
            let neighbors = []
            let topY = topElem[0];
            let topX = topElem[1];
            for (var i = 0; i < 4; ++i) {
                let [offsetY, offsetX] = offsets[i];
                let newY = topY + offsetY;
                let newX = topX + offsetX;
                if (visited.has(JSON.stringify([newY, newX]))) {
                    continue;
                }
                switch(i) {
                    case 0:
                        if (newY > 0) neighbors.push(0);
                        break;
                    case 1:
                        if (newX < width) neighbors.push(1);
                        break;
                    case 2:
                        if (newY < height) neighbors.push(2);
                        break;
                    case 3:
                        if (newX > 0) neighbors.push(3);
                        break;
                }
            }

            // randomly pick a visitable neighbor, add it to visited, push it to the stack and
            // change the path to the neighbor and neighbor index to false.
            if (neighbors.length > 0) {
                let nextDirection = neighbors[Math.floor(Math.random() * neighbors.length)];
                let [offsetY, offsetX] = offsets[nextDirection];
                let newY = topY + offsetY;
                let newX = topX + offsetX;
                let newPosition = [newY, newX];
                stack.push(newPosition);
                visited.add(JSON.stringify(newPosition));
                maze[newY][newX] = false;
                switch(nextDirection) {
                    case 0:
                        maze[topY - 1][topX] = false;
                        break;
                    case 1:
                        maze[topY][topX + 1] = false;
                        break;
                    case 2:
                        maze[topY + 1][topX] = false;
                        break;
                    case 3:
                        maze[topY][topX - 1] = false;
                        break;
                }
            }
            // if none of the neighbors are visitable, pop the stack
            else {
                stack.pop();
            }

        }
        // finish the maze by creating entrance and exit
        maze[0][1] = false;
        maze[height - 1][width - 2] = false;
        return maze;
    }
}

module.exports = Maze;