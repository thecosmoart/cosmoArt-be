'use strict';

/**
 * order service
 */
const {Payment, Callback} = require('openpayze');
const fs = require('node:fs');
const wkhtmltopdf = require('wkhtmltopdf');
const {createCoreService} = require('@strapi/strapi').factories;

module.exports = createCoreService('api::order.order', ({strapi}) => ({
    async makeOrder(ctx) {
        const user = await strapi.documents('plugin::users-permissions.user').findOne({
            documentId: ctx.state.user.documentId,
            populate: ['address'],
        });

        if (!user.address) {
            ctx.throw(422, 'Missing User Address');
        }

        const itemsIds = ctx.request.body.productIds;

        let grandTotal = 0;
        let orderItems = [];

        for (let productId of itemsIds) {
            const product = await strapi.documents('api::product.product').findOne({documentId: productId});

            if (!product) {
                ctx.throw(404, 'Product not found');
            }

            const items = await strapi.documents('api::order-item.order-item').create({
                data: {
                    name: product.name,
                    price: product.price,
                    amount: product.amount
                }
            });

            grandTotal += product.price;
            orderItems.push(items.id);
        }

        grandTotal = await strapi.service('api::order.currency').convertFloatToInt(grandTotal);

        const order = await strapi.services['api::order.order'].create({
            data: {
                items: orderItems,
                user: user.id,
                grand_total: grandTotal,
                address: user.address,
            }
        });

        return this.postOrder(order, user);
    },
    async postOrder(order, user) {
        const paymentSystem = new Payment(process.env.PROJECT_ID, process.env.PROJECT_SECRET);
        paymentSystem.paymentId = order.documentId;
        paymentSystem.paymentAmount = order.grand_total;
        paymentSystem.paymentCurrency = process.env.PROJECT_BASE_CURRENCY;
        paymentSystem.customerId = user.id;
        paymentSystem.language_code = 'EN';

        paymentSystem.billingCountry = user.address.country;
        paymentSystem.customerCity = user.address.city;
        paymentSystem.billingPostal = user.address.zip;
        paymentSystem.customerPhone = user.address.phone;
        paymentSystem.customerFirstName = user.address.first_name;
        paymentSystem.customerLastName = user.address.last_name;

        paymentSystem.merchantCallbackUrl = `${process.env.MERCHANT_CALLBACK_URL}/api/order-callback`;
        paymentSystem.merchantSuccessUrl = process.env.MERCHANT_SUCCESS_URL;
        paymentSystem.merchantSuccessEnabled = 1;
        paymentSystem.merchantSuccessRedirectMode = 'parent_page';

        return {
            url: paymentSystem.getUrl(),
            orderId: order.id,
        };
    },
    async updateOrder(ctx) {
        const requestBody = ctx.request.body;
        const orderCallback = new Callback(process.env.PROJECT_SECRET, requestBody);

        if (orderCallback.isPaymentSuccess()) {
            console.log('***', 12);
            const order = await strapi.db.query('api::order.order').findOne({
                where: {
                    documentId: 'hJPwolpDY1',
                },
                populate: ['user', 'items'],
            });

            if (!order) {
                return;
            }
console.log('***', order);
            const user = order.user;

            await strapi.documents('api::order.order').update({
                documentId: order.documentId,
                data: {
                    order_status: 'COMPLETED',
                }
            });
console.log('***', Number(user.balance) + Number(order.items[0].amount));
            await strapi.documents('plugin::users-permissions.user').update({
                documentId: user.documentId,
                data: {
                    balance: Number(user.balance) + Number(order.items[0].amount),
                }
            });

            const smtpService = strapi.services['api::order.smtp'];

            await smtpService.sendEmail({
                to: order.user.email,
                sender: process.env.SENDER_EMAIL,
                subject: 'Your order is being processed',
                body: '' +
                    `<p>Hi ${order.address.first_name}</p>` +
                    '<p>Thank you for your order with Site!</p>' +
                    `<p>We\'re happy to let you know that your order #${order.id} has been received and is currently being processed.<br>We\'ll notify you as soon as it ships.</p>` +
                    '<p>If you have any questions in the meantime, feel free to reply to this email — we\'re here to help.</p>' +
                    '<p>Thanks again for choosing us!</p>' +
                    '<p>Best regards,<br>The Site Team<br><a href="site.com">site.com</a><br><a href="mailto:support@site.com">support@site.com</a></p>'
            });
        }
    },
    async generateOrderSummary(orderId) {
        const order = await strapi.db.query('api::order.order').findOne({
            where: {
                id: orderId,
            },
            populate: ['user', 'items'],
        });

        if (!order) {
            return {
                error: 'Order not found!',
            };
        }

        const orderSummaryTemplate = await strapi.service('api::order.invoice-generator').getFinalPDFDocument(
            order,
            fs.readFileSync('./src/components/html/order.html', 'utf8')
        );

        return {
            file: wkhtmltopdf(orderSummaryTemplate, {encoding: 'utf8'}),
            filename: `Order_summary_export_${order.id}.pdf`
        };
    },
}));
