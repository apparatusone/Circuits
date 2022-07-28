class Box {

    constructor(x,y,r,highlight) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.highlight = highlight;
    }

    gridCoordinatesX() {
        return (-origin.x + this.x) * z
    }
    gridCoordinatesY() {
        return (origin.y - this.y) * z
    }
}
