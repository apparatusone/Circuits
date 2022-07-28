class Box {

    constructor(x,y,r) {
        this.x = x;
        this.y = y;
        this.r = r
    }

    gridCoordinatesX() {
        return (-origin.x + this.x) * z
    }
    gridCoordinatesY() {
        return (origin.y - this.y) * z
    }
}
