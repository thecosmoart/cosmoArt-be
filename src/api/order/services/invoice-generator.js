'use strict';

const dayjs = require("dayjs");
module.exports = () => ({
    async getFinalPDFDocument(order, baseTemplate) {
        const grandTotal = await strapi.service('api::order.currency').convertIntToFloat(order.grand_total);

        // Processing order line items
        const itemsHtml = order.items.reduce((acc, item, key) => {
            acc += `<tr>
        <td style="border-bottom: 1px solid #ccc">${key}</td>
        <td style="border-bottom: 1px solid #ccc">${item.name}</td>
        <td style="border-bottom: 1px solid #ccc">${item.price}</td>
        <td style="border-bottom: 1px solid #ccc">${1}</td>
        <td style="border-bottom: 1px solid #ccc">${item.price}</td>
      </tr>`;

            return acc;
        }, '');

        return baseTemplate
            .replaceAll('[[ logo_url ]]', `${process.env.MERCHANT_CALLBACK_URL}/pictures/logo.svg`)
            .replaceAll('[[ invoice_num ]]', order.id)
            .replaceAll('[[ company_name ]]', process.env.COMPANY_NAME)
            .replaceAll('[[ reg_number ]]', process.env.COMPANY_REG_NUM)
            .replaceAll('[[ company_address ]]', process.env.COMPANY_ADDRESS)
            .replaceAll('[[ full_name ]]', `${order.address.first_name} ${order.address.last_name}`)
            .replaceAll('[[ phone ]]', order.address.phone)
            .replaceAll('[[ email ]]', order.user.email)
            .replaceAll('[[ creation_date ]]', dayjs(order.createdAt).format('DD.MM.YYYY'))
            .replaceAll('[[ confirmation_date ]]', dayjs(order.updatedAt).format('DD.MM.YYYY'))
            .replaceAll('[[ grand_total ]]', grandTotal)
            .replaceAll('[[ items ]]', itemsHtml)
    },
});
