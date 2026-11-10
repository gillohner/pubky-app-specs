import { limits } from "../data.js";
import { fail } from "../errors.js";
import { checkHashId, checkPublicKey, hashId } from "../ids.js";
import { mimeToExt } from "../mime.js";
import { socialPath } from "../path.js";
/** Media is raw bytes with no JSON form: not empty, under the cap, named by its hash. Hashed only to compare with `id`. */
export function checkFile(bytes, id) {
    if (bytes.length === 0)
        fail("blank", "File size cannot be zero", "bytes");
    // The reference's own words, which name the cap as text
    if (bytes.length > limits.maxFileSizeBytes)
        fail("size", "File size exceeds maximum limit of 100MB", "bytes", limits.maxFileSizeBytes);
    if (id === null)
        return;
    const hash = hashId(bytes);
    if (hash !== id)
        fail("id", `Invalid ID: expected ${hash}, found ${id}`, "id");
}
/**
 * Where media goes, from its bytes or from an id hashed elsewhere. The declared type picks
 * the extension and is never stored.
 */
export function buildFile(owner, source, declaredType, root) {
    checkPublicKey(owner);
    let id;
    if ("bytes" in source) {
        checkFile(source.bytes, null);
        id = hashId(source.bytes);
    }
    else {
        id = source.id;
        checkHashId(id, "id");
    }
    return { id, path: socialPath(root, `files/${id}.${mimeToExt(declaredType)}`) };
}
//# sourceMappingURL=file.js.map