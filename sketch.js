const globals = {
  tileArray: [],
  size: 100,
}
function setup() {
  // put setup code here
  createCanvas(windowWidth, windowHeight);
  
  let x, y;
  for (let i = 0; i <= 5; i++) {
    x = i * globals.size;
    for (let j = 0; j <= 5; j++) {
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

    tile.draw();
    tile.isInside(mouseX, mouseY);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}