export default class Cell {
    constructor(value, visits) {
        this.value = value || 0;
        this.visits = visits || 0;
    }

    clear() {
        this.value = 0;
        this.visits = 0;
    }
}