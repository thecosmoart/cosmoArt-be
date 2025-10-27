'use strict';
/**
 * order controller
 */

const {createCoreController} = require('@strapi/strapi').factories;

module.exports = createCoreController('api::order.order', ({strapi}) => ({
    async find(ctx) {
        await this.validateQuery(ctx);
        const sanitizedQueryParams = await this.sanitizeQuery(ctx);

        const results = await strapi.documents('api::order.order').findMany({
            where: {
                ...sanitizedQueryParams,
                user: ctx.state.user.id, // This is security to avoid loading of order for not order owner
            },
            populate: ['items'],
        });

        await results.map(async (order) => {
            order.grand_total = await strapi.service('api::order.currency').convertIntToFloat(order.grand_total);
        });

        const sanitizedResults = await this.sanitizeOutput(results, ctx);

        return this.transformResponse(sanitizedResults);
    },
    async create(ctx) {
        const result = await strapi.services['api::order.order'].makeOrder(ctx);

        const sanitizedResult = await this.sanitizeOutput(result, ctx);

        return this.transformResponse(sanitizedResult);
    },
    async callback(ctx) {
        const result = await strapi.services['api::order.order'].updateOrder(ctx);

        ctx.response.status = 200;
        ctx.response.body = 'ok';
    },
    async download(ctx) {
        const {orderId, format} = ctx.request.query;

        ctx.set('Content-Type', `application/${format}`);

        // eslint-disable-next-line no-case-declarations
        const response = await strapi.services['api::order.order'].generateOrderSummary(orderId, format);

        if (response.error) {
            ctx.response.status = 404;
            ctx.response.body = response.error;

            return ctx;
        }

        ctx.set('Content-disposition', `attachment;filename=${response.filename}`);

        return response.file;
    },
}));
