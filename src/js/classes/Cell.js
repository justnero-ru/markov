export default class Cell {
    constructor(value, visits, eps) {
        this.value = value || 0;
        this.visits = visits || 0;
        this.eps = eps || .001
    }

    clear() {
        this.value = 0;
        this.visits = 0;
        this.eps = .001;
    }
}
