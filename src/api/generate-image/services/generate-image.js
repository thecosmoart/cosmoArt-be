'use strict';

/**
 * generate-image service
 */

const OpenAI = require("openai");
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::generate-image.generate-image', ({strapi}) => ({
    async generateImage(ctx) {
        const user = await strapi.documents('plugin::users-permissions.user').findOne({
            documentId: ctx.state.user.documentId,
        });

        if (!+user.balance) {
            ctx.throw(402, 'Not enough balance');
        }

        try {
            const { prompt } = ctx.request.body;

            if (!prompt) {
                return ctx.badRequest("Prompt is required");
            }

            const response = await openai.images.generate({
                model: "dall-e-2",
                prompt,
                n: 4,
                size: "1024x1024",
            });


            await strapi.documents('plugin::users-permissions.user').update({
                documentId: user.documentId,
                data: {
                    balance: --user.balance,
                }
            });

            return response.data.map((item) => item.url);
        } catch (err) {
            console.error(err);
            ctx.internalServerError("Image generation Error");
        }
    }
}));
