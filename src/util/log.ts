/**
 * Output general messages.
 * @param params The message.
 */
export function log (...params: unknown[]) {
    console.log(
        '%c😎 Chibi',
        ` background-color: #f7c7bb; border-radius: 1rem; margin-right: 0.25rem; padding: 0 0.5rem; color: #271919;`,
        ...params
    );
}
/**
 * Output warning messages.
 * @param params The message.
 */
export function warn (...params: unknown[]) {
    console.warn(
        '%c😨 Chibi',
        ` background-color: #f7c7bb; border-radius: 1rem; margin-right: 0.25rem; padding: 0 0.5rem; color: #271919;`,
        ...params
    );
}
/**
 * Output error (exception) messages.
 * @param params The message.
 */
export function error (...params: unknown[]) {
    console.error(
        '%c😵 Chibi',
        ` background-color: #f7c7bb; border-radius: 1rem; margin-right: 0.25rem; padding: 0 0.5rem; color: #271919;`,
        ...params
    );
}
