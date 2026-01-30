let wasm;
export function __wbg_set_wasm(val) {
    wasm = val;
}


let WASM_VECTOR_LEN = 0;

let cachedUint8ArrayMemory0 = null;

function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

const lTextEncoder = typeof TextEncoder === 'undefined' ? (0, module.require)('util').TextEncoder : TextEncoder;

let cachedTextEncoder = new lTextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

let cachedDataViewMemory0 = null;

function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

function addToExternrefTable0(obj) {
    const idx = wasm.__externref_table_alloc();
    wasm.__wbindgen_export_4.set(idx, obj);
    return idx;
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        const idx = addToExternrefTable0(e);
        wasm.__wbindgen_exn_store(idx);
    }
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches && builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

const lTextDecoder = typeof TextDecoder === 'undefined' ? (0, module.require)('util').TextDecoder : TextDecoder;

let cachedTextDecoder = new lTextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

function takeFromExternrefTable0(idx) {
    const value = wasm.__wbindgen_export_4.get(idx);
    wasm.__externref_table_dealloc(idx);
    return value;
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
}

function passArrayJsValueToWasm0(array, malloc) {
    const ptr = malloc(array.length * 4, 4) >>> 0;
    for (let i = 0; i < array.length; i++) {
        const add = addToExternrefTable0(array[i]);
        getDataViewMemory0().setUint32(ptr + 4 * i, add, true);
    }
    WASM_VECTOR_LEN = array.length;
    return ptr;
}
/**
 * Validate RFC 5545 duration format (basic validation)
 * @param {string} duration
 * @returns {boolean}
 */
export function validateDuration(duration) {
    const ptr0 = passStringToWasm0(duration, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.validateDuration(ptr0, len0);
    return ret !== 0;
}

function getArrayJsValueFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    const mem = getDataViewMemory0();
    const result = [];
    for (let i = ptr; i < ptr + 4 * len; i += 4) {
        result.push(wasm.__wbindgen_export_4.get(mem.getUint32(i, true)));
    }
    wasm.__externref_drop_slice(ptr, len);
    return result;
}
/**
 * Get valid event status values
 * @returns {string[]}
 */
export function getValidEventStatuses() {
    const ret = wasm.getValidEventStatuses();
    var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v1;
}

/**
 * Parse RRULE basic format (simplified validation)
 * @param {string} rrule
 * @returns {boolean}
 */
export function validateRrule(rrule) {
    const ptr0 = passStringToWasm0(rrule, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.validateRrule(ptr0, len0);
    return ret !== 0;
}

/**
 * Validate geographic coordinates in "lat;lon" format
 * @param {string} geo
 * @returns {boolean}
 */
export function validateGeoCoordinates(geo) {
    const ptr0 = passStringToWasm0(geo, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.validateGeoCoordinates(ptr0, len0);
    return ret !== 0;
}

/**
 * Get valid RSVP status values
 * @returns {string[]}
 */
export function getValidRsvpStatuses() {
    const ret = wasm.getValidRsvpStatuses();
    var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v1;
}

/**
 * Validate hex color format (#RRGGBB)
 * @param {string} color
 * @returns {boolean}
 */
export function validateColor(color) {
    const ptr0 = passStringToWasm0(color, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.validateColor(ptr0, len0);
    return ret !== 0;
}

/**
 * Parses a Pubky URI and returns a strongly typed `ParsedUriResult`.
 *
 * This function wraps the internal ParsedUri ust parsing logic. It converts the result into a
 * strongly typed object that is easier to use in TypeScript.
 *
 * # Parameters
 *
 * - `uri`: A string slice representing the Pubky URI. The URI should follow the format:
 *   `pubky://<user_id>/pub/pubky.app/<resource>[/<id>]`.
 *
 * # Returns
 *
 * On success, returns a `ParsedUriResult` with:
 * - `user_id`: the parsed user ID,
 * - `resource`: a string (derived from the Display implementation of internal `Resource` enum),
 * - `resource_id`: an optional resource identifier (if applicable).
 *
 * On failure, returns a JavaScript error (`String`) containing an error message.
 *
 * # Example (TypeScript)
 *
 * ```typescript
 * import { parse_uri } from "pubky-app-specs";
 *
 * try {
 *   const result = parse_uri("pubky://user123/pub/pubky.app/posts/abc123");
 *   console.log(result.user_id);        // e.g. "user123"
 *   console.log(result.resource);    // e.g. "posts"
 *   console.log(result.resource_id);      // e.g. "abc123" or null
 * } catch (error) {
 *   console.error("Error parsing URI:", error);
 * }
 * ```
 * @param {string} uri
 * @returns {ParsedUriResult}
 */
export function parse_uri(uri) {
    const ptr0 = passStringToWasm0(uri, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.parse_uri(ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ParsedUriResult.__wrap(ret[0]);
}

/**
 * Validate timezone string (basic IANA timezone validation)
 * @param {string} timezone
 * @returns {boolean}
 */
export function validateTimezone(timezone) {
    const ptr0 = passStringToWasm0(timezone, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.validateTimezone(ptr0, len0);
    return ret !== 0;
}

/**
 * Builds a Blob URI of the form "pubky://<author_id>/pub/pubky.app/blobs/<blob_id>"
 * @param {string} author_id
 * @param {string} blob_id
 * @returns {string}
 */
export function blobUriBuilder(author_id, blob_id) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(author_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(blob_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.blobUriBuilder(ptr0, len0, ptr1, len1);
        deferred3_0 = ret[0];
        deferred3_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
}

/**
 * Builds a File URI of the form "pubky://<author_id>/pub/pubky.app/files/<file_id>"
 * @param {string} author_id
 * @param {string} file_id
 * @returns {string}
 */
export function fileUriBuilder(author_id, file_id) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(author_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(file_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.fileUriBuilder(ptr0, len0, ptr1, len1);
        deferred3_0 = ret[0];
        deferred3_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
}

/**
 * Builds an Event URI of the form "pubky://<author_id>/pub/eventky.app/events/<event_id>"
 * @param {string} author_id
 * @param {string} event_id
 * @returns {string}
 */
export function eventUriBuilder(author_id, event_id) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(author_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(event_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.eventUriBuilder(ptr0, len0, ptr1, len1);
        deferred3_0 = ret[0];
        deferred3_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
}

/**
 * Builds a LastRead URI of the form "pubky://<author_id>/pub/pubky.app/last_read"
 * @param {string} author_id
 * @returns {string}
 */
export function lastReadUriBuilder(author_id) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ptr0 = passStringToWasm0(author_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.lastReadUriBuilder(ptr0, len0);
        deferred2_0 = ret[0];
        deferred2_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
}

/**
 * Builds a Mute URI of the form "pubky://<author_id>/pub/pubky.app/mutes/<mute_id>"
 * @param {string} author_id
 * @param {string} mute_id
 * @returns {string}
 */
export function muteUriBuilder(author_id, mute_id) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(author_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(mute_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.muteUriBuilder(ptr0, len0, ptr1, len1);
        deferred3_0 = ret[0];
        deferred3_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
}

/**
 * Builds a Post URI of the form "pubky://<author_id>/pub/pubky.app/posts/<post_id>"
 * @param {string} author_id
 * @param {string} post_id
 * @returns {string}
 */
export function postUriBuilder(author_id, post_id) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(author_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(post_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.postUriBuilder(ptr0, len0, ptr1, len1);
        deferred3_0 = ret[0];
        deferred3_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
}

/**
 * Builds a Follow URI of the form "pubky://<author_id>/pub/pubky.app/follows/<follow_id>"
 * @param {string} author_id
 * @param {string} follow_id
 * @returns {string}
 */
export function followUriBuilder(author_id, follow_id) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(author_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(follow_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.followUriBuilder(ptr0, len0, ptr1, len1);
        deferred3_0 = ret[0];
        deferred3_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
}

/**
 * @param {string} user_id
 * @returns {string}
 */
export function baseUriBuilder(user_id) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ptr0 = passStringToWasm0(user_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.baseUriBuilder(ptr0, len0);
        deferred2_0 = ret[0];
        deferred2_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
}

/**
 * Builds a Tag URI of the form "pubky://<author_id>/pub/pubky.app/tags/<tag_id>"
 * @param {string} author_id
 * @param {string} tag_id
 * @returns {string}
 */
export function tagUriBuilder(author_id, tag_id) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(author_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(tag_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.tagUriBuilder(ptr0, len0, ptr1, len1);
        deferred3_0 = ret[0];
        deferred3_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
}

/**
 * Builds an Eventky base URI of the form "pubky://<user_id>/pub/eventky.app/"
 * @param {string} user_id
 * @returns {string}
 */
export function eventkyBaseUriBuilder(user_id) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ptr0 = passStringToWasm0(user_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.eventkyBaseUriBuilder(ptr0, len0);
        deferred2_0 = ret[0];
        deferred2_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
}

/**
 * Builds a Feed URI of the form "pubky://<author_id>/pub/pubky.app/feeds/<feed_id>"
 * @param {string} author_id
 * @param {string} feed_id
 * @returns {string}
 */
export function feedUriBuilder(author_id, feed_id) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(author_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(feed_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.feedUriBuilder(ptr0, len0, ptr1, len1);
        deferred3_0 = ret[0];
        deferred3_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
}

/**
 * Builds a Calendar URI of the form "pubky://<author_id>/pub/eventky.app/calendars/<calendar_id>"
 * @param {string} author_id
 * @param {string} calendar_id
 * @returns {string}
 */
export function calendarUriBuilder(author_id, calendar_id) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(author_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(calendar_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.calendarUriBuilder(ptr0, len0, ptr1, len1);
        deferred3_0 = ret[0];
        deferred3_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
}

/**
 * Builds an User URI of the form "pubky://<user_pubky_id>/pub/pubky.app/profile.json"
 * @param {string} user_id
 * @returns {string}
 */
export function userUriBuilder(user_id) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ptr0 = passStringToWasm0(user_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.userUriBuilder(ptr0, len0);
        deferred2_0 = ret[0];
        deferred2_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
}

/**
 * Builds a Bookmark URI of the form "pubky://<author_id>/pub/pubky.app/bookmarks/<bookmark_id>"
 * @param {string} author_id
 * @param {string} bookmark_id
 * @returns {string}
 */
export function bookmarkUriBuilder(author_id, bookmark_id) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(author_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(bookmark_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.bookmarkUriBuilder(ptr0, len0, ptr1, len1);
        deferred3_0 = ret[0];
        deferred3_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
}

/**
 * Builds an Attendee URI of the form "pubky://<author_id>/pub/eventky.app/attendees/<attendee_id>"
 * @param {string} author_id
 * @param {string} attendee_id
 * @returns {string}
 */
export function attendeeUriBuilder(author_id, attendee_id) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(author_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(attendee_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.attendeeUriBuilder(ptr0, len0, ptr1, len1);
        deferred3_0 = ret[0];
        deferred3_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
}

/**
 * Enum representing the layout of the feed.
 * @enum {0 | 1 | 2}
 */
export const PubkyAppFeedLayout = Object.freeze({
    Columns: 0, "0": "Columns",
    Wide: 1, "1": "Wide",
    Visual: 2, "2": "Visual",
});
/**
 * Enum representing the reach of the feed.
 * @enum {0 | 1 | 2 | 3}
 */
export const PubkyAppFeedReach = Object.freeze({
    Following: 0, "0": "Following",
    Followers: 1, "1": "Followers",
    Friends: 2, "2": "Friends",
    All: 3, "3": "All",
});
/**
 * Enum representing the sort order of the feed.
 * @enum {0 | 1}
 */
export const PubkyAppFeedSort = Object.freeze({
    Recent: 0, "0": "Recent",
    Popularity: 1, "1": "Popularity",
});
/**
 * Represents the type of pubky-app posted data
 * Used primarily to best display the content in UI
 * @enum {0 | 1 | 2 | 3 | 4 | 5}
 */
export const PubkyAppPostKind = Object.freeze({
    Short: 0, "0": "Short",
    Long: 1, "1": "Long",
    Image: 2, "2": "Image",
    Video: 3, "3": "Video",
    Link: 4, "4": "Link",
    File: 5, "5": "File",
});

const AttendeeResultFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_attendeeresult_free(ptr >>> 0, 1));

export class AttendeeResult {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(AttendeeResult.prototype);
        obj.__wbg_ptr = ptr;
        AttendeeResultFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        AttendeeResultFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_attendeeresult_free(ptr, 0);
    }
    /**
     * @returns {Meta}
     */
    get meta() {
        const ret = wasm.attendeeresult_meta(this.__wbg_ptr);
        return Meta.__wrap(ret);
    }
    /**
     * @returns {PubkyAppAttendee}
     */
    get attendee() {
        const ret = wasm.attendeeresult_attendee(this.__wbg_ptr);
        return PubkyAppAttendee.__wrap(ret);
    }
}

const BlobResultFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_blobresult_free(ptr >>> 0, 1));

export class BlobResult {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(BlobResult.prototype);
        obj.__wbg_ptr = ptr;
        BlobResultFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        BlobResultFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_blobresult_free(ptr, 0);
    }
    /**
     * @returns {PubkyAppBlob}
     */
    get blob() {
        const ret = wasm.blobresult_blob(this.__wbg_ptr);
        return PubkyAppBlob.__wrap(ret);
    }
    /**
     * @returns {Meta}
     */
    get meta() {
        const ret = wasm.blobresult_meta(this.__wbg_ptr);
        return Meta.__wrap(ret);
    }
}

const BookmarkResultFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_bookmarkresult_free(ptr >>> 0, 1));

export class BookmarkResult {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(BookmarkResult.prototype);
        obj.__wbg_ptr = ptr;
        BookmarkResultFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        BookmarkResultFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_bookmarkresult_free(ptr, 0);
    }
    /**
     * @returns {Meta}
     */
    get meta() {
        const ret = wasm.bookmarkresult_meta(this.__wbg_ptr);
        return Meta.__wrap(ret);
    }
    /**
     * @returns {PubkyAppBookmark}
     */
    get bookmark() {
        const ret = wasm.bookmarkresult_bookmark(this.__wbg_ptr);
        return PubkyAppBookmark.__wrap(ret);
    }
}

const CalendarResultFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_calendarresult_free(ptr >>> 0, 1));

export class CalendarResult {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(CalendarResult.prototype);
        obj.__wbg_ptr = ptr;
        CalendarResultFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        CalendarResultFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_calendarresult_free(ptr, 0);
    }
    /**
     * @returns {Meta}
     */
    get meta() {
        const ret = wasm.calendarresult_meta(this.__wbg_ptr);
        return Meta.__wrap(ret);
    }
    /**
     * @returns {PubkyAppCalendar}
     */
    get calendar() {
        const ret = wasm.calendarresult_calendar(this.__wbg_ptr);
        return PubkyAppCalendar.__wrap(ret);
    }
}

const EventResultFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_eventresult_free(ptr >>> 0, 1));

export class EventResult {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(EventResult.prototype);
        obj.__wbg_ptr = ptr;
        EventResultFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        EventResultFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_eventresult_free(ptr, 0);
    }
    /**
     * @returns {Meta}
     */
    get meta() {
        const ret = wasm.eventresult_meta(this.__wbg_ptr);
        return Meta.__wrap(ret);
    }
    /**
     * @returns {PubkyAppEvent}
     */
    get event() {
        const ret = wasm.eventresult_event(this.__wbg_ptr);
        return PubkyAppEvent.__wrap(ret);
    }
}

const FeedResultFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_feedresult_free(ptr >>> 0, 1));

export class FeedResult {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FeedResult.prototype);
        obj.__wbg_ptr = ptr;
        FeedResultFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FeedResultFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_feedresult_free(ptr, 0);
    }
    /**
     * @returns {PubkyAppFeed}
     */
    get feed() {
        const ret = wasm.feedresult_feed(this.__wbg_ptr);
        return PubkyAppFeed.__wrap(ret);
    }
    /**
     * @returns {Meta}
     */
    get meta() {
        const ret = wasm.feedresult_meta(this.__wbg_ptr);
        return Meta.__wrap(ret);
    }
}

const FileResultFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_fileresult_free(ptr >>> 0, 1));

export class FileResult {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FileResult.prototype);
        obj.__wbg_ptr = ptr;
        FileResultFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FileResultFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_fileresult_free(ptr, 0);
    }
    /**
     * @returns {PubkyAppFile}
     */
    get file() {
        const ret = wasm.fileresult_file(this.__wbg_ptr);
        return PubkyAppFile.__wrap(ret);
    }
    /**
     * @returns {Meta}
     */
    get meta() {
        const ret = wasm.fileresult_meta(this.__wbg_ptr);
        return Meta.__wrap(ret);
    }
}

const FollowResultFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_followresult_free(ptr >>> 0, 1));

