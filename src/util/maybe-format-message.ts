import formatMessage from 'format-message';
/**
 * Check if `maybeMessage` looks like a message object, and if so pass it to `formatMessage`.
 * Otherwise, return `maybeMessage` as-is.
 * @param {*} maybeMessage - something that might be a message descriptor object.
 * @param {object} [args] - the arguments to pass to `formatMessage` if it gets called.
 * @param {string} [locale] - the locale to pass to `formatMessage` if it gets called.
 * @return {string|*} - the formatted message OR the original `maybeMessage` input.
 */
export const maybeFormatMessage = function (
    maybeMessage?: any,
    args?: any,
    locale?: any
) {
    if (maybeMessage && maybeMessage.id && maybeMessage.default) {
        return formatMessage(maybeMessage, args, locale);
    }
    return maybeMessage;
};
