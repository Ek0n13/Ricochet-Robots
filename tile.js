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
     */
    constructor(i, j) {
        this.i = i;
        this.j = j;
        this.size = 1;
        this.icon = "";
        this.clrsKey = "";

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

    drawCustom(x, y, size) {
        strokeWeight(0.2);
        fill(this.clr.R, this.clr.G, this.clr.B, this.clr.A);
        rect(x, y, size, size);
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
        let weight = Math.ceil(this.size / 10);

        strokeWeight(weight);
        line(point1.x, point1.y, point2.x, point2.y);
    }

    drawIcon() {
        let halfSize = this.size / 2
        let x = this.x + halfSize;
        let y = this.y + halfSize;
        
        textSize(this.size * 0.7);
        textAlign(CENTER, CENTER);
        text(this.icon, x, y);
    }

    drawIconCustom(x, y, size) {
        let halfSize = size / 2
        let customX = x + halfSize;
        let customY = y + halfSize;
        
        fill(0);
        textSize(size * 0.7);
        textAlign(CENTER, CENTER);
        text(this.icon, customX, customY);
    }

    // isInside(mouseX, mouseY) {
    //     let minX = this.x;
    //     let minY = this.y;
    //     let maxX = this.x + this.size;
    //     let maxY = this.y + this.size;

    //     let minCondition = mouseX > minX && mouseY > minY;
    //     let maxCondition = mouseX < maxX && mouseY < maxY;

    //     return minCondition && maxCondition;
    // }

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
