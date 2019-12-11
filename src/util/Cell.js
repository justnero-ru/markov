export const CELL_PRECISION = .001;

export default class Cell {
    /**
     * @param {number|string} value
     * @param {number|string} precision
     * @returns {{precision: number, value: number}}
     */
    static build(value = 0, precision = CELL_PRECISION) {
        return {
            value: Number(value).valueOf(),
            precision: Number(precision).valueOf(),
        };
    }

    /**
     * @returns {{precision: number, value: number}}
     */
    static empty() {
        return this.build();
    }

    /**
     * @param {{precision: number, value: number}}
     * @returns {{precision: number, value: number}}
     */
    static copy({value = 0, precision = CELL_PRECISION}) {
        return this.build(value, precision);
    }

    /**
     * @param {{precision: number, value: number}}
     * @param {number|string|undefined} newValue
     * @returns {{precision: number, value: number}}
     */
    static alter({value = 0, precision = CELL_PRECISION}, newValue) {
        return this.build(this.isValid(newValue) ? newValue : value, precision);
    }

    /**
     * @param {number|string|undefined} value
     * @returns {boolean}
     */
    static isValid(value) {
        switch (typeof value) {
            case 'number':
                return !isNaN(value);
            case 'string' :
            default:
                return value.length > 0
                    && !isNaN(Number(value).valueOf())
                    && !value.endsWith('.')
                    && !value.endsWith(',');
        }
    }

    /**
     * @param {{precision: number, value: number}} cell
     * @returns {string}
     */
    static format({value, precision}) {
        const val = Math.round(value / precision) * precision;
        const fractionDigits = Math.ceil(Math.log10(1 / precision));

        return val.toFixed(fractionDigits).replace(/\.?[0]+$/, '');
    }

    /**
     * @param {{precision: number, value: number}} cell
     * @param {number} factor
     * @returns {{precision: number, value: number}}
     */
    static normalized({value = 0, precision = CELL_PRECISION}, factor) {
        return this.build(factor ? Number(value).valueOf() / factor : 0, precision);
    }
}
