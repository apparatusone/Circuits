class Box {

    constructor(x,y,r) {
        this.image = document.getElementById('testbox');
        this.x = x;
        this.y = y;
        this.r = r;
        this.highlight = false;
    }

    gridCoordinatesX() {
        return (-origin.x + this.x) * z
    }
    gridCoordinatesY() {
        return (origin.y - this.y) * z
    }
}
