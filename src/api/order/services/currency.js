'use strict';

/**
 * currency service
 */

const UNIT_IN_CENTS = 100;

module.exports = () => ({
    async convertFloatToInt(amount) {
        return amount * UNIT_IN_CENTS;
    },
    async convertIntToFloat(amount) {
        return amount / UNIT_IN_CENTS;
    }
});
