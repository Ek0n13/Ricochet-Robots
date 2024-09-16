// import { mapQuarters } from "./mapQuarters.json" assert { type: "json" };

/**
* @type {{
* boardSize: number,
* tiles: Array<Array<Tile>>,
* centerTiles: Array<Tile>,
* size: number,
* offsetWidth: number,
* offsetHeight: number,
* margin: number,
* players: Array<Player>,
* availableTiles:Array<Tile>,
* map: Object
* }}
*/
const globals = {
    boardSize: 16,
    tiles: [],
    centerTiles: [],
    size: 0,
    offsetWidth: 0,
    offsetHeight: 0,
    margin: 0.2,
    players: [],
    availableTiles: [],
    map: {},
};

const tileClr = {
    R: 255,
    G: 255,
    B: 255,
    A: 255
};

const availableTileClr = {
    R: 0,
    G: 0,
    B: 0,
    A: 80
};

const clrs = {
    redClr: {
        R: 255,
        G: 0,
        B: 0,
        A: 255
    },
    greenClr: {
        R: 0,
        G: 255,
        B: 0,
        A: 255
    },
    blueClr: {
        R: 0,
        G: 0,
        B: 255,
        A: 255
    },
    yellowClr: {
        R: 255,
        G: 255,
        B: 0,
        A: 255
    },
};

function preload() {
    globals.map = loadJSON("./mapQuarters.json");
}

function setup() {
    // put setup code here
    // frameRate(1);

    createCanvas(windowWidth, window.innerHeight);
    
    globals.map = globals.map[0]
    loadMap();
    loadWalls();
    loadPlayers();
    calculateTileSize();
}

function draw() {
    // put drawing code here
    background(200);

    drawTilesDouble(globals.tiles, tileClr);
    drawTilesSingle(globals.availableTiles, availableTileClr);
    drawTilesSingle(globals.players);
    drawTilesBorders(globals.tiles);
}

// /**
// * @param {KeyboardEvent} event 
// */
// function keyPressed(event) {
//     event.preventDefault();
// }

/**
* @param {PointerEvent} event 
*/
function mouseClicked(event) {
    let clickedTile = getCurrentTile();
    if (clickedTile) {
        if (globals.availableTiles.includes(clickedTile)) {
            let selectedPlayer = globals.players.find(x => x.isSelected);
            if (selectedPlayer) {
                selectedPlayer.move(clickedTile);
            }
        }

        setSelectedPlayer(clickedTile);
        let selectedPlayer = getSelectedPlayer();

        if (selectedPlayer) {
            selectedPlayer.isSelected = true;
            availableTileClr.R = selectedPlayer.clr.R;
            availableTileClr.G = selectedPlayer.clr.G;
            availableTileClr.B = selectedPlayer.clr.B;

            globals.availableTiles = selectedPlayer.getAvailableTiles(globals.tiles);
        } else {
            globals.availableTiles = [];
        }
    }
}

function windowResized() {
    resizeCanvas(windowWidth, window.innerHeight);
    calculateTileSize();
}

/**
* @param {Array<Tile>} array 
*/
function drawTilesSingle(array, clr) {
    let selectedPlayer = getSelectedPlayer();
    if (selectedPlayer) {
        availableTileClr.R = selectedPlayer.clr.R;
        availableTileClr.G = selectedPlayer.clr.G;
        availableTileClr.B = selectedPlayer.clr.B;
    }

    array.forEach((tile) => {
        if (globals.availableTiles.includes(tile) ||
            !globals.centerTiles.includes(tile)) {
            clr ? tile.clr = clr : null;
        }

        tile.draw();
        
        // fill(255, 0 , 0)
        // text(`${tile.i} ${tile.j}`, tile.x, tile.y+15)
    });
}

/**
* @param {Array<Array<Tile>>} array 
*/
function drawTilesDouble(array, clr) {
    array.forEach((innerArray) => drawTilesSingle(innerArray, clr))
}

