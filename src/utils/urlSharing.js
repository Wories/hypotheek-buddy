import LZString from 'lz-string';

/**
 * Serializes the application state into a compressed base64 string
 * @param {Object} state - The state object to share
 * @returns {string} Compressed string safe for URL
 */
export const serializeState = (state) => {
    try {
        const json = JSON.stringify(state);
        return LZString.compressToEncodedURIComponent(json);
    } catch (e) {
        console.error("Failed to serialize state", e);
        return null;
    }
};

/**
 * Deserializes a compressed string back into the application state object
 * @param {string} compressed - The compressed string from URL
 * @returns {Object|null} The parsed state object or null if invalid
 */
export const deserializeState = (compressed) => {
    try {
        if (!compressed) return null;
        const json = LZString.decompressFromEncodedURIComponent(compressed);
        if (!json) return null;
        return JSON.parse(json);
    } catch (e) {
        console.error("Failed to deserialize state", e);
        return null;
    }
};
