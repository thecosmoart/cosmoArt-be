'use strict';

/**
 * address service
 */

const {createCoreService} = require('@strapi/strapi').factories;

module.exports = createCoreService('api::address.address', ({strapi}) => ({
    async assignAddress(ctx) {
        const user = await strapi.documents('plugin::users-permissions.user').findOne({
            documentId: ctx.state.user.documentId,
            populate: ['address'],
        });

        if (!user.address) {
            const address = await strapi.documents('api::address.address').create({
                data: {
                    ...ctx.request.body,
                },
            });

            await strapi.documents('plugin::users-permissions.user').update({
                data: {
                    address: address.id,
                },
                documentId: user.documentId,
            });

            return address;
        }

        return strapi.documents('api::address.address').update({
            data: {
                ...ctx.request.body,
            },
            documentId: user.address.documentId,
        });
    }
}));
