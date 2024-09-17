/** @typedef {{TL: Tile, TR: Tile, BR: Tile, BL: Tile}} CenterTiles */
/** @typedef {{A: Array<Tile>, B: Array<Tile>, C: Array<Tile>, D: Array<Tile>}} Quarters */

/**
* @type {{
* boardSize: number,
* tiles: Array<Array<Tile>>,
* centerTiles: CenterTiles,
* initPlayerTiles: Array<Tile>,
* size: number,
* offsetWidth: number,
* offsetHeight: number,
* margin: number,
* players: Array<Player>,
* availableTiles: Array<Tile>,
* goalTiles: Array<Tile>,
* moves: Array<String>,
* currentGoalTile: Tile,
* previousGoalTile: Tile,
* map: {{}}
* }}
*/
const globals = {
    boardSize: 16,
    tiles: [],
    centerTiles: {},
    initPlayerTiles: [],
    size: 0,
    offsetWidth: 0,
    offsetHeight: 0,
    margin: 0.2,
    players: [],
    availableTiles: [],
    goalTiles: [],
    moves: [],
    currentGoalTile: null,
    previousGoalTile: null,
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
    A: 50
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
    setGoalTile();
}

function draw() {
    // put drawing code here
    background(200);

    drawTilesDouble(globals.tiles, tileClr);
    drawTilesSingle(globals.availableTiles, availableTileClr);
    
    drawTilesSingle(globals.players);
    
    drawTilesBorders(globals.tiles);
    drawGoalTiles();

    drawText();
}

