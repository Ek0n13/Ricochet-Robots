class Player extends Tile {
  #scaleSize = 0.85;

  constructor(i, j, clr) {
      super(i, j, globals.size);

      this.clr = clr;

      this.width = globals.size * this.#scaleSize;
      this.isSelected = false;
  }

  draw() {
      this.width = globals.size * this.#scaleSize;
      fill(this.clr.R, this.clr.G, this.clr.B, this.clr.A);
      strokeWeight(2)
      ellipse(this.x + this.size / 2, this.y + this.size / 2, this.width);
  }

  /**
   * @param {Array<Array<Tile>>} board
   * @returns {Array<Tile>}
   */
  getAvailableTiles(board) {
      let temp = [];

      //top
      let prevTile = null;
      for (let j = this.j; j >= 0; j--) {
          const tile = board[this.i][j];
          if (!prevTile) {
              prevTile = tile;
              continue;
          }
          if (!prevTile.canExit(Direction.Top) || !tile.canEnter(Direction.Top)) {
              break;
          }
          temp.push(tile);
          prevTile = tile;
      }

      //right
      prevTile = null;
      for (let i = this.i; i < board.length; i++) {
          const tile = board[i][this.j];
          if (!prevTile) {
              prevTile = tile;
              continue;
          }
          if (!prevTile.canExit(Direction.Right) || !tile.canEnter(Direction.Right)) {
              break;
          }
          temp.push(tile);
          prevTile = tile;
      }

      //bottom
      prevTile = null;
      for (let j = this.j; j < board.length; j++) {
          const tile = board[this.i][j];
          if (!prevTile) {
              prevTile = tile;
              continue;
          }
          if (!prevTile.canExit(Direction.Bottom) || !tile.canEnter(Direction.Bottom)) {
              break;
          }
          temp.push(tile);
          prevTile = tile;
      }

      //left
      prevTile = null;
      for (let i = this.i; i >= 0; i--) {
          const tile = board[i][this.j];
          if (!prevTile) {
              prevTile = tile;
              continue;
          }
          if (!prevTile.canExit(Direction.Left) || !tile.canEnter(Direction.Left)) {
              break;
          }
          temp.push(tile);
          prevTile = tile;
      }

      return temp;
  }

  /**
   * @param {Tile} tile 
   */
  move(tile) {
      let targetI = this.i;
      let targetJ = this.j;

      if (this.i === tile.i) {
          if (this.j < tile.j) {
              targetJ = Math.max(...globals.availableTiles.map(x => x.j));
          } else if (this.j > tile.j) {
              targetJ = Math.min(...globals.availableTiles.map(x => x.j));
          }
      } else if (this.j === tile.j) {
          if (this.i < tile.i) {
              targetI = Math.max(...globals.availableTiles.map(x => x.i));
          } else if (this.i > tile.i) {
              targetI = Math.min(...globals.availableTiles.map(x => x.i));
          }
      }

      this.moveSpecific(targetI, targetJ);
  }

  moveSpecific(i, j) {
      let ease = 0.2;
      let delay = 10;

      globals.tiles[this.i][this.j].hasPlayer = false;
      
      if (this.j === j) {
          let idI = setInterval(() => {
              let sign = Math.sign(i - this.i);
              this.i += ease * sign;
              if (sign > 0 && this.i > i) {
                  this.i = i;
                  clearInterval(idI);
              } else if (sign < 0 && this.i < i) {
                  this.i = i;
                  clearInterval(idI);
              }
          }, delay);
      }
      
      if (this.i === i) {
          let idJ = setInterval(() => {
              let sign = Math.sign(j - this.j);
              this.j += ease * sign;
              if (sign > 0 && this.j > j) {
                  this.j = j;
                  clearInterval(idJ);
              } else if (sign < 0 && this.j < j) {
                  this.j = j;
                  clearInterval(idJ);
              }
          }, delay);
      }

      globals.tiles[i][j].hasPlayer = true;
  }
}