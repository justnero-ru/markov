export default class Transition {
    constructor(from, to) {
        this.from = typeof from !== 'undefined' ? from : null;
        this.to = typeof to !== 'undefined' ? to : null;
    }
}