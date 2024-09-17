class Player extends Tile {
    #scaleSize = 0.85;

    constructor(i, j, clr) {
        super(i, j, globals.size);

        this.clr = clr;

        this.targetI = this.i;
        this.targetJ = this.j;

        this.width = globals.size * this.#scaleSize;
        this.isSelected = false;
    }

    draw() {
        let halfSize = this.size / 2;
        let x = this.x + halfSize;
        let y = this.y + halfSize;
        
        this.width = globals.size * this.#scaleSize;
        fill(this.clr.R, this.clr.G, this.clr.B, this.clr.A);
        strokeWeight(2)
        ellipse(x, y, this.width);

        textSize(this.size * 0.45);
        textAlign(CENTER, CENTER);
        text("🚀", x, y);
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
        let move = this.playerColorAsLetter();

        let targetI = this.i;
        let targetJ = this.j;

        if (this.i === tile.i) {
            if (this.j < tile.j) {
                targetJ = Math.max(...globals.availableTiles.map(x => x.j));
                globals.moves.push(`${move}⬇️`);
            } else if (this.j > tile.j) {
                targetJ = Math.min(...globals.availableTiles.map(x => x.j));
                globals.moves.push(`${move}⬆️`);
            }
        } else if (this.j === tile.j) {
            if (this.i < tile.i) {
                targetI = Math.max(...globals.availableTiles.map(x => x.i));
                globals.moves.push(`${move}➡️`);
            } else if (this.i > tile.i) {
                targetI = Math.min(...globals.availableTiles.map(x => x.i));
                globals.moves.push(`${move}⬅️`);
            }
        }

        this.moveSpecific(targetI, targetJ)
            .then((value) => {
                if (this.playerReachedGoal()) {
                    alert("Goal!!!");
                    resetPlayers();
                    setGoalTile();
                }
            });
    }

    moveSpecific(i, j) {
        return new Promise((resolve, reject) => {    
            let ease = 0.2;
            let delay = 10;

            globals.tiles[this.i][this.j].hasPlayer = false;
            
            if (this.j === j) {
                let idI = setInterval(() => {
                    let sign = Math.sign(i - this.i);
                    this.i += ease * sign;
                    if (sign > 0 && this.i >= i) {
                        this.i = i;
                        clearInterval(idI);
                        resolve(null);
                    } else if (sign < 0 && this.i <= i) {
                        this.i = i;
                        clearInterval(idI);
                        resolve(null);
                    }
                }, delay);
            }
            
            if (this.i === i) {
                let idJ = setInterval(() => {
                    let sign = Math.sign(j - this.j);
                    this.j += ease * sign;
                    if (sign > 0 && this.j >= j) {
                        this.j = j;
                        clearInterval(idJ);
                        resolve(null);
                    } else if (sign < 0 && this.j <= j) {
                        this.j = j;
                        clearInterval(idJ);
                        resolve(null);
                    }
                }, delay);
            }

            globals.tiles[i][j].hasPlayer = true;
        });
    }

    /**
     * @returns {Boolean}
     */
    playerReachedGoal() {
        let currentGoalTile = globals.currentGoalTile;
        let currentGoal = 
            currentGoalTile.i === this.i &&
            currentGoalTile.j === this.j && (
                compareColorsRGB(currentGoalTile.clr, this.clr) ||
                currentGoalTile.clrsKey === null
            );
        let minimumMoves = globals.moves.length > 1;
        
        if (minimumMoves && currentGoal) return true;
        
        return false;
    }

    /**
     * @returns {String}
     */
    playerColorAsLetter() {
        if (compareColorsRGB(this.clr, clrs.redClr)) {
            return "R";
        } else if (compareColorsRGB(this.clr, clrs.greenClr)) {
            return "G";
        } else if (compareColorsRGB(this.clr, clrs.blueClr)) {
            return "B";
        } else if (compareColorsRGB(this.clr, clrs.yellowClr)) {
            return "Y";
        }
    }
}