export class FollowResult {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FollowResult.prototype);
        obj.__wbg_ptr = ptr;
        FollowResultFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FollowResultFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_followresult_free(ptr, 0);
    }
    /**
     * @returns {Meta}
     */
    get meta() {
        const ret = wasm.followresult_meta(this.__wbg_ptr);
        return Meta.__wrap(ret);
    }
    /**
     * @returns {PubkyAppFollow}
     */
    get follow() {
        const ret = wasm.followresult_follow(this.__wbg_ptr);
        return PubkyAppFollow.__wrap(ret);
    }
}

const LastReadResultFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_lastreadresult_free(ptr >>> 0, 1));

export class LastReadResult {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(LastReadResult.prototype);
        obj.__wbg_ptr = ptr;
        LastReadResultFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        LastReadResultFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_lastreadresult_free(ptr, 0);
    }
    /**
     * @returns {Meta}
     */
    get meta() {
        const ret = wasm.followresult_meta(this.__wbg_ptr);
        return Meta.__wrap(ret);
    }
    /**
     * @returns {PubkyAppLastRead}
     */
    get last_read() {
        const ret = wasm.followresult_follow(this.__wbg_ptr);
        return PubkyAppLastRead.__wrap(ret);
    }
}

const LocationFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_location_free(ptr >>> 0, 1));
/**
 * Structured location (RFC 9073 VLOCATION)
 *
 * Events can have multiple locations. First is primary.
 * Physical locations can be simple (name only) or full (with OSM link).
 *
 * # Examples
 *
 * Simple physical location:
 * ```
 * use pubky_app_specs::Location;
 *
 * let loc = Location::physical("My backyard");
 * assert_eq!(loc.name, "My backyard");
 * assert!(loc.structured_data.is_none());
 * ```
 *
 * Online meeting:
 * ```
 * use pubky_app_specs::Location;
 *
 * let loc = Location::online("Weekly Standup", "https://zoom.us/j/123456789");
 * assert_eq!(loc.name, "Weekly Standup");
 * assert_eq!(loc.structured_data.as_deref(), Some("https://zoom.us/j/123456789"));
 * ```
 */
