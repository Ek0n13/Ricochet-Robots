const globals = {
  tileArray: [],
  size: 10,
  boardSize: 16,
  offset: 10,
}

//typical board: 16x16

function setup() {
  // put setup code here
  createCanvas(windowWidth, windowHeight);
  globals.size = windowHeight / globals.boardSize
  globals.offset = calcOffset();

  let x, y;
  for (let i = 0; i <= globals.boardSize; i++) {
    x = globals.offset + (i * globals.size);
    console.log(globals.offset);
    console.log(x);
    globals.tileArray.push(new Tile(x, y, globals.size, 255))
    for (let j = 0; j <= globals.boardSize; j++) {
      y = j * globals.size;
      globals.tileArray.push(new Tile(x, y, globals.size, 255));
    }
  }
}

function draw() {
  // put drawing code here
  background(200);
  for (let i = 0; i < globals.tileArray.length; i++) {
    let tile = globals.tileArray[i];

    tile.isInside(mouseX, mouseY);
    tile.draw(globals.size, globals.offset);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  globals.size = windowHeight / globals.boardSize
  globals.offset = calcOffset()
}

function calcOffset() {
  return (windowWidth / 2) - (globals.boardSize * globals.size)
}