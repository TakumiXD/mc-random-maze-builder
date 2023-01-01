const { Stack } = require("js-sdsl");

const offsets = [[-2, 0], [0, 2], [2, 0], [0, -2]];

const Maze = {
    areValidArguments: function (height, width) {
        return height > 0 && width > 0;
    },
    makeMaze: function (height, width) {
        let maze = make2DArray(height, width, true);
        let visited = new Set();
        let stack = new Stack([]);
        // base case
        stack.push([1,1]);
        visited.add(JSON.stringify([1, 1]));
        maze[1][1] = false;
        let numOfVisitableBlocks = Math.round((height - 2) / 2) * Math.round((width - 2) / 2);
        // maze algorithm
        while (visited.size < numOfVisitableBlocks) {
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
            else {
                stack.pop();
            }

        }
        maze[0][1] = false;
        maze[height - 1][width - 2] = false;
        return maze;
    },
    make2DArray: function (height, width, val) {
        let res = []
        for (var i = 0; i < height; ++i) {
            res[i] = [];
            for(var j = 0; j < width; ++j) {
                res[i][j] = val;
            }
        }
        return res;
    }
}

module.exports = Maze;