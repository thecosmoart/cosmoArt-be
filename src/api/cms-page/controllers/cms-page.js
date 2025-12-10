'use strict';

/**
 * cms-page controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::cms-page.cms-page', ({ strapi }) => ({
    async contactUs(ctx) {
        const payload = ctx.request.body;
        const smtpService = strapi.services['api::order.smtp'];

        await smtpService.sendEmail({
            to: process.env.SENDER_EMAIL,
            replyTo: payload.email,
            sender: process.env.SENDER_EMAIL,
            subject: 'Site Contact Form',
            body: '' +
                `<p>From: ${payload.name}</p>` +
                `<p>Question: ${payload.text}</p>` +
                '<br>' +
                '<p>Best regards,<br>The Cosmo Art<br><a href="thecosmoart.com">thecosmoart.com</a><br><a href="mailto:support@thecosmoart.com">support@thecosmoart.com</a></p>'
        });

        ctx.response.status = 200;
        ctx.response.body = { data: { status: 'ok' } };
    }
}));
