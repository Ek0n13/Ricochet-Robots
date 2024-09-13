const globals = {
  tileArray: [],
  size: 10,
  boardSize: 16,
}



//typical board: 16x16

function setup() {
  // put setup code here
  createCanvas(windowWidth, windowHeight);
  globals.size = windowHeight / globals.boardSize

  let x, y;
  for (let i = 0; i <= globals.boardSize; i++) {
    x = i * globals.size;
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

    tile.draw(globals.size);
    tile.isInside(mouseX, mouseY);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  globals.size = windowHeight / globals.boardSize
}