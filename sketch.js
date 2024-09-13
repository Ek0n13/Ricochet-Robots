/**
 * @type {{
*  boardSize: number,
*  tiles: Array<Array<Tile>>,
*  size: number,
*  offsetWidth: number,
*  offsetHeight: number,
*  margin: number,
*  players: Array<Player>,
*  availableTiles:Array<Tile>
* }}
*/
const globals = {
   boardSize: 16,
   tiles: null,
   size: 0,
   offsetWidth: 0,
   offsetHeight: 0,
   margin: 0.2,
   players: null,
   availableTiles: [],
}

const tileClr = {
   R: 255,
   G: 255,
   B: 255,
   A: 255
}

let availableTileClr = {
   R: 100,
   G: 150,
   B: 200,
   A: 255
}


function setup() {
   // put setup code here
   createCanvas(windowWidth, window.innerHeight);
   globals.players = [
       new Player(0, 0, globals.size), // Red
       new Player(4, 6, globals.size), // Green
       new Player(4, 10, globals.size), // Blue
       new Player(5, 5, globals.size) // Yellow
   ];

   globals.players[0].clr = {
       R: 255,
       G: 0,
       B: 0,
       A: 255
   };
   globals.players[1].clr = {
       R: 0,
       G: 255,
       B: 0,
       A: 255
   };
   globals.players[2].clr = {
       R: 0,
       G: 0,
       B: 255,
       A: 255
   };
   globals.players[3].clr = {
       R: 255,
       G: 255,
       B: 0,
       A: 255
   };

   globals.tiles = loadMap();
   globals.size = calculateTileSize();

   for (let i = 0; i < globals.players.length; i++) {
       let player = globals.players[i];
       player.moveSpecific(player.i, player.j);
   }
}

function draw() {
   // put drawing code here
   background(200);
   let hoverTile = getCurrentTile();

   drawTiles(globals.tiles, tileClr);

   drawTiles(globals.availableTiles, availableTileClr);

   drawTiles(globals.players);

   drawTilesBorders(globals.tiles);
}

/**
* @param {Array<Array<Tile>> | Array<Tile>} array 
*/
function drawTiles(array, clr) {
   if (array[0] instanceof Array) {
       array.forEach((innerArray) => drawTiles(innerArray, clr))
   } else {
       array.forEach(tile => {
           clr ? tile.clr = clr : null;
           tile.draw();
       });
   }
}

function drawTilesBorders(array) {
   if (array[0] instanceof Array) {
       array.forEach((innerArray) => drawTilesBorders(innerArray));
   } else {
       array.forEach(tile => tile.drawBorders());
   }
}


/**
* @param {KeyboardEvent} event 
*/
function keyPressed(event) {
   event.preventDefault();
}

/**
* @param {PointerEvent} event 
*/
function mouseClicked(event) {
   let hoverTile = getCurrentTile();
   if (hoverTile) {
       let selectedPlayer = null;
       for (let i = 0; i < globals.players.length; i++) {
           let player = globals.players[i];
           if (player.i === hoverTile.i && player.j === hoverTile.j) {
               selectedPlayer = player;
           } else {
               player.isSelected = false;
           }
       }
       if (selectedPlayer) {
           selectedPlayer.isSelected = true;
           availableTileClr.R = selectedPlayer.clr.R;
           availableTileClr.G = selectedPlayer.clr.G;
           availableTileClr.B = selectedPlayer.clr.B;
           availableTileClr.A = 100;

           globals.availableTiles = selectedPlayer.getAvailableTiles(globals.tiles);
       } else {
           globals.availableTiles = [];
       }
   }
}

function windowResized() {
   resizeCanvas(windowWidth, window.innerHeight);
   globals.size = calculateTileSize();
}

/**
* @returns {Array<Array<Tile>>}
*/
function loadMap() {
   /** @type {Array<Array<Tile>>} */
   let temp = []
   const cols = globals.boardSize;
   const rows = globals.boardSize;
   for (let i = 0; i < cols; i++) {
       temp.push([]);
       for (let j = 0; j < rows; j++) {
           let tile = new Tile(i, j, 1);
           if (i === 0) {
               tile.sides.left = true;
           }
           if (i === cols - 1) {
               tile.sides.right = true;
           }
           if (j === 0) {
               tile.sides.top = true;
           }
           if (j === rows - 1) {
               tile.sides.bottom = true;
           }
           temp[i].push(tile);
       }
   }
   temp[7][7].sides.top = true;
   temp[7][7].sides.left = true;

   temp[7][8].sides.bottom = true;
   temp[7][8].sides.left = true;

   temp[8][7].sides.top = true;
   temp[8][7].sides.right = true;

   temp[8][8].sides.bottom = true;
   temp[8][8].sides.right = true;


   // custom tiles
   temp[9][6].sides.right = true;
   temp[10][5].sides.left = true;


   return temp;
}

/**
* @returns {number}
*/
function calculateTileSize() {
   let smallSide = Math.min(windowWidth, windowHeight);
   let length = globals.tiles.length;
   let size = smallSide / (length + globals.margin);

   globals.offsetWidth = (windowWidth / 2) - ((length * size) / 2);
   globals.offsetHeight = (windowHeight / 2) - ((length * size) / 2);

   for (let i = 0; i < globals.tiles.length; i++) {
       for (let j = 0; j < globals.tiles[i].length; j++) {
           let tile = globals.tiles[i][j];

           tile.i = i;
           tile.j = j;
           tile.size = size;
       }
   }

   for (let i = 0; i < globals.players.length; i++) {
       let player = globals.players[i];
       player.size = size;
   }

   return size;
}

/**
* @returns {Tile | null}
*/
function getCurrentTile() {
   let hoverTile = null;
   let k = Math.floor((mouseX - globals.offsetWidth) / globals.size);
   let row = globals.tiles[k];
   if (row) {
       let l = Math.floor((mouseY - globals.offsetHeight) / globals.size);
       hoverTile = row[l];
   }
   return hoverTile;
}