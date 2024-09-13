class Tile {
  constructor(x, y, size, clr) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.clr = clr;
    this.inside = false;

    this.top = false;
    this.right = false;
    this.bottom = false;
    this.left = false;
  }

  draw(size, offset) {
    if (this.inside)
      fill(255, 0, 0);
    else
      fill(this.clr);
      
    this.x = (this.x / this.size) * size;
    
    // this moves the entire board :thinking_emoji
    // this.x = offset + ((this.x / this.size) * size);
    
    this.y = (this.y / this.size) * size;
    this.size = size;
    rect(this.x, this.y, this.size, this.size);
  }

  isInside(mouseX, mouseY) {
    let minX = this.x;
    let minY = this.y;
    let maxX = this.x + this.size;
    let maxY = this.y + this.size;
    
    let minCondition = mouseX > minX && mouseY > minY;
    let maxCondition = mouseX < maxX && mouseY < maxY;
    if (minCondition && maxCondition)
      this.inside = true;
    else
      this.inside = false;
  }
}