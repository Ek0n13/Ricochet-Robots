
const Direction = {
    Top: "top",
    Right: "right",
    Bottom: "bottom",
    Left: "left"
}

class Tile {
    /** @type {{top: boolean, right: boolean, bottom: boolean, left: boolean}}} */
    sides = {};
    hasPlayer = false;
    /**
     * 
     * @param {number} i 
     * @param {number} j 
     * @param {number} size 
     * @param {{
     *  R:number,
     *  G:number,
     *  B:number,
     *  A:number
     * }} clr 
     */
    constructor(i, j, size) {
        this.i = i;
        this.j = j;
        this.size = size;
        this.clr = {
            R: 255,
            G: 255,
            B: 255,
            A: 255
        };

        this.sides[Direction.Top] = false;
        this.sides[Direction.Right] = false;
        this.sides[Direction.Bottom] = false;
        this.sides[Direction.Left] = false;

    }

    get x() {
        return globals.offsetWidth + (this.i * this.size);
    }

    get y() {
        return globals.offsetHeight + (this.j * this.size);
    }

    get topLeft() {
        return {
            x: this.x,
            y: this.y
        }
    }

    get topRight() {
        return {
            x: this.x + this.size,
            y: this.y
        }
    }

    get bottomLeft() {
        return {
            x: this.x,
            y: this.y + this.size
        }
    }

    get bottomRight() {
        return {
            x: this.x + this.size,
            y: this.y + this.size
        }
    }

    draw() {
        strokeWeight(0.2);
        fill(this.clr.R, this.clr.G, this.clr.B, this.clr.A);
        rect(this.x, this.y, this.size, this.size);
    }

    drawBorders() {
        if (this.sides.top) {
            this.#customLine(this.topLeft, this.topRight);
        }
        if (this.sides.right) {
            this.#customLine(this.topRight, this.bottomRight);
        }
        if (this.sides.bottom) {
            this.#customLine(this.bottomLeft, this.bottomRight);
        }
        if (this.sides.left) {
            this.#customLine(this.bottomLeft, this.topLeft);
        }
    }

    #customLine(point1, point2) {
        strokeWeight(3);
        line(point1.x, point1.y, point2.x, point2.y);
    }


    isInside(mouseX, mouseY) {
        let minX = this.x;
        let minY = this.y;
        let maxX = this.x + this.size;
        let maxY = this.y + this.size;

        let minCondition = mouseX > minX && mouseY > minY;
        let maxCondition = mouseX < maxX && mouseY < maxY;

        return minCondition && maxCondition;
    }

    canExit(moveDirection) {
        if (moveDirection === Direction.Top) {
            return !this.sides[Direction.Top]
        } else if (moveDirection === Direction.Right) {
            return !this.sides[Direction.Right]
        } else if (moveDirection === Direction.Bottom) {
            return !this.sides[Direction.Bottom]
        } else if (moveDirection === Direction.Left) {
            return !this.sides[Direction.Left]
        }

        return false;
    }

    canEnter(moveDirection) {
        if (this.hasPlayer) return false;

        if (moveDirection === Direction.Top) {
            return !this.sides[Direction.Bottom]
        } else if (moveDirection === Direction.Right) {
            return !this.sides[Direction.Left]
        } else if (moveDirection === Direction.Bottom) {
            return !this.sides[Direction.Top]
        } else if (moveDirection === Direction.Left) {
            return !this.sides[Direction.Right]
        }

        return false;
    }
}

class Player extends Tile {
    #scaleSize = 0.85;

    constructor(i, j) {
        super(i, j, globals.size);

        this.clr = {
            R: 150,
            G: 150,
            B: 150,
            A: 255
        };

        this.width = globals.size * this.#scaleSize;
        this.isSelected = false;
    }

    draw() {
        this.width = globals.size * this.#scaleSize;
        fill(this.clr.R, this.clr.G, this.clr.B, this.clr.A);
        strokeWeight(1)
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

    move() {

    }

    moveSpecific(i, j) {
        globals.tiles[this.i][this.j].hasPlayer = false;
        this.i = i;
        this.j = j;
        globals.tiles[this.i][this.j].hasPlayer = true;
    }
}