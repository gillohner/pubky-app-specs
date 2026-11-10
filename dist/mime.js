import { MIME_TO_EXT } from "./data.js";
import { asciiFold } from "./text.js";
const ESSENCE_PART = /^[a-z0-9!#$&^_.+-]+$/;
/** The text before the first `;`, ASCII-folded and untrimmed; null when malformed. */
function essence(declared) {
    const semicolon = declared.indexOf(";");
    const folded = asciiFold(semicolon < 0 ? declared : declared.slice(0, semicolon));
    const slash = folded.indexOf("/");
    if (slash < 0)
        return null;
    const ok = ESSENCE_PART.test(folded.slice(0, slash)) && ESSENCE_PART.test(folded.slice(slash + 1));
    return ok ? folded : null;
}
const EXTENSION = /* @__PURE__ */ new Map(MIME_TO_EXT);
/** The extensions a media file name may end in: every mapped one, and the fallback. */
export const MEDIA_EXTENSIONS = /* @__PURE__ */ new Set([...EXTENSION.values(), "bin"]);
/** The path extension a declared type maps to; `"bin"` for anything unmapped or malformed. */
export function mimeToExt(declared) {
    const type = essence(declared);
    return (type !== null && EXTENSION.get(type)) || "bin";
}
//# sourceMappingURL=mime.js.map