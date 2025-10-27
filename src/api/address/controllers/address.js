'use strict';

/**
 * address controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::address.address', ({strapi}) => ({
    async create(ctx) {
        const result = await strapi.services['api::address.address'].assignAddress(ctx);

        const sanitizedResult = await this.sanitizeOutput(result, ctx);

        return this.transformResponse(sanitizedResult);
    }
}));
