'use strict';

const utils = require("@strapi/utils");
const { ApplicationError } = utils.errors;

module.exports = {
    /**
     * An asynchronous register function that runs before
     * your application is initialized.
     *
     * This gives you an opportunity to extend code.
     */
    register({ strapi })
    { },

    /**
     * An asynchronous bootstrap function that runs before
     * your application gets started.
     *
     * This gives you an opportunity to set up your data model,
     * run jobs, or perform some special logic.
     */
    bootstrap({ strapi })
    {
        strapi.db.lifecycles.subscribe({
            models: ["api::order.order"],
            afterUpdate: async ({ result }) => {
                const order = await strapi.db.query('api::order.order').findOne({
                    where: {
                        documentId: result.documentId,
                    },
                    populate: ['user'],
                });

                const smtpService = strapi.services['api::order.smtp'];

                if (result.order_status === 'COMPLETED') {
                    await smtpService.sendEmail({
                        to: order.user.email,
                        sender: process.env.SENDER_EMAIL,
                        subject: 'Your item is on its way via Steam!',
                        body: '' +
                            `<p>Hi ${ order.address.first_name }</p>` +
                            `<p>Good news! Your item from order #${ order.id } is being prepared for delivery.</p>` +
                            '<p>You will receive a Steam trade offer link within the next 7 business days.</p>' +
                            '<p>Please make sure your Steam account is ready to receive trades and that your trade URL is up to date.\n</p>' +
                            '<p>If you have any questions or need help, feel free to reach out — we’re here for you.\n</p>' +
                            '<p>Best regards,<br>The Site Team<br><a href="site.com">skin-harbor.com</a><br><a href="mailto:support@skin-harbor.com">support@skin-harbor.com</a></p>'
                    });
                }

                if (result.order_status === 'REJECTED') {
                    await smtpService.sendEmail({
                        to: order.user.email,
                        sender: process.env.SENDER_EMAIL,
                        subject: 'Update on your order',
                        body: '' +
                            `<p>Hi ${ order.address.first_name }</p>` +
                            `<p>We wanted to inform you that unfortunately, item from your order #${ order.id } is currently unavailable.<br>We sincerely apologize for the inconvenience.</p>` +
                            '<p>A refund for the unavailable item will be processed shortly.<br>You should see the funds returned to your account within 3–5 business days, depending on your bank.</p>' +
                            '<p>If you have any questions or need assistance, don’t hesitate to reach out.\n</p>' +
                            '<p>Best regards,<br>The Skin-Harbor Team<br><a href="skin-harbor.com">skin-harbor.com</a><br><a href="mailto:support@skin-harbor.com">support@skin-harbor.com</a></p>'
                    });
                }
            },
        });
    },
};
