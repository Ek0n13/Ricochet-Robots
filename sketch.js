/** @typedef {{TL: Tile, TR: Tile, BR: Tile, BL: Tile}} CenterTiles */
/** @typedef {{A: Array<Tile>, B: Array<Tile>, C: Array<Tile>, D: Array<Tile>}} Quarters */

/**
 * @typedef {{
 *  i: number,
 *  j: number,
 *  sides: {
 *      top: boolean,
 *      right: boolean,
 *      bottom: boolean,
 *      left: boolean
 *  },
 *  icon: String,
 *  clrsKey: String
 * }} Walls
 */

/**
* @type {{
*   boardSize: number,
*   tiles: Array<Array<Tile>>,
*   centerTiles: CenterTiles,
*   initPlayerTiles: Array<Tile>,
*   size: number,
*   offsetWidth: number,
*   offsetHeight: number,
*   margin: number,
*   players: Array<Player>,
*   availableTiles: Array<Tile>,
*   goalTiles: Array<Tile>,
*   moves: Array<String>,
*   currentGoalTile: Tile,
*   previousGoalTile: Tile,
*   mapStatic: {},
*   mapJson: Array<{clrsKey: String, walls: Array<Walls>}>,
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
    mapStatic: {},
    mapJson: [],
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
    globals.mapStatic = loadJSON("./mapQuartersStatic.json");
    globals.mapJson = loadJSON("./mapQuarters.json");
}

function setup() {
    // put setup code here
    createCanvas(windowWidth, window.innerHeight);
    
    globals.mapStatic = globals.mapStatic[0]
    loadMap();
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
                if (confirm("Reload page?")) {
                    location.reload();
                }
                break;
            case "F6":
                event.preventDefault();
                resetPlayers();
                break;
            case "F7":
                event.preventDefault();
                setGoalTile();
                break;
            case "F8":
                event.preventDefault();
                refreshPlayers();
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
        tile.drawIcon();

        if (tile.clrsKey) {
            assignColorsBtoA(tile.clr, clrs[tile.clrsKey]);
            tile.clr.A = 150;
        }
    });
}

function drawText() {
    let firstTile = globals.tiles[0][0];
    let tileOffset = globals.size;
    let txtOffset = globals.size * 1.85;

    let tileX = firstTile.x;
    let tileXoff = firstTile.x + tileOffset * 1.4;
    let tileY = firstTile.y;
    let tileYoff = firstTile.y - tileOffset;
    let tileSize = firstTile.size * 0.75;
    
    let textX = firstTile.x;
    let textXoff = firstTile.x - txtOffset;
    let textY = firstTile.y;
    let textYoff = firstTile.y - txtOffset;
    let txtSize = firstTile.size * 0.5;
    

    let menuText = "";
    menuText += `Moves:\n${globals.moves.length}`;
    for (let i = 0; i < globals.moves.length; i++) {
        if (i % 2 === 0) {
            menuText += "\n"
        }
        menuText += `${globals.moves[i]}`;
    }

    globals.currentGoalTile.drawCustom(tileXoff, tileYoff, tileSize);
    globals.currentGoalTile.drawIconCustom(tileXoff, tileYoff, tileSize);
    
    fill(0);
    textSize(txtSize);
    textAlign(LEFT, BOTTOM);
    text("Goal:", textX, tileY * 0.9);
    textAlign(LEFT, TOP);
    text(menuText, textXoff, textY);
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
            let tile = new Tile(i, j);

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
    
    center.TR.sides.top = true;
    center.TR.sides.right = true;
    
    center.BR.sides.right = true;
    center.BR.sides.bottom = true;
    
    center.BL.sides.bottom = true;
    center.BL.sides.left = true;

    // loadWalls();
    loadWallsDynamic();
    
    // loadPlayers();
    loadPlayersDynamic();
    
    calculateTileSize();
    setGoalTile();
}

function loadWalls() {
    Object.keys(globals.mapStatic).forEach(quarter =>{
        globals.mapStatic[quarter].forEach(object => {
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

function loadWallsDynamic() {
    // let loadedQuarterIndexes = [];

    /** @type {Array<String>} */
    let loadedQuarterColorKeys = [];

    let jsonLength =  Object.keys(globals.mapJson).length;
    for (let q = 0; q < 4; q++) {
        let quarterIndex = Math.floor(Math.random() * jsonLength);
        let quarter = globals.mapJson[quarterIndex];

        // if (loadedQuarterIndexes.includes(quarterIndex)) {
        //     q--;
        //     continue;
        // }
        if (loadedQuarterColorKeys.includes(quarter.clrsKey)) {
            q--;
            continue;
        }

        quarter.walls.forEach(wall => {
            if (q > 0) rotateWall(wall, q);

            let tile = globals.tiles[wall.i][wall.j];
            let sides = Object.keys(wall.sides);
            sides.forEach(key => {
                tile.sides[key] = wall.sides[key];
            });
            if (sides.length > 1) {
                tile.icon = wall.icon;
                tile.clrsKey = wall.clrsKey;
                globals.goalTiles.push(tile);
            }

            let centerTileKeys = Object.keys(globals.centerTiles);
            /** @type {Tile} */
            let centerTile = globals.centerTiles[centerTileKeys[q]];
            assignColorsBtoA(centerTile.clr, clrs[quarter.clrsKey]);
        });

        // loadedQuarterIndexes.push(quarterIndex);
        loadedQuarterColorKeys.push(quarter.clrsKey);
    }
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