export class Location {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Location.prototype);
        obj.__wbg_ptr = ptr;
        LocationFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        LocationFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_location_free(ptr, 0);
    }
    /**
     * @returns {string | undefined}
     */
    get description() {
        const ret = wasm.location_description(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getStringFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v1;
    }
    /**
     * @returns {string}
     */
    get location_type() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.location_location_type(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {string | undefined}
     */
    get structured_data() {
        const ret = wasm.location_structured_data(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getStringFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v1;
    }
    /**
     * @returns {string}
     */
    get name() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.location_name(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {any}
     */
    toJson() {
        const ret = wasm.location_toJson(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {any} js_value
     * @returns {Location}
     */
    static fromJson(js_value) {
        const ret = wasm.location_fromJson(js_value);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return Location.__wrap(ret[0]);
    }
}

const MetaFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_meta_free(ptr >>> 0, 1));
/**
 * Each FFI function:
 * - Accepts minimal fields in a JavaScript-friendly manner (e.g. strings, JSON).
 * - Creates the Rust model, sanitizes, and validates it.
 * - Generates the ID (if applicable).
 * - Generates the path (if applicable).
 * - Returns { json, id, path, url } or a descriptive error.
 */
export class Meta {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Meta.prototype);
        obj.__wbg_ptr = ptr;
        MetaFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        MetaFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_meta_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    get id() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.meta_id(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {string}
     */
    get url() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.meta_url(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {string}
     */
    get path() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.meta_path(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}

const MuteResultFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_muteresult_free(ptr >>> 0, 1));

export class MuteResult {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(MuteResult.prototype);
        obj.__wbg_ptr = ptr;
        MuteResultFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        MuteResultFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_muteresult_free(ptr, 0);
    }
    /**
     * @returns {Meta}
     */
    get meta() {
        const ret = wasm.followresult_meta(this.__wbg_ptr);
        return Meta.__wrap(ret);
    }
    /**
     * @returns {PubkyAppMute}
     */
    get mute() {
        const ret = wasm.followresult_follow(this.__wbg_ptr);
        return PubkyAppMute.__wrap(ret);
    }
}

const ParsedUriResultFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_parseduriresult_free(ptr >>> 0, 1));
/**
 * This object represents the result of parsing a Pubky URI. It contains:
 * - `user_id`: the parsed user ID as a string.
 * - `resource`: a string representing the kind of resource (derived from internal `Resource` enum Display).
 * - `resource_id`: an optional resource identifier (if applicable).
 */
export class ParsedUriResult {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(ParsedUriResult.prototype);
        obj.__wbg_ptr = ptr;
        ParsedUriResultFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ParsedUriResultFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_parseduriresult_free(ptr, 0);
    }
    /**
     * Returns the resource ID if present.
     * @returns {string | undefined}
     */
    get resource_id() {
        const ret = wasm.parseduriresult_resource_id(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getStringFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v1;
    }
    /**
     * Returns the user ID.
     * @returns {string}
     */
    get user_id() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.parseduriresult_user_id(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Returns the resource kind.
     * @returns {string}
     */
    get resource() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.parseduriresult_resource(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}

const PostResultFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_postresult_free(ptr >>> 0, 1));

export class PostResult {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(PostResult.prototype);
        obj.__wbg_ptr = ptr;
        PostResultFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PostResultFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_postresult_free(ptr, 0);
    }
    /**
     * @returns {Meta}
     */
    get meta() {
        const ret = wasm.postresult_meta(this.__wbg_ptr);
        return Meta.__wrap(ret);
    }
    /**
     * @returns {PubkyAppPost}
     */
    get post() {
        const ret = wasm.postresult_post(this.__wbg_ptr);
        return PubkyAppPost.__wrap(ret);
    }
}

const PubkyAppAttendeeFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_pubkyappattendee_free(ptr >>> 0, 1));
/**
 * Attendee - an RSVP/participation record for an event (simplified for self-RSVP only)
 * URI: /pub/eventky.app/attendees/:attendee_id
 *
 * The attendee_id is a hash generated from:
 * - `x_pubky_event_uri`: The event this RSVP belongs to
 * - `recurrence_id`: Optional - specific instance of a recurring event
 *
 * ## Recurring Event Support
 *
 * For recurring events, users can have multiple attendance records:
 *
 * 1. **Global/Default RSVP** (no `recurrence_id`):
 *    - Applies to the entire event series
 *    - Used as fallback when no instance-specific RSVP exists
 *
 * 2. **Instance-specific RSVP** (with `recurrence_id`):
 *    - Applies only to a specific occurrence
 *    - Overrides the global RSVP for that instance
 *
 * ## Display Priority
 *
 * When showing attendance for an instance:
 * 1. Use instance-specific record if it exists
 * 2. Fall back to global record if no instance-specific exists
 *
 * This simplified version only supports direct RSVP by the user themselves,
 * not delegation or organizer-created invite records.
 */
export class PubkyAppAttendee {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(PubkyAppAttendee.prototype);
        obj.__wbg_ptr = ptr;
        PubkyAppAttendeeFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PubkyAppAttendeeFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_pubkyappattendee_free(ptr, 0);
    }
    /**
     * Create status-specific attendees for WASM
     * @param {string} x_pubky_event_uri
     * @returns {PubkyAppAttendee}
     */
    static accepted(x_pubky_event_uri) {
        const ptr0 = passStringToWasm0(x_pubky_event_uri, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.pubkyappattendee_accepted(ptr0, len0);
        return PubkyAppAttendee.__wrap(ret);
    }
    /**
     * @param {string} x_pubky_event_uri
     * @returns {PubkyAppAttendee}
     */
    static declined(x_pubky_event_uri) {
        const ptr0 = passStringToWasm0(x_pubky_event_uri, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.pubkyappattendee_declined(ptr0, len0);
        return PubkyAppAttendee.__wrap(ret);
    }
    /**
     * @param {string} x_pubky_event_uri
     * @returns {PubkyAppAttendee}
     */
    static tentative(x_pubky_event_uri) {
        const ptr0 = passStringToWasm0(x_pubky_event_uri, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.pubkyappattendee_tentative(ptr0, len0);
        return PubkyAppAttendee.__wrap(ret);
    }
    /**
     * @returns {string}
     */
    get x_pubky_event_uri() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.pubkyappattendee_x_pubky_event_uri(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Update the participation status (WASM version)
     * @param {string} new_partstat
     */
    updateStatus(new_partstat) {
        const ptr0 = passStringToWasm0(new_partstat, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.pubkyappattendee_updateStatus(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {any}
     */
    toJson() {
        const ret = wasm.pubkyappattendee_toJson(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Creates a new `PubkyAppAttendee` instance for WASM.
     * @param {string} x_pubky_event_uri
     */
    constructor(x_pubky_event_uri) {
        const ptr0 = passStringToWasm0(x_pubky_event_uri, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.pubkyappattendee_new_wasm(ptr0, len0);
        this.__wbg_ptr = ret >>> 0;
        PubkyAppAttendeeFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @returns {string}
     */
    get partstat() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.pubkyappattendee_partstat(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {any} js_value
     * @returns {PubkyAppAttendee}
     */
    static fromJson(js_value) {
        const ret = wasm.pubkyappattendee_fromJson(js_value);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return PubkyAppAttendee.__wrap(ret[0]);
    }
    /**
     * @returns {bigint}
     */
    get created_at() {
        const ret = wasm.__wbg_get_pubkyappattendee_created_at(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {bigint} arg0
     */
    set created_at(arg0) {
        wasm.__wbg_set_pubkyappattendee_created_at(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {bigint | undefined}
     */
    get last_modified() {
        const ret = wasm.__wbg_get_pubkyappattendee_last_modified(this.__wbg_ptr);
        return ret[0] === 0 ? undefined : ret[1];
    }
    /**
     * @param {bigint | null} [arg0]
     */
    set last_modified(arg0) {
        wasm.__wbg_set_pubkyappattendee_last_modified(this.__wbg_ptr, !isLikeNone(arg0), isLikeNone(arg0) ? BigInt(0) : arg0);
    }
}

const PubkyAppBlobFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_pubkyappblob_free(ptr >>> 0, 1));
/**
 * Represents a blob, which backs a file uploaded by the user.
 * URI: /pub/pubky.app/blobs/:blob_id
 */
export class PubkyAppBlob {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(PubkyAppBlob.prototype);
        obj.__wbg_ptr = ptr;
        PubkyAppBlobFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PubkyAppBlobFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_pubkyappblob_free(ptr, 0);
    }
    /**
     * Getter for the blob data as a `Uint8Array`.
     * @returns {Uint8Array}
     */
    get data() {
        const ret = wasm.pubkyappblob_data(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {any}
     */
    toJson() {
        const ret = wasm.pubkyappblob_toJson(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {any} js_value
     * @returns {PubkyAppBlob}
     */
    static fromJson(js_value) {
        const ret = wasm.pubkyappblob_fromJson(js_value);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return PubkyAppBlob.__wrap(ret[0]);
    }
}

const PubkyAppBookmarkFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_pubkyappbookmark_free(ptr >>> 0, 1));
/**
 * Represents raw homeserver bookmark with id
 * URI: /pub/pubky.app/bookmarks/:bookmark_id
 *
 * Example URI:
 *
 * `/pub/pubky.app/bookmarks/AF7KQ6NEV5XV1EG5DVJ2E74JJ4`
 *
 * Where bookmark_id is Crockford-base32(Blake3("{uri_bookmarked}"")[:half])
 */
export class PubkyAppBookmark {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(PubkyAppBookmark.prototype);
        obj.__wbg_ptr = ptr;
        PubkyAppBookmarkFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PubkyAppBookmarkFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_pubkyappbookmark_free(ptr, 0);
    }
    /**
     * Getter for `uri`.
     * @returns {string}
     */
    get uri() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.pubkyappbookmark_uri(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {any}
     */
    toJson() {
        const ret = wasm.pubkyappbookmark_toJson(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Serialize to JSON for WASM.
     * @param {any} js_value
     * @returns {PubkyAppBookmark}
     */
    static fromJson(js_value) {
        const ret = wasm.pubkyappbookmark_fromJson(js_value);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return PubkyAppBookmark.__wrap(ret[0]);
    }
    /**
     * @returns {bigint}
     */
    get created_at() {
        const ret = wasm.__wbg_get_pubkyappbookmark_created_at(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {bigint} arg0
     */
    set created_at(arg0) {
        wasm.__wbg_set_pubkyappbookmark_created_at(this.__wbg_ptr, arg0);
    }
}

const PubkyAppCalendarFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_pubkyappcalendar_free(ptr >>> 0, 1));
/**
 * Calendar container - collection of events
 * URI: /pub/eventky.app/calendars/:calendar_id
 * Where calendar_id is a timestamp-based ID (like events)
 */
export class PubkyAppCalendar {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(PubkyAppCalendar.prototype);
        obj.__wbg_ptr = ptr;
        PubkyAppCalendarFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PubkyAppCalendarFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_pubkyappcalendar_free(ptr, 0);
    }
    /**
     * @returns {string | undefined}
     */
    get description() {
        const ret = wasm.pubkyappcalendar_description(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getStringFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v1;
    }
    /**
     * @returns {bigint | undefined}
     */
    get getLastModified() {
        const ret = wasm.pubkyappcalendar_getLastModified(this.__wbg_ptr);
        return ret[0] === 0 ? undefined : ret[1];
    }
    /**
     * @returns {string[] | undefined}
     */
    get x_pubky_authors() {
        const ret = wasm.pubkyappcalendar_x_pubky_authors(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        }
        return v1;
    }
    /**
     * @returns {string | undefined}
     */
    get url() {
        const ret = wasm.pubkyappcalendar_url(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getStringFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v1;
    }
    /**
     * @returns {string}
     */
    get name() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.pubkyappcalendar_name(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {string | undefined}
     */
    get color() {
        const ret = wasm.pubkyappcalendar_color(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getStringFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v1;
    }
    /**
     * @returns {bigint | undefined}
     */
    get getCreated() {
        const ret = wasm.pubkyappcalendar_getCreated(this.__wbg_ptr);
        return ret[0] === 0 ? undefined : ret[1];
    }
    /**
     * @returns {any}
     */
    toJson() {
        const ret = wasm.pubkyappcalendar_toJson(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @returns {number | undefined}
     */
    get getSequence() {
        const ret = wasm.pubkyappcalendar_getSequence(this.__wbg_ptr);
        return ret === 0x100000001 ? undefined : ret;
    }
    /**
     * @returns {string}
     */
    get timezone() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.pubkyappcalendar_timezone(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {any} js_value
     * @returns {PubkyAppCalendar}
     */
    static fromJson(js_value) {
        const ret = wasm.pubkyappcalendar_fromJson(js_value);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return PubkyAppCalendar.__wrap(ret[0]);
    }
    /**
     * @returns {string | undefined}
     */
    get image_uri() {
        const ret = wasm.pubkyappcalendar_image_uri(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getStringFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v1;
    }
    /**
     * @returns {bigint | undefined}
     */
    get created() {
        const ret = wasm.__wbg_get_pubkyappcalendar_created(this.__wbg_ptr);
        return ret[0] === 0 ? undefined : ret[1];
    }
    /**
     * @param {bigint | null} [arg0]
     */
    set created(arg0) {
        wasm.__wbg_set_pubkyappattendee_last_modified(this.__wbg_ptr, !isLikeNone(arg0), isLikeNone(arg0) ? BigInt(0) : arg0);
    }
    /**
     * @returns {number | undefined}
     */
    get sequence() {
        const ret = wasm.__wbg_get_pubkyappcalendar_sequence(this.__wbg_ptr);
        return ret === 0x100000001 ? undefined : ret;
    }
    /**
     * @param {number | null} [arg0]
     */
    set sequence(arg0) {
        wasm.__wbg_set_pubkyappcalendar_sequence(this.__wbg_ptr, isLikeNone(arg0) ? 0x100000001 : (arg0) >> 0);
    }
    /**
     * @returns {bigint | undefined}
     */
    get last_modified() {
        const ret = wasm.__wbg_get_pubkyappcalendar_last_modified(this.__wbg_ptr);
        return ret[0] === 0 ? undefined : ret[1];
    }
    /**
     * @param {bigint | null} [arg0]
     */
    set last_modified(arg0) {
        wasm.__wbg_set_pubkyappcalendar_last_modified(this.__wbg_ptr, !isLikeNone(arg0), isLikeNone(arg0) ? BigInt(0) : arg0);
    }
}

const PubkyAppEventFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_pubkyappevent_free(ptr >>> 0, 1));
/**
 * Event - a scheduled activity or occasion
 * URI: /pub/eventky.app/events/:event_id
 * Where event_id is a timestamp-based ID for chronological ordering
 */
export class PubkyAppEvent {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(PubkyAppEvent.prototype);
        obj.__wbg_ptr = ptr;
        PubkyAppEventFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PubkyAppEventFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_pubkyappevent_free(ptr, 0);
    }
    /**
     * @returns {string | undefined}
     */
    get dtend_tzid() {
        const ret = wasm.pubkyappevent_dtend_tzid(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getStringFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v1;
    }
    /**
     * @returns {string | undefined}
     */
    get description() {
        const ret = wasm.pubkyappevent_description(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getStringFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v1;
    }
    /**
     * @returns {string | undefined}
     */
    get dtstart_tzid() {
        const ret = wasm.pubkyappevent_dtstart_tzid(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getStringFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v1;
    }
    /**
     * Generates a unique timestamp-based ID for the event
     * @returns {string}
     */
    createId() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.pubkyappevent_createId(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {StyledDescription | undefined}
     */
    get styled_description() {
        const ret = wasm.pubkyappevent_styled_description(this.__wbg_ptr);
        return ret === 0 ? undefined : StyledDescription.__wrap(ret);
    }
    /**
     * @returns {string | undefined}
     */
    get x_pubky_rsvp_access() {
        const ret = wasm.pubkyappevent_x_pubky_rsvp_access(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getStringFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v1;
    }
    /**
     * @returns {string[] | undefined}
     */
    get x_pubky_calendar_uris() {
        const ret = wasm.pubkyappevent_x_pubky_calendar_uris(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        }
        return v1;
    }
    /**
     * @returns {string}
     */
    get uid() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.pubkyappevent_uid(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {string | undefined}
     */
    get url() {
        const ret = wasm.pubkyappevent_url(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getStringFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v1;
    }
    /**
     * @returns {string | undefined}
     */
    get dtend() {
        const ret = wasm.pubkyappevent_dtend(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getStringFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v1;
    }
    /**
     * @returns {string[] | undefined}
     */
    get rdate() {
        const ret = wasm.pubkyappevent_rdate(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        }
        return v1;
    }
    /**
     * @returns {string | undefined}
     */
    get rrule() {
        const ret = wasm.pubkyappevent_rrule(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getStringFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v1;
    }
    /**
     * @returns {string[] | undefined}
     */
    get exdate() {
        const ret = wasm.pubkyappevent_exdate(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        }
        return v1;
    }
    /**
     * @returns {string | undefined}
     */
    get status() {
        const ret = wasm.pubkyappevent_status(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getStringFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v1;
    }
    /**
     * @returns {string}
     */
    get dtstart() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.pubkyappevent_dtstart(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {string}
     */
    get summary() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.pubkyappevent_summary(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {any}
     */
    toJson() {
        const ret = wasm.pubkyappevent_toJson(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @returns {string | undefined}
     */
    get duration() {
        const ret = wasm.pubkyappevent_duration(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getStringFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v1;
    }
    /**
     * Creates a new `PubkyAppEvent` instance for WASM.
     * @param {string} uid
     * @param {string} dtstart
     * @param {string} summary
     */
    constructor(uid, dtstart, summary) {
        const ptr0 = passStringToWasm0(uid, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(dtstart, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(summary, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        const ret = wasm.pubkyappevent_new_wasm(ptr0, len0, ptr1, len1, ptr2, len2);
        this.__wbg_ptr = ret >>> 0;
        PubkyAppEventFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @param {any} js_value
     * @returns {PubkyAppEvent}
     */
    static fromJson(js_value) {
        const ret = wasm.pubkyappevent_fromJson(js_value);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return PubkyAppEvent.__wrap(ret[0]);
    }
    /**
     * @returns {string | undefined}
     */
    get image_uri() {
        const ret = wasm.pubkyappevent_image_uri(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getStringFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v1;
    }
    /**
     * @returns {Location[] | undefined}
     */
    get locations() {
        const ret = wasm.pubkyappevent_locations(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        }
        return v1;
    }
    /**
     * @returns {bigint}
     */
    get dtstamp() {
        const ret = wasm.__wbg_get_pubkyappevent_dtstamp(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {bigint} arg0
     */
    set dtstamp(arg0) {
        wasm.__wbg_set_pubkyappevent_dtstamp(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number | undefined}
     */
    get sequence() {
        const ret = wasm.__wbg_get_pubkyappcalendar_sequence(this.__wbg_ptr);
        return ret === 0x100000001 ? undefined : ret;
    }
    /**
     * @param {number | null} [arg0]
     */
    set sequence(arg0) {
        wasm.__wbg_set_pubkyappcalendar_sequence(this.__wbg_ptr, isLikeNone(arg0) ? 0x100000001 : (arg0) >> 0);
    }
    /**
     * @returns {bigint | undefined}
     */
    get last_modified() {
        const ret = wasm.__wbg_get_pubkyappevent_last_modified(this.__wbg_ptr);
        return ret[0] === 0 ? undefined : ret[1];
    }
    /**
     * @param {bigint | null} [arg0]
     */
    set last_modified(arg0) {
        wasm.__wbg_set_pubkyappattendee_last_modified(this.__wbg_ptr, !isLikeNone(arg0), isLikeNone(arg0) ? BigInt(0) : arg0);
    }
    /**
     * @returns {bigint | undefined}
     */
    get created() {
        const ret = wasm.__wbg_get_pubkyappevent_created(this.__wbg_ptr);
        return ret[0] === 0 ? undefined : ret[1];
    }
    /**
     * @param {bigint | null} [arg0]
     */
    set created(arg0) {
        wasm.__wbg_set_pubkyappcalendar_last_modified(this.__wbg_ptr, !isLikeNone(arg0), isLikeNone(arg0) ? BigInt(0) : arg0);
    }
}

const PubkyAppFeedFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_pubkyappfeed_free(ptr >>> 0, 1));
/**
 * Represents a feed configuration.
 */
export class PubkyAppFeed {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(PubkyAppFeed.prototype);
        obj.__wbg_ptr = ptr;
        PubkyAppFeedFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PubkyAppFeedFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_pubkyappfeed_free(ptr, 0);
    }
    /**
     * Getter for `feed`.
     * @returns {PubkyAppFeedConfig}
     */
    get feed() {
        const ret = wasm.pubkyappfeed_feed(this.__wbg_ptr);
        return PubkyAppFeedConfig.__wrap(ret);
    }
    /**
     * Getter for `name`.
     * @returns {string}
     */
    get name() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.pubkyappfeed_name(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {any}
     */
    toJson() {
        const ret = wasm.pubkyappfeed_toJson(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Serialize to JSON for WASM.
     * @param {any} js_value
     * @returns {PubkyAppFeed}
     */
    static fromJson(js_value) {
        const ret = wasm.pubkyappfeed_fromJson(js_value);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return PubkyAppFeed.__wrap(ret[0]);
    }
    /**
     * @returns {bigint}
     */
    get created_at() {
        const ret = wasm.__wbg_get_pubkyappattendee_created_at(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {bigint} arg0
     */
    set created_at(arg0) {
        wasm.__wbg_set_pubkyappattendee_created_at(this.__wbg_ptr, arg0);
    }
}

const PubkyAppFeedConfigFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_pubkyappfeedconfig_free(ptr >>> 0, 1));
/**
 * Configuration object for the feed.
 */
export class PubkyAppFeedConfig {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(PubkyAppFeedConfig.prototype);
        obj.__wbg_ptr = ptr;
        PubkyAppFeedConfigFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PubkyAppFeedConfigFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_pubkyappfeedconfig_free(ptr, 0);
    }
    /**
     * Getter for `sort`.
     * @returns {PubkyAppFeedSort}
     */
    get sort() {
        const ret = wasm.pubkyappfeedconfig_sort(this.__wbg_ptr);
        return ret;
    }
    /**
     * Getter for `tags`.
     * @returns {string[] | undefined}
     */
    get tags() {
        const ret = wasm.pubkyappfeedconfig_tags(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        }
        return v1;
    }
    /**
     * Getter for `name`.
     * @returns {PubkyAppFeedReach}
     */
    get reach() {
        const ret = wasm.pubkyappfeedconfig_reach(this.__wbg_ptr);
        return ret;
    }
    /**
     * Getter for `layout`.
     * @returns {PubkyAppFeedLayout}
     */
    get layout() {
        const ret = wasm.pubkyappfeedconfig_layout(this.__wbg_ptr);
        return ret;
    }
    /**
     * Getter for `content`.
     * @returns {PubkyAppPostKind | undefined}
     */
    get content() {
        const ret = wasm.pubkyappfeedconfig_content(this.__wbg_ptr);
        return ret === 6 ? undefined : ret;
    }
    /**
     * @returns {any}
     */
    toJson() {
        const ret = wasm.pubkyappfeedconfig_toJson(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {any} js_value
     * @returns {PubkyAppFeedConfig}
     */
    static fromJson(js_value) {
        const ret = wasm.pubkyappfeedconfig_fromJson(js_value);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return PubkyAppFeedConfig.__wrap(ret[0]);
    }
}

const PubkyAppFileFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_pubkyappfile_free(ptr >>> 0, 1));
/**
 * Represents a file uploaded by the user.
 * URI: /pub/pubky.app/files/:file_id
 */
export class PubkyAppFile {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(PubkyAppFile.prototype);
        obj.__wbg_ptr = ptr;
        PubkyAppFileFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PubkyAppFileFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_pubkyappfile_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    get content_type() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.pubkyappfile_content_type(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {string}
     */
    get src() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.pubkyappfile_src(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {string}
     */
    get name() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.pubkyappfile_name(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {any}
     */
    toJson() {
        const ret = wasm.pubkyappfile_toJson(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {any} js_value
     * @returns {PubkyAppFile}
     */
    static fromJson(js_value) {
        const ret = wasm.pubkyappfile_fromJson(js_value);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return PubkyAppFile.__wrap(ret[0]);
    }
    /**
     * @returns {bigint}
     */
    get created_at() {
        const ret = wasm.__wbg_get_pubkyappbookmark_created_at(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {bigint} arg0
     */
    set created_at(arg0) {
        wasm.__wbg_set_pubkyappbookmark_created_at(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get size() {
        const ret = wasm.__wbg_get_pubkyappfile_size(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {number} arg0
     */
    set size(arg0) {
        wasm.__wbg_set_pubkyappfile_size(this.__wbg_ptr, arg0);
    }
}

const PubkyAppFollowFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_pubkyappfollow_free(ptr >>> 0, 1));
/**
 * Represents raw homeserver follow object with timestamp
 *
 * On follow objects, the main data is encoded in the path
 *
 * URI: /pub/pubky.app/follows/:user_id
 *
 * Example URI:
 *
 * `/pub/pubky.app/follows/pxnu33x7jtpx9ar1ytsi4yxbp6a5o36gwhffs8zoxmbuptici1jy`
 */
export class PubkyAppFollow {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(PubkyAppFollow.prototype);
        obj.__wbg_ptr = ptr;
        PubkyAppFollowFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PubkyAppFollowFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_pubkyappfollow_free(ptr, 0);
    }
    /**
     * @returns {any}
     */
    toJson() {
        const ret = wasm.pubkyappfollow_toJson(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {any} js_value
     * @returns {PubkyAppFollow}
     */
    static fromJson(js_value) {
        const ret = wasm.pubkyappfollow_fromJson(js_value);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return PubkyAppFollow.__wrap(ret[0]);
    }
    /**
     * @returns {bigint}
     */
    get created_at() {
        const ret = wasm.__wbg_get_pubkyappbookmark_created_at(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {bigint} arg0
     */
    set created_at(arg0) {
        wasm.__wbg_set_pubkyappbookmark_created_at(this.__wbg_ptr, arg0);
    }
}

const PubkyAppLastReadFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_pubkyapplastread_free(ptr >>> 0, 1));
/**
 * Represents the last read timestamp for notifications.
 * URI: /pub/pubky.app/last_read
 */
export class PubkyAppLastRead {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(PubkyAppLastRead.prototype);
        obj.__wbg_ptr = ptr;
        PubkyAppLastReadFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PubkyAppLastReadFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_pubkyapplastread_free(ptr, 0);
    }
    /**
     * @returns {any}
     */
    toJson() {
        const ret = wasm.pubkyapplastread_toJson(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {any} js_value
     * @returns {PubkyAppLastRead}
     */
    static fromJson(js_value) {
        const ret = wasm.pubkyapplastread_fromJson(js_value);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return PubkyAppLastRead.__wrap(ret[0]);
    }
    /**
     * @returns {bigint}
     */
    get timestamp() {
        const ret = wasm.__wbg_get_pubkyappbookmark_created_at(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {bigint} arg0
     */
    set timestamp(arg0) {
        wasm.__wbg_set_pubkyappbookmark_created_at(this.__wbg_ptr, arg0);
    }
}

const PubkyAppMuteFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_pubkyappmute_free(ptr >>> 0, 1));
/**
 * Represents raw homeserver Mute object with timestamp
 * URI: /pub/pubky.app/mutes/:user_id
 *
 * Example URI:
 *
 * `/pub/pubky.app/mutes/pxnu33x7jtpx9ar1ytsi4yxbp6a5o36gwhffs8zoxmbuptici1jy`
 */
export class PubkyAppMute {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(PubkyAppMute.prototype);
        obj.__wbg_ptr = ptr;
        PubkyAppMuteFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PubkyAppMuteFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_pubkyappmute_free(ptr, 0);
    }
    /**
     * @returns {any}
     */
    toJson() {
        const ret = wasm.pubkyappmute_toJson(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {any} js_value
     * @returns {PubkyAppMute}
     */
    static fromJson(js_value) {
        const ret = wasm.pubkyappmute_fromJson(js_value);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return PubkyAppMute.__wrap(ret[0]);
    }
    /**
     * @returns {bigint}
     */
    get created_at() {
        const ret = wasm.__wbg_get_pubkyappbookmark_created_at(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {bigint} arg0
     */
    set created_at(arg0) {
        wasm.__wbg_set_pubkyappbookmark_created_at(this.__wbg_ptr, arg0);
    }
}

const PubkyAppPostFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_pubkyapppost_free(ptr >>> 0, 1));
/**
 * Represents raw post in homeserver with content and kind
 * URI: /pub/pubky.app/posts/:post_id
 * Where post_id is CrockfordBase32 encoding of timestamp
 *
 * Example URI:
 *
 * `/pub/pubky.app/posts/00321FCW75ZFY`
 */
export class PubkyAppPost {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(PubkyAppPost.prototype);
        obj.__wbg_ptr = ptr;
        PubkyAppPostFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PubkyAppPostFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_pubkyapppost_free(ptr, 0);
    }
    /**
     * @returns {string[] | undefined}
     */
    get attachments() {
        const ret = wasm.pubkyapppost_attachments(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        }
        return v1;
    }
    /**
     * Creates a new `PubkyAppPost` instance and sanitizes it.
     * @param {string} content
     * @param {PubkyAppPostKind} kind
     * @param {string | null} [parent]
     * @param {PubkyAppPostEmbed | null} [embed]
     * @param {string[] | null} [attachments]
     */
    constructor(content, kind, parent, embed, attachments) {
        const ptr0 = passStringToWasm0(content, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(parent) ? 0 : passStringToWasm0(parent, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        let ptr2 = 0;
        if (!isLikeNone(embed)) {
            _assertClass(embed, PubkyAppPostEmbed);
            ptr2 = embed.__destroy_into_raw();
        }
        var ptr3 = isLikeNone(attachments) ? 0 : passArrayJsValueToWasm0(attachments, wasm.__wbindgen_malloc);
        var len3 = WASM_VECTOR_LEN;
        const ret = wasm.pubkyapppost_new(ptr0, len0, kind, ptr1, len1, ptr2, ptr3, len3);
        this.__wbg_ptr = ret >>> 0;
        PubkyAppPostFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @returns {string}
     */
    get kind() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.pubkyapppost_kind(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {PubkyAppPostEmbed | undefined}
     */
    get embed() {
        const ret = wasm.pubkyapppost_embed(this.__wbg_ptr);
        return ret === 0 ? undefined : PubkyAppPostEmbed.__wrap(ret);
    }
    /**
     * @returns {string | undefined}
     */
    get parent() {
        const ret = wasm.pubkyapppost_parent(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getStringFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v1;
    }
    /**
     * @returns {string}
     */
    get content() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.pubkyapppost_content(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {any}
     */
    toJson() {
        const ret = wasm.pubkyapppost_toJson(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {any} js_value
     * @returns {PubkyAppPost}
     */
    static fromJson(js_value) {
        const ret = wasm.pubkyapppost_fromJson(js_value);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return PubkyAppPost.__wrap(ret[0]);
    }
}

const PubkyAppPostEmbedFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_pubkyapppostembed_free(ptr >>> 0, 1));
/**
 * Represents embedded content within a post
 */
export class PubkyAppPostEmbed {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(PubkyAppPostEmbed.prototype);
        obj.__wbg_ptr = ptr;
        PubkyAppPostEmbedFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PubkyAppPostEmbedFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_pubkyapppostembed_free(ptr, 0);
    }
    /**
     * @param {string} uri
     * @param {PubkyAppPostKind} kind
     */
    constructor(uri, kind) {
        const ptr0 = passStringToWasm0(uri, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.pubkyapppostembed_new(ptr0, len0, kind);
        this.__wbg_ptr = ret >>> 0;
        PubkyAppPostEmbedFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @returns {string}
     */
    get uri() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.pubkyapppostembed_uri(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {string}
     */
    get kind() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.pubkyapppostembed_kind(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}

const PubkyAppTagFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_pubkyapptag_free(ptr >>> 0, 1));
/**
 * Represents raw homeserver tag with id
 * URI: /pub/pubky.app/tags/:tag_id
 *
 * Example URI:
 *
 * `/pub/pubky.app/tags/FPB0AM9S93Q3M1GFY1KV09GMQM`
 *
 * Where tag_id is Crockford-base32(Blake3("{uri_tagged}:{label}")[:half])
 */
export class PubkyAppTag {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(PubkyAppTag.prototype);
        obj.__wbg_ptr = ptr;
        PubkyAppTagFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PubkyAppTagFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_pubkyapptag_free(ptr, 0);
    }
    /**
     * Getter for `uri`.
     * @returns {string}
     */
    get uri() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.pubkyapptag_uri(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Getter for `label`.
     * @returns {string}
     */
    get label() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.pubkyapptag_label(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Serialize to JSON for WASM.
     * @returns {any}
     */
    toJson() {
        const ret = wasm.pubkyapptag_toJson(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {any} js_value
     * @returns {PubkyAppTag}
     */
    static fromJson(js_value) {
        const ret = wasm.pubkyapptag_fromJson(js_value);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return PubkyAppTag.__wrap(ret[0]);
    }
    /**
     * @returns {bigint}
     */
    get created_at() {
        const ret = wasm.__wbg_get_pubkyappbookmark_created_at(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {bigint} arg0
     */
    set created_at(arg0) {
        wasm.__wbg_set_pubkyappbookmark_created_at(this.__wbg_ptr, arg0);
    }
}

const PubkyAppUserFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_pubkyappuser_free(ptr >>> 0, 1));
/**
 * URI: /pub/pubky.app/profile.json
 */
export class PubkyAppUser {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(PubkyAppUser.prototype);
        obj.__wbg_ptr = ptr;
        PubkyAppUserFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PubkyAppUserFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_pubkyappuser_free(ptr, 0);
    }
    /**
     * @returns {string | undefined}
     */
    get bio() {
        const ret = wasm.pubkyappuser_bio(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getStringFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v1;
    }
    /**
     * Creates a new `PubkyAppUser` instance and sanitizes it.
     * @param {string} name
     * @param {string | null} [bio]
     * @param {string | null} [image]
     * @param {PubkyAppUserLink[] | null} [links]
     * @param {string | null} [status]
     */
    constructor(name, bio, image, links, status) {
        const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(bio) ? 0 : passStringToWasm0(bio, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        var ptr2 = isLikeNone(image) ? 0 : passStringToWasm0(image, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len2 = WASM_VECTOR_LEN;
        var ptr3 = isLikeNone(links) ? 0 : passArrayJsValueToWasm0(links, wasm.__wbindgen_malloc);
        var len3 = WASM_VECTOR_LEN;
        var ptr4 = isLikeNone(status) ? 0 : passStringToWasm0(status, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len4 = WASM_VECTOR_LEN;
        const ret = wasm.pubkyappuser_new(ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, ptr4, len4);
        this.__wbg_ptr = ret >>> 0;
        PubkyAppUserFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @returns {string}
     */
    get name() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.pubkyappuser_name(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {string | undefined}
     */
    get image() {
        const ret = wasm.pubkyappuser_image(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getStringFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v1;
    }
    /**
     * @returns {PubkyAppUserLink[] | undefined}
     */
    get links() {
        const ret = wasm.pubkyappuser_links(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        }
        return v1;
    }
    /**
     * @returns {string | undefined}
     */
    get status() {
        const ret = wasm.pubkyappuser_status(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getStringFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v1;
    }
    /**
     * @returns {any}
     */
    toJson() {
        const ret = wasm.pubkyappuser_toJson(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {any} js_value
     * @returns {PubkyAppUser}
     */
    static fromJson(js_value) {
        const ret = wasm.pubkyappuser_fromJson(js_value);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return PubkyAppUser.__wrap(ret[0]);
    }
}

const PubkyAppUserLinkFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_pubkyappuserlink_free(ptr >>> 0, 1));
/**
 * Represents a user's single link with a title and URL.
 */
export class PubkyAppUserLink {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(PubkyAppUserLink.prototype);
        obj.__wbg_ptr = ptr;
        PubkyAppUserLinkFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    static __unwrap(jsValue) {
        if (!(jsValue instanceof PubkyAppUserLink)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PubkyAppUserLinkFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_pubkyappuserlink_free(ptr, 0);
    }
    /**
     * Creates a new `PubkyAppUserLink` instance and sanitizes it.
     * @param {string} title
     * @param {string} url
     */
    constructor(title, url) {
        const ptr0 = passStringToWasm0(title, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(url, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.pubkyappuserlink_new(ptr0, len0, ptr1, len1);
        this.__wbg_ptr = ret >>> 0;
        PubkyAppUserLinkFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @returns {string}
     */
    get url() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.pubkyappuserlink_url(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {string}
     */
    get title() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.pubkyappuserlink_title(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}

const PubkyIdFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_pubkyid_free(ptr >>> 0, 1));
/**
 * Represents user data with name, bio, image, links, and status.
 */
export class PubkyId {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PubkyIdFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_pubkyid_free(ptr, 0);
    }
}

const PubkySpecsBuilderFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_pubkyspecsbuilder_free(ptr >>> 0, 1));
/**
 * Represents a user's single link with a title and URL.
 */
export class PubkySpecsBuilder {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PubkySpecsBuilderFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_pubkyspecsbuilder_free(ptr, 0);
    }
    /**
     * @param {string} uri
     * @param {string} label
     * @returns {TagResult}
     */
    createTag(uri, label) {
        const ptr0 = passStringToWasm0(uri, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(label, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.pubkyspecsbuilder_createTag(this.__wbg_ptr, ptr0, len0, ptr1, len1);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return TagResult.__wrap(ret[0]);
    }
    /**
     * @param {any} blob_data
     * @returns {BlobResult}
     */
    createBlob(blob_data) {
        const ret = wasm.pubkyspecsbuilder_createBlob(this.__wbg_ptr, blob_data);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return BlobResult.__wrap(ret[0]);
    }
    /**
     * @param {any} tags
     * @param {string} reach
     * @param {string} layout
     * @param {string} sort
     * @param {string | null | undefined} content
     * @param {string} name
     * @returns {FeedResult}
     */
    createFeed(tags, reach, layout, sort, content, name) {
        const ptr0 = passStringToWasm0(reach, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(layout, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(sort, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        var ptr3 = isLikeNone(content) ? 0 : passStringToWasm0(content, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len3 = WASM_VECTOR_LEN;
        const ptr4 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len4 = WASM_VECTOR_LEN;
        const ret = wasm.pubkyspecsbuilder_createFeed(this.__wbg_ptr, tags, ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, ptr4, len4);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return FeedResult.__wrap(ret[0]);
    }
    /**
     * @param {string} name
     * @param {string} src
     * @param {string} content_type
     * @param {number} size
     * @returns {FileResult}
     */
    createFile(name, src, content_type, size) {
        const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(src, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(content_type, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        const ret = wasm.pubkyspecsbuilder_createFile(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, size);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return FileResult.__wrap(ret[0]);
    }
    /**
     * @param {string} mutee_id
     * @returns {MuteResult}
     */
    createMute(mutee_id) {
        const ptr0 = passStringToWasm0(mutee_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.pubkyspecsbuilder_createMute(this.__wbg_ptr, ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return MuteResult.__wrap(ret[0]);
    }
    /**
     * @param {string} content
     * @param {PubkyAppPostKind} kind
     * @param {string | null} [parent]
     * @param {PubkyAppPostEmbed | null} [embed]
     * @param {string[] | null} [attachments]
     * @returns {PostResult}
     */
    createPost(content, kind, parent, embed, attachments) {
        const ptr0 = passStringToWasm0(content, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(parent) ? 0 : passStringToWasm0(parent, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        let ptr2 = 0;
        if (!isLikeNone(embed)) {
            _assertClass(embed, PubkyAppPostEmbed);
            ptr2 = embed.__destroy_into_raw();
        }
        var ptr3 = isLikeNone(attachments) ? 0 : passArrayJsValueToWasm0(attachments, wasm.__wbindgen_malloc);
        var len3 = WASM_VECTOR_LEN;
        const ret = wasm.pubkyspecsbuilder_createPost(this.__wbg_ptr, ptr0, len0, kind, ptr1, len1, ptr2, ptr3, len3);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return PostResult.__wrap(ret[0]);
    }
    /**
     * @param {string} name
     * @param {string | null | undefined} bio
     * @param {string | null | undefined} image
     * @param {any} links
     * @param {string | null} [status]
     * @returns {UserResult}
     */
    createUser(name, bio, image, links, status) {
        const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(bio) ? 0 : passStringToWasm0(bio, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        var ptr2 = isLikeNone(image) ? 0 : passStringToWasm0(image, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len2 = WASM_VECTOR_LEN;
        var ptr3 = isLikeNone(status) ? 0 : passStringToWasm0(status, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len3 = WASM_VECTOR_LEN;
        const ret = wasm.pubkyspecsbuilder_createUser(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, links, ptr3, len3);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return UserResult.__wrap(ret[0]);
    }
    /**
     * @param {string} uid
     * @param {string} dtstart
     * @param {string} summary
     * @param {string | null | undefined} dtend
     * @param {string | null | undefined} duration
     * @param {string | null | undefined} dtstart_tzid
     * @param {string | null | undefined} dtend_tzid
     * @param {string | null | undefined} description
     * @param {string | null | undefined} status
     * @param {string | null | undefined} image_uri
     * @param {string | null | undefined} url
     * @param {string | null | undefined} rrule
     * @param {any} rdate
     * @param {any} exdate
     * @param {string | null | undefined} recurrence_id
     * @param {StyledDescription | null | undefined} styled_description
     * @param {any} x_pubky_calendar_uris
     * @param {string | null} [x_pubky_rsvp_access]
     * @returns {EventResult}
     */
    createEvent(uid, dtstart, summary, dtend, duration, dtstart_tzid, dtend_tzid, description, status, image_uri, url, rrule, rdate, exdate, recurrence_id, styled_description, x_pubky_calendar_uris, x_pubky_rsvp_access) {
        const ptr0 = passStringToWasm0(uid, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(dtstart, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(summary, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        var ptr3 = isLikeNone(dtend) ? 0 : passStringToWasm0(dtend, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len3 = WASM_VECTOR_LEN;
        var ptr4 = isLikeNone(duration) ? 0 : passStringToWasm0(duration, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len4 = WASM_VECTOR_LEN;
        var ptr5 = isLikeNone(dtstart_tzid) ? 0 : passStringToWasm0(dtstart_tzid, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len5 = WASM_VECTOR_LEN;
        var ptr6 = isLikeNone(dtend_tzid) ? 0 : passStringToWasm0(dtend_tzid, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len6 = WASM_VECTOR_LEN;
        var ptr7 = isLikeNone(description) ? 0 : passStringToWasm0(description, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len7 = WASM_VECTOR_LEN;
        var ptr8 = isLikeNone(status) ? 0 : passStringToWasm0(status, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len8 = WASM_VECTOR_LEN;
        var ptr9 = isLikeNone(image_uri) ? 0 : passStringToWasm0(image_uri, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len9 = WASM_VECTOR_LEN;
        var ptr10 = isLikeNone(url) ? 0 : passStringToWasm0(url, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len10 = WASM_VECTOR_LEN;
        var ptr11 = isLikeNone(rrule) ? 0 : passStringToWasm0(rrule, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len11 = WASM_VECTOR_LEN;
        var ptr12 = isLikeNone(recurrence_id) ? 0 : passStringToWasm0(recurrence_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len12 = WASM_VECTOR_LEN;
        let ptr13 = 0;
        if (!isLikeNone(styled_description)) {
            _assertClass(styled_description, StyledDescription);
            ptr13 = styled_description.__destroy_into_raw();
        }
        var ptr14 = isLikeNone(x_pubky_rsvp_access) ? 0 : passStringToWasm0(x_pubky_rsvp_access, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len14 = WASM_VECTOR_LEN;
        const ret = wasm.pubkyspecsbuilder_createEvent(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, ptr4, len4, ptr5, len5, ptr6, len6, ptr7, len7, ptr8, len8, ptr9, len9, ptr10, len10, ptr11, len11, rdate, exdate, ptr12, len12, ptr13, x_pubky_calendar_uris, ptr14, len14);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return EventResult.__wrap(ret[0]);
    }
    /**
     * @param {string} followee_id
     * @returns {FollowResult}
     */
    createFollow(followee_id) {
        const ptr0 = passStringToWasm0(followee_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.pubkyspecsbuilder_createFollow(this.__wbg_ptr, ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return FollowResult.__wrap(ret[0]);
    }
    /**
     * @param {string} partstat
     * @param {string} x_pubky_event_uri
     * @param {string | null} [recurrence_id]
     * @returns {AttendeeResult}
     */
    createAttendee(partstat, x_pubky_event_uri, recurrence_id) {
        const ptr0 = passStringToWasm0(partstat, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(x_pubky_event_uri, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        var ptr2 = isLikeNone(recurrence_id) ? 0 : passStringToWasm0(recurrence_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len2 = WASM_VECTOR_LEN;
        const ret = wasm.pubkyspecsbuilder_createAttendee(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return AttendeeResult.__wrap(ret[0]);
    }
    /**
     * @param {string} uri
     * @returns {BookmarkResult}
     */
    createBookmark(uri) {
        const ptr0 = passStringToWasm0(uri, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.pubkyspecsbuilder_createBookmark(this.__wbg_ptr, ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return BookmarkResult.__wrap(ret[0]);
    }
    /**
     * @param {string} name
     * @param {string} timezone
     * @param {string | null | undefined} color
     * @param {string | null | undefined} image_uri
     * @param {string | null | undefined} description
     * @param {string | null | undefined} url
     * @param {any} x_pubky_authors
     * @returns {CalendarResult}
     */
    createCalendar(name, timezone, color, image_uri, description, url, x_pubky_authors) {
        const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(timezone, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        var ptr2 = isLikeNone(color) ? 0 : passStringToWasm0(color, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len2 = WASM_VECTOR_LEN;
        var ptr3 = isLikeNone(image_uri) ? 0 : passStringToWasm0(image_uri, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len3 = WASM_VECTOR_LEN;
        var ptr4 = isLikeNone(description) ? 0 : passStringToWasm0(description, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len4 = WASM_VECTOR_LEN;
        var ptr5 = isLikeNone(url) ? 0 : passStringToWasm0(url, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len5 = WASM_VECTOR_LEN;
        const ret = wasm.pubkyspecsbuilder_createCalendar(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, ptr4, len4, ptr5, len5, x_pubky_authors);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return CalendarResult.__wrap(ret[0]);
    }
    /**
     * @returns {LastReadResult}
     */
    createLastRead() {
        const ret = wasm.pubkyspecsbuilder_createLastRead(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return LastReadResult.__wrap(ret[0]);
    }
    /**
     * Creates a new `PubkyAppBuilder` instance.
     * @param {string} pubky_id
     */
    constructor(pubky_id) {
        const ptr0 = passStringToWasm0(pubky_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.pubkyspecsbuilder_new(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        this.__wbg_ptr = ret[0] >>> 0;
        PubkySpecsBuilderFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Edits an existing post by updating its content while preserving its original ID and timestamp.
     * @param {PubkyAppPost} original_post
     * @param {string} post_id
     * @param {string} new_content
     * @returns {PostResult}
     */
    editPost(original_post, post_id, new_content) {
        _assertClass(original_post, PubkyAppPost);
        var ptr0 = original_post.__destroy_into_raw();
        const ptr1 = passStringToWasm0(post_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(new_content, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        const ret = wasm.pubkyspecsbuilder_editPost(this.__wbg_ptr, ptr0, ptr1, len1, ptr2, len2);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return PostResult.__wrap(ret[0]);
    }
}

const StyledDescriptionFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_styleddescription_free(ptr >>> 0, 1));
/**
 * Represents styled description with metadata for rich content
 */
export class StyledDescription {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(StyledDescription.prototype);
        obj.__wbg_ptr = ptr;
        StyledDescriptionFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        StyledDescriptionFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_styleddescription_free(ptr, 0);
    }
    /**
     * @returns {string[] | undefined}
     */
    get attachments() {
        const ret = wasm.styleddescription_attachments(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        }
        return v1;
    }
    /**
     * @param {string} content
     * @param {string} format
     * @param {string[] | null} [attachments]
     */
    constructor(content, format, attachments) {
        const ptr0 = passStringToWasm0(content, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(format, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        var ptr2 = isLikeNone(attachments) ? 0 : passArrayJsValueToWasm0(attachments, wasm.__wbindgen_malloc);
        var len2 = WASM_VECTOR_LEN;
        const ret = wasm.styleddescription_new(ptr0, len0, ptr1, len1, ptr2, len2);
        this.__wbg_ptr = ret >>> 0;
        StyledDescriptionFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @returns {string}
     */
    get format() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.styleddescription_format(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {string}
     */
    get content() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.styleddescription_content(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}

const TagResultFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_tagresult_free(ptr >>> 0, 1));

export class TagResult {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(TagResult.prototype);
        obj.__wbg_ptr = ptr;
        TagResultFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        TagResultFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_tagresult_free(ptr, 0);
    }
    /**
     * @returns {PubkyAppTag}
     */
    get tag() {
        const ret = wasm.tagresult_tag(this.__wbg_ptr);
        return PubkyAppTag.__wrap(ret);
    }
    /**
     * @returns {Meta}
     */
    get meta() {
        const ret = wasm.tagresult_meta(this.__wbg_ptr);
        return Meta.__wrap(ret);
    }
}

const UserResultFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_userresult_free(ptr >>> 0, 1));

export class UserResult {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(UserResult.prototype);
        obj.__wbg_ptr = ptr;
        UserResultFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        UserResultFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_userresult_free(ptr, 0);
    }
    /**
     * @returns {Meta}
     */
    get meta() {
        const ret = wasm.userresult_meta(this.__wbg_ptr);
        return Meta.__wrap(ret);
    }
    /**
     * @returns {PubkyAppUser}
     */
    get user() {
        const ret = wasm.userresult_user(this.__wbg_ptr);
        return PubkyAppUser.__wrap(ret);
    }
}

export function __wbg_String_8f0eb39a4a4c2f66(arg0, arg1) {
    const ret = String(arg1);
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
};

export function __wbg_buffer_609cc3eee51ed158(arg0) {
    const ret = arg0.buffer;
    return ret;
};

export function __wbg_call_672a4d21634d4a24() { return handleError(function (arg0, arg1) {
    const ret = arg0.call(arg1);
    return ret;
}, arguments) };

export function __wbg_done_769e5ede4b31c67b(arg0) {
    const ret = arg0.done;
    return ret;
};

export function __wbg_entries_3265d4158b33e5dc(arg0) {
    const ret = Object.entries(arg0);
    return ret;
};

export function __wbg_get_67b2ba62fc30de12() { return handleError(function (arg0, arg1) {
    const ret = Reflect.get(arg0, arg1);
    return ret;
}, arguments) };

export function __wbg_get_b9b93047fe3cf45b(arg0, arg1) {
    const ret = arg0[arg1 >>> 0];
    return ret;
};

export function __wbg_getwithrefkey_1dc361bd10053bfe(arg0, arg1) {
    const ret = arg0[arg1];
    return ret;
};

export function __wbg_instanceof_ArrayBuffer_e14585432e3737fc(arg0) {
    let result;
    try {
        result = arg0 instanceof ArrayBuffer;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
};

export function __wbg_instanceof_Uint8Array_17156bcf118086a9(arg0) {
    let result;
    try {
        result = arg0 instanceof Uint8Array;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
};

export function __wbg_isArray_a1eab7e0d067391b(arg0) {
    const ret = Array.isArray(arg0);
    return ret;
};

export function __wbg_isSafeInteger_343e2beeeece1bb0(arg0) {
    const ret = Number.isSafeInteger(arg0);
    return ret;
};

export function __wbg_iterator_9a24c88df860dc65() {
    const ret = Symbol.iterator;
    return ret;
};

export function __wbg_length_a446193dc22c12f8(arg0) {
    const ret = arg0.length;
    return ret;
};

export function __wbg_length_e2d2a49132c1b256(arg0) {
    const ret = arg0.length;
    return ret;
};

export function __wbg_location_new(arg0) {
    const ret = Location.__wrap(arg0);
    return ret;
};

export function __wbg_new_405e22f390576ce2() {
    const ret = new Object();
    return ret;
};

export function __wbg_new_78feb108b6472713() {
    const ret = new Array();
    return ret;
};

export function __wbg_new_a12002a7f91c75be(arg0) {
    const ret = new Uint8Array(arg0);
    return ret;
};

export function __wbg_newwithbyteoffsetandlength_d97e637ebe145a9a(arg0, arg1, arg2) {
    const ret = new Uint8Array(arg0, arg1 >>> 0, arg2 >>> 0);
    return ret;
};

export function __wbg_next_25feadfc0913fea9(arg0) {
    const ret = arg0.next;
    return ret;
};

export function __wbg_next_6574e1a8a62d1055() { return handleError(function (arg0) {
    const ret = arg0.next();
    return ret;
}, arguments) };

export function __wbg_now_807e54c39636c349() {
    const ret = Date.now();
    return ret;
};

export function __wbg_pubkyappuserlink_new(arg0) {
    const ret = PubkyAppUserLink.__wrap(arg0);
    return ret;
};

export function __wbg_pubkyappuserlink_unwrap(arg0) {
    const ret = PubkyAppUserLink.__unwrap(arg0);
    return ret;
};

export function __wbg_set_37837023f3d740e8(arg0, arg1, arg2) {
    arg0[arg1 >>> 0] = arg2;
};

export function __wbg_set_3f1d0b984ed272ed(arg0, arg1, arg2) {
    arg0[arg1] = arg2;
};

export function __wbg_set_65595bdd868b3009(arg0, arg1, arg2) {
    arg0.set(arg1, arg2 >>> 0);
};

export function __wbg_value_cd1ffa7b1ab794f1(arg0) {
    const ret = arg0.value;
    return ret;
};

export function __wbindgen_as_number(arg0) {
    const ret = +arg0;
    return ret;
};

export function __wbindgen_bigint_from_i64(arg0) {
    const ret = arg0;
    return ret;
};

export function __wbindgen_bigint_from_u64(arg0) {
    const ret = BigInt.asUintN(64, arg0);
    return ret;
};

export function __wbindgen_bigint_get_as_i64(arg0, arg1) {
    const v = arg1;
    const ret = typeof(v) === 'bigint' ? v : undefined;
    getDataViewMemory0().setBigInt64(arg0 + 8 * 1, isLikeNone(ret) ? BigInt(0) : ret, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
};

export function __wbindgen_boolean_get(arg0) {
    const v = arg0;
    const ret = typeof(v) === 'boolean' ? (v ? 1 : 0) : 2;
    return ret;
};

export function __wbindgen_debug_string(arg0, arg1) {
    const ret = debugString(arg1);
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
};

export function __wbindgen_error_new(arg0, arg1) {
    const ret = new Error(getStringFromWasm0(arg0, arg1));
    return ret;
};

export function __wbindgen_in(arg0, arg1) {
    const ret = arg0 in arg1;
    return ret;
};

export function __wbindgen_init_externref_table() {
    const table = wasm.__wbindgen_export_4;
    const offset = table.grow(4);
    table.set(0, undefined);
    table.set(offset + 0, undefined);
    table.set(offset + 1, null);
    table.set(offset + 2, true);
    table.set(offset + 3, false);
    ;
};

export function __wbindgen_is_bigint(arg0) {
    const ret = typeof(arg0) === 'bigint';
    return ret;
};

export function __wbindgen_is_function(arg0) {
    const ret = typeof(arg0) === 'function';
    return ret;
};

export function __wbindgen_is_null(arg0) {
    const ret = arg0 === null;
    return ret;
};

export function __wbindgen_is_object(arg0) {
    const val = arg0;
    const ret = typeof(val) === 'object' && val !== null;
    return ret;
};

export function __wbindgen_is_string(arg0) {
    const ret = typeof(arg0) === 'string';
    return ret;
};

export function __wbindgen_is_undefined(arg0) {
    const ret = arg0 === undefined;
    return ret;
};

export function __wbindgen_jsval_eq(arg0, arg1) {
    const ret = arg0 === arg1;
    return ret;
};

export function __wbindgen_jsval_loose_eq(arg0, arg1) {
    const ret = arg0 == arg1;
    return ret;
};

export function __wbindgen_memory() {
    const ret = wasm.memory;
    return ret;
};

export function __wbindgen_number_get(arg0, arg1) {
    const obj = arg1;
    const ret = typeof(obj) === 'number' ? obj : undefined;
    getDataViewMemory0().setFloat64(arg0 + 8 * 1, isLikeNone(ret) ? 0 : ret, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
};

export function __wbindgen_number_new(arg0) {
    const ret = arg0;
    return ret;
};

export function __wbindgen_string_get(arg0, arg1) {
    const obj = arg1;
    const ret = typeof(obj) === 'string' ? obj : undefined;
    var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
};

export function __wbindgen_string_new(arg0, arg1) {
    const ret = getStringFromWasm0(arg0, arg1);
    return ret;
};

export function __wbindgen_throw(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