/**
* @param {KeyboardEvent} event 
*/
function keyPressed(event) {
    if (!keyIsDown(CONTROL)) {
        switch (event.key) {
            case "F5":
                event.preventDefault();
                resetPlayers();
                break;
            case "F6":
                event.preventDefault();
                setGoalTile();
                break;
            default:
                break;
        }
    }
}

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
    resizeCanvas(windowWidth, windowHeight);
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
        let tileChecker = !(
            Object.values(globals.centerTiles).includes(tile)
            || globals.initPlayerTiles.includes(tile)
            || globals.goalTiles.includes(tile)
        );
        
        if (tileChecker) {
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

/**
* @param {Array<Array<Tile>> | Array<Tile>} array 
*/
function drawTilesBorders(array) {
    if (array[0] instanceof Array) {
        array.forEach((innerArray) => drawTilesBorders(innerArray));
    } else {
        array.forEach(tile => tile.drawBorders());
    }
}

function drawGoalTiles() {
    if (globals.goalTiles.length === 0) return;
    
    globals.goalTiles.forEach(tile => {
        // let halfSize = tile.size / 2
        // let x = tile.x + halfSize;
        // let y = tile.y + halfSize;
        
        // textSize(tile.size * 0.7);
        // textAlign(CENTER, CENTER);
        // text(tile.icon, x, y);
        tile.drawIcon();

        if (tile.clrsKey) {
            assignColorsAtoB(tile.clr, clrs[tile.clrsKey]);
            tile.clr.A = 150;
        }
    });
}

function drawText() {
    let firstTile = globals.tiles[0][0];
    let tileOffset = globals.size;
    let txtOffset = globals.size * 2.25;

    let tileX = firstTile.x - tileOffset;
    let tileY = firstTile.y;
    let tileSize = firstTile.size * 0.75;
    
    let textX = firstTile.x - txtOffset;
    let textY = firstTile.y;
    let txtSize = firstTile.size * 0.5;
    

    let menuText = "";
    menuText += `\n\nMoves:\n${globals.moves.length}`;
    for (let i = 0; i < globals.moves.length; i++) {
        if (i % 2 === 0) {
            menuText += "\n"
        }
        menuText += `${globals.moves[i]}`;
    }

    globals.currentGoalTile.drawCustom(tileX, tileY, tileSize);
    globals.currentGoalTile.drawIconCustom(tileX, tileY, tileSize);
    
    fill(0);
    textSize(txtSize);
    textAlign(LEFT, TOP);
    text("Goal:", textX, tileY);
    text(menuText, textX, textY);
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

    globals.centerTiles = {
        TL: globals.tiles[7][7],
        TR: globals.tiles[8][7],
        BR: globals.tiles[8][8],
        BL: globals.tiles[7][8],
    };

    let center = globals.centerTiles;
    center.TL.sides.top = true;
    center.TL.sides.left = true;
    center.TL.clr = clrs.blueClr;
    
    center.TR.sides.top = true;
    center.TR.sides.right = true;
    center.TR.clr = clrs.yellowClr;
    
    center.BR.sides.right = true;
    center.BR.sides.bottom = true;
    center.BR.clr = clrs.greenClr;
    
    center.BL.sides.bottom = true;
    center.BL.sides.left = true;
    center.BL.clr = clrs.redClr;
}

function loadWalls() {
    Object.keys(globals.map).forEach(quarter =>{
        globals.map[quarter].forEach(object => {
            let tile = globals.tiles[object.i][object.j];

            let sides = Object.keys(object.sides);
            sides.forEach(key => {
                tile.sides[key] = object.sides[key];
            });
            if(sides.length === 2) {
                tile.icon = object.icon;
                tile.clrsKey = object.clrsKey;
                globals.goalTiles.push(tile)
            };
        });
    });
}

function loadPlayers() {
    let quarters = availablePlayerPositions();

    let availablePositionsA = quarters.A.filter(tile => Object.values(tile.sides).every(side => !side));
    let availablePositionsB = quarters.B.filter(tile => Object.values(tile.sides).every(side => !side));
    let availablePositionsC = quarters.C.filter(tile => Object.values(tile.sides).every(side => !side));
    let availablePositionsD = quarters.D.filter(tile => Object.values(tile.sides).every(side => !side));

    let randomTileA = availablePositionsA[Math.floor(Math.random() * availablePositionsA.length)];
    let randomTileB = availablePositionsB[Math.floor(Math.random() * availablePositionsB.length)];
    let randomTileC = availablePositionsC[Math.floor(Math.random() * availablePositionsC.length)];
    let randomTileD = availablePositionsD[Math.floor(Math.random() * availablePositionsD.length)];

    globals.players = [
        new Player(randomTileA.i, randomTileA.j, clrs.blueClr),
        new Player(randomTileB.i, randomTileB.j, clrs.yellowClr),
        new Player(randomTileC.i, randomTileC.j, clrs.greenClr),
        new Player(randomTileD.i, randomTileD.j, clrs.redClr),
    ];

    globals.players.forEach(player => {
        let tile = globals.tiles[player.i][player.j];
        tile.clr = player.clr;
        tile.hasPlayer = true;
        globals.initPlayerTiles.push(tile);
    });
    
}

function calculateTileSize() {
    let smallSide = Math.min(windowWidth, windowHeight);
    let length = globals.tiles.length;
    
    globals.size = smallSide / (length + globals.margin + 3);

    globals.offsetWidth = 20 + (windowWidth / 2) - ((length * globals.size) / 2);
    globals.offsetHeight = (windowHeight / 2) - ((length * globals.size) / 2);

    for (let i = 0; i < globals.tiles.length; i++) {
        for (let j = 0; j < globals.tiles[i].length; j++) {
            let tile = globals.tiles[i][j];

            tile.i = i;
            tile.j = j;
            tile.size = globals.size;
        }
    }

    globals.players.forEach(player => player.size = globals.size);
    globals.goalTiles.forEach(tile => tile.size = globals.size);
}

/**
 * @returns {Quarters}
*/
function availablePlayerPositions() {
    let cols = globals.boardSize;
    let rows = globals.boardSize;

    /** @type {Quarters} temp */
    let temp = {
        A: [],
        B: [],
        C: [],
        D: [],
    };

    for (let i = 1; i < cols - 1; i++) {
        for (let j = 1; j < rows - 1; j++) {
            let tile = globals.tiles[i][j];

            if (Object.values(globals.centerTiles).includes(tile)) continue;

            if (tile.i < globals.centerTiles.TL.i && tile.j < globals.centerTiles.TL.j) {
                temp.A.push(tile)
            } else if (tile.i > globals.centerTiles.TR.i && tile.j < globals.centerTiles.TR.j) {
                temp.B.push(tile)
            } else if (tile.i > globals.centerTiles.BR.i && tile.j > globals.centerTiles.BR.j) {
                temp.C.push(tile)
            } else if (tile.i < globals.centerTiles.BL.i && tile.j > globals.centerTiles.BL.j) {
                temp.D.push(tile)
            }
        }
    }

    return temp;
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
}

function resetPlayers() {
    globals.players.forEach(player => {
        let initTile = globals.initPlayerTiles.find(tile => tile.clr === player.clr);
        
        globals.tiles[player.i][player.j].hasPlayer = false;

        player.i = initTile.i;
        player.j = initTile.j;

        globals.tiles[player.i][player.j].hasPlayer = true;
    });

    globals.moves = [];
}

/**
 * 
 * @param {{R, G, B, A}} colorA 
 * @param {{R, G, B, A}} colorB 
 */
function assignColorsAtoB(colorA, colorB) {
    colorA.R = colorB.R;
    colorA.G = colorB.G;
    colorA.B = colorB.B;
    colorA.A = colorB.A;
}

/**
 * 
 * @param {{R, G, B, A}} colorA 
 * @param {{R, G, B, A}} colorB 
 * @returns {Boolean}
 */
function compareColorsRGB(colorA, colorB) {
    return (
        colorA.R === colorB.R &&
        colorA.G === colorB.G &&
        colorA.B === colorB.B
    );
}

/**
 * 
 * @param {Tile} tileA 
 * @param {Tile} tileB 
 * @returns {Boolean}
 */
function compareGoalTiles(tileA, tileB) {
    return (
        compareColorsRGB(tileA.clr, tileB.clr) &&
        tileA.icon === tileB.icon
    );
}

function setGoalTile() {
    globals.currentGoalTile = globals.goalTiles[Math.floor(Math.random() * globals.goalTiles.length)];
    if (globals.previousGoalTile) {
        if (compareGoalTiles(globals.currentGoalTile, globals.previousGoalTile)) {
            setGoalTile();
        }
    }
    globals.previousGoalTile = globals.currentGoalTile;
}