function loadPlayersDynamic() {
    let quarters = availablePlayerPositions();
    let quarterKeys = Object.keys(quarters);
    shuffle(quarterKeys, true);

    for (let p = 0; p < 4; p++) {
        /** @type {Array<Tile>} */
        let quarter = quarters[quarterKeys[p]];

        let availablePositions = quarter.filter(tile => Object.values(tile.sides).every(side => !side));
        let randomTile = availablePositions[Math.floor(Math.random() * availablePositions.length)]
        
        let playerClr;
        if (randomTile.i < globals.centerTiles.TL.i && randomTile.j < globals.centerTiles.TL.j) {
            playerClr = globals.centerTiles.TL.clr;
        } else if (randomTile.i > globals.centerTiles.TR.i && randomTile.j < globals.centerTiles.TR.j) {
            playerClr = globals.centerTiles.TR.clr;
        } else if (randomTile.i > globals.centerTiles.BR.i && randomTile.j > globals.centerTiles.BR.j) {
            playerClr = globals.centerTiles.BR.clr;
        } else if (randomTile.i < globals.centerTiles.BL.i && randomTile.j > globals.centerTiles.BL.j) {
            playerClr = globals.centerTiles.BL.clr;
        }

        let player = new Player(randomTile.i, randomTile.j, playerClr);
        globals.players.push(player);

        let playerTile = globals.tiles[player.i][player.j];
        playerTile.clr = playerClr;
        playerTile.hasPlayer = true;
        globals.initPlayerTiles.push(playerTile);
    }
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

    /** @type {Quarters} */
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

// ===== SET / RESET FUNCS =====

// KeyPress: F6
function resetPlayers() {
    globals.players.forEach(player => {
        let initTile = globals.initPlayerTiles.find(tile => compareColorsRGB(tile.clr, player.clr));
        
        globals.tiles[player.i][player.j].hasPlayer = false;

        player.i = initTile.i;
        player.j = initTile.j;

        globals.tiles[player.i][player.j].hasPlayer = true;

        player.isSelected = false;
    });

    globals.availableTiles = [];
    globals.moves = [];
}

// KeyPress: F7
function setGoalTile() {
    globals.currentGoalTile = globals.goalTiles[Math.floor(Math.random() * globals.goalTiles.length)];
    if (globals.previousGoalTile) {
        if (compareGoalTiles(globals.currentGoalTile, globals.previousGoalTile)) {
            setGoalTile();
        }
    }
    globals.previousGoalTile = globals.currentGoalTile;
}

// KeyPress: F8
function refreshPlayers() {
    let quarters = availablePlayerPositions();
    let quarterKeys = Object.keys(quarters);

    globals.players = [];
    globals.initPlayerTiles.forEach(tile =>  {
        tile.clr = tileClr;
        tile.hasPlayer = false;
    })
    globals.initPlayerTiles = [];

    for (let p = 0; p < 4; p++) {
        let quarter = quarters[quarterKeys[p]];

        let availablePositions = quarter.filter(tile => Object.values(tile.sides).every(side => !side));
        let randomTile = availablePositions[Math.floor(Math.random() * availablePositions.length)]

        let playerClr;
        if (randomTile.i < globals.centerTiles.TL.i && randomTile.j < globals.centerTiles.TL.j) {
            playerClr = globals.centerTiles.TL.clr;
        } else if (randomTile.i > globals.centerTiles.TR.i && randomTile.j < globals.centerTiles.TR.j) {
            playerClr = globals.centerTiles.TR.clr;
        } else if (randomTile.i > globals.centerTiles.BR.i && randomTile.j > globals.centerTiles.BR.j) {
            playerClr = globals.centerTiles.BR.clr;
        } else if (randomTile.i < globals.centerTiles.BL.i && randomTile.j > globals.centerTiles.BL.j) {
            playerClr = globals.centerTiles.BL.clr;
        }

        let newPlayer = new Player(randomTile.i, randomTile.j, playerClr);
        globals.players.push(newPlayer);

        let playerTile = globals.tiles[randomTile.i][randomTile.j];
        playerTile.clr = playerClr;
        playerTile.hasPlayer = true;
        globals.initPlayerTiles.push(playerTile);
    }

    calculateTileSize();
    resetPlayers();
}

// ===== SET / RESET FUNCS =====

/**
 * 
 * @param {{R, G, B, A}} colorA 
 * @param {{R, G, B, A}} colorB 
 */
function assignColorsBtoA(colorA, colorB) {
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

// ===== JSON WALL ROTATIONS =====

/**
 * @param {Walls} wall
 * @param {number} noOfTimes
 */
function rotateWall(wall, noOfTimes) {
    if (noOfTimes < 1 || noOfTimes > 3) return;

    rotatePosition(wall, noOfTimes);
    
    let noOfSides = Object.keys(wall.sides).length;
    if (noOfSides === 1) {
        rotateSingleWalls(wall, noOfTimes);
    } else {
        rotateCorners(wall, noOfTimes);
    }
    
}

/**
 * @param {Walls} wall
 * @param {number} noOfTimes
 */
function rotatePosition(wall, noOfTimes) {
    let i = wall.i;
    let j = wall.j;
    let maxIorJ = globals.boardSize - 1;

    switch (noOfTimes) {
        case 1:
            wall.i = maxIorJ - j;
            wall.j = i;
            break;
        case 2:
            wall.i = maxIorJ - i;
            wall.j = maxIorJ - j;
            break;
        case 3:
            wall.i = j;
            wall.j = maxIorJ - i;
            break;
        default:
            break;
    }
}

/**
 * @param {Walls} wall
 * @param {number} noOfTimes
 */
function rotateCorners(wall, noOfTimes) {
    let TR = wall.sides.top && wall.sides.right;
    let RB = wall.sides.right && wall.sides.bottom;
    let BL = wall.sides.bottom && wall.sides.left;
    let LT = wall.sides.left && wall.sides.top;

    if (noOfTimes === 1) { // one rotation; quarter B
        if (TR) {
            wall.sides.top = false;
            wall.sides.bottom = true;
        } else if (BL) {
            wall.sides.bottom = false;
            wall.sides.top = true;
        } else if (RB || LT) {
            wall.sides.right = false;
            wall.sides.left = true;
        }
    } else if (noOfTimes === 2) { // two rotations; quarter C
        if (TR) {
            wall.sides.top = false;
            wall.sides.right = false;
            wall.sides.bottom = true;
            wall.sides.left = true;
        } else if (RB) {
            wall.sides.right = false;
            wall.sides.bottom = false;
            wall.sides.left = true;
            wall.sides.top = true;
        } else if (BL) {
            wall.sides.bottom = false;
            wall.sides.left = false;
            wall.sides.top = true;
            wall.sides.right = true;
        } else if (LT) {
            wall.sides.left = false;
            wall.sides.top = false;
            wall.sides.right = true;
            wall.sides.bottom = true;
        }
    } else if (noOfTimes === 3) { // three rotations; quarter D
        if (TR) {
            wall.sides.right = false;
            wall.sides.left = true;
        } else if (RB) {
            wall.sides.bottom = false;
            wall.sides.top = true;
        } else if (BL || LT) {
            wall.sides.left = false;
            wall.sides.right = true;
        }
    }
}

/**
 * @param {Walls} wall
 * @param {number} noOfTimes
 */
function rotateSingleWalls(wall, noOfTimes) {
    if (noOfTimes === 1) {
        if (wall.sides.top) {
            delete wall.sides.top;
            wall.sides.right = true;
        } else if (wall.sides.right) {
            delete wall.sides.right;
            wall.sides.bottom = true;
        } else if (wall.sides.bottom) {
            delete wall.sides.bottom;
            wall.sides.left = true;
        } else if (wall.sides.left) {
            delete wall.sides.left;
            wall.sides.top = true;
        }
    } else if (noOfTimes === 2) {
        if (wall.sides.top) {
            delete wall.sides.top;
            wall.sides.bottom = true;
        } else if (wall.sides.right) {
            delete wall.sides.right;
            wall.sides.left = true;
        } else if (wall.sides.bottom) {
            delete wall.sides.bottom;
            wall.sides.top = true;
        } else if (wall.sides.left) {
            delete wall.sides.left;
            wall.sides.right = true;
        }
    } else if (noOfTimes === 3) {
        if (wall.sides.top) {
            delete wall.sides.top;
            wall.sides.left = true;
        } else if (wall.sides.right) {
            delete wall.sides.right;
            wall.sides.top = true;
        } else if (wall.sides.bottom) {
            delete wall.sides.bottom;
            wall.sides.right = true;
        } else if (wall.sides.left) {
            delete wall.sides.left;
            wall.sides.bottom = true;
        }
    }
}

// ===== JSON WALL ROTATIONS =====
