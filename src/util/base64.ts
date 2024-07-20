/**
 * Encode string into UTF-8 Base64.
 * @param data String to encode.
 * @returns Base64 encoded string.
 */
export function utoa (data: string) {
    return btoa(
        Array.from(new TextEncoder().encode(data))
            .map((v) => String.fromCharCode(v))
            .join('')
    );
}

/**
 * Decode UTF-8 Base64 into string.
 * @param data UTF-8 Base64 to decode.
 * @returns Decoded string.
 */
export function atou (data: string) {
    return new TextDecoder().decode(
        Uint8Array.from(Array.from(atob(data)).map((v) => v.charCodeAt(0)))
    );
}
