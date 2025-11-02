'use strict';

/**
 * generate-image controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::generate-image.generate-image', ({strapi}) => ({
    async create(ctx) {
        const result = await strapi.services['api::generate-image.generate-image'].generateImage(ctx);
        const sanitizedResult = await this.sanitizeOutput(result, ctx);

        return this.transformResponse(sanitizedResult);
    },
}));
