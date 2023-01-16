<h1 align="center">Welcome to Random Maze Builder 👋</h1>
<p>
  <a href="#" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
  </a>
</p>

> Bots that build randomly generated mazes in Minecraft Creative Mode. Created using Javascript (Node) and the Mineflayer library.  
Inspired by https://www.youtube.com/watch?v=YRakYOglAvY&t=103s

![2023-01-15_22 12 49](https://user-images.githubusercontent.com/85015271/212610153-64c20584-d00b-4fcb-86da-92753b97522f.png)

## Install

Clone this repository and run
```sh
npm install
```

## Usage

1. Update ``config.json``. An example of one is in the examples folder.
2. In the terminal, run
```sh
node index.js
```
This will spawn the single bot ``BossMazeBot`` that listens to your commands. The ``BuilderMazeBot(s)`` the bot(s) that will actually build the maze spawn when you run a command.  
3. Create a flat land for the maze. Position the ``BossMazeBot`` on the ground at the northwest corner of where you want the maze to be built.  
4. Run the command to build the maze of height (z-axis in Minecraft) H and width (x-axis in Minecraft) W. 
```sh
buildMaze H W
```
#### Example
```sh
buildMaze 17 17
```

#### Optional argument 
The default block used to build the maze is ``oak_leaves``, but an optional argument can be used to specify the block used.  
Example 
```sh
buildMaze 17 17 stone
```

#### Recommended usage
It is recommended to use odd numbers for the height and width. When even numbers are used, the edges are padded, creating unpleasant mazes such as below.
```sh
buildMaze 16 17
```
![2023-01-15_21 57 12](https://user-images.githubusercontent.com/85015271/212608750-201e015a-0b19-4d41-9652-1fb505c2e4bf.png)

## Author

👤 **TakumiXD**

* Github: [@TakumiXD](https://github.com/TakumiXD)

Give a ⭐️ if this project helped you!

***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_