function drawTilesBorders(array) {
    if (array[0] instanceof Array) {
        array.forEach((innerArray) => drawTilesBorders(innerArray));
    } else {
        array.forEach(tile => tile.drawBorders());
    }
}

/**
* @returns {Array<Array<Tile>>}
*/
function loadMap() {
    const cols = globals.boardSize;
    const rows = globals.boardSize;

    for (let i = 0; i < cols; i++) {
        globals.tiles.push([]);
        for (let j = 0; j < rows; j++) {
            let tile = new Tile(i, j, 1);
            if (i === 0) tile.sides.left = true;
            if (j === 0) tile.sides.top = true;
            if (i === cols - 1) tile.sides.right = true;
            if (j === rows - 1) tile.sides.bottom = true;
            
            globals.tiles[i].push(tile);
        }
    }

    let center = {
        TL: globals.tiles[7][7],
        TR: globals.tiles[8][7],
        BR: globals.tiles[8][8],
        BL: globals.tiles[7][8],
    };

    center.TL.sides.top = true;
    center.TL.sides.left = true;
    center.TL.clr = clrs.blueClr;
    globals.centerTiles.push(center.TL);
    
    center.TR.sides.top = true;
    center.TR.sides.right = true;
    center.TR.clr = clrs.yellowClr;
    globals.centerTiles.push(center.TR);
    
    center.BR.sides.right = true;
    center.BR.sides.bottom = true;
    center.BR.clr = clrs.greenClr;
    globals.centerTiles.push(center.BR);
    
    center.BL.sides.bottom = true;
    center.BL.sides.left = true;
    center.BL.clr = clrs.redClr;
    globals.centerTiles.push(center.BL);
}

function loadWalls() {
    Object.keys(globals.map).forEach(quarter =>{
        globals.map[quarter].forEach(object => {
            let tile = globals.tiles[object.i][object.j];
            Object.keys(object.sides).forEach(key => {
                tile.sides[key] = object.sides[key];
            });
        });
    });
}

function loadPlayers() {
    globals.players = [
        new Player( 3,  2, clrs.blueClr),
        new Player(12,  4, clrs.yellowClr),
        new Player(11, 11, clrs.greenClr),
        new Player( 2, 12, clrs.redClr),
    ];

    globals.players.forEach(player => {
        globals.tiles[player.i][player.j].hasPlayer = true;
    });
}

/**
* @returns {number}
*/
function calculateTileSize() {
    let smallSide = Math.min(windowWidth, windowHeight);
    let length = globals.tiles.length;
    
    globals.size = smallSide / (length + globals.margin);

    globals.offsetWidth = (windowWidth / 2) - ((length * globals.size) / 2);
    globals.offsetHeight = (windowHeight / 2) - ((length * globals.size) / 2);

    for (let i = 0; i < globals.tiles.length; i++) {
        for (let j = 0; j < globals.tiles[i].length; j++) {
            let tile = globals.tiles[i][j];

            tile.i = i;
            tile.j = j;
            tile.size = globals.size;
        }
    }

    for (let i = 0; i < globals.players.length; i++) {
        let player = globals.players[i];
        player.size = globals.size;
    }
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

/**
* @returns {Tile | null}
*/
function getSelectedPlayer() {
    return globals.players.find(player => player.isSelected)
}

/**
* @param {Tile} clickedTile
*/
function setSelectedPlayer(clickedTile) {
    globals.players.forEach(player => {
        if (player.i === clickedTile.i && player.j === clickedTile.j) {
            player.isSelected = !player.isSelected;
        } else {
            player.isSelected = false;
        }
    });

    // for (let i = 0; i < globals.players.length; i++) {
    //     let player = globals.players[i];
    //     if (player.i === clickedTile.i && player.j === clickedTile.j) {
    //         player.isSelected = true;
    //     } else {
    //         player.isSelected = false;
    //     }
    // }
}
