// Byte inputs, read through the intrinsic getters: bytes from another realm are bytes too, and
// a subclass may report a length or an offset its memory does not have.
const TypedArray = Object.getPrototypeOf(Uint8Array.prototype);
// eslint-disable-next-line @typescript-eslint/unbound-method -- an intrinsic getter, only ever called through .call
const getter = (owner, name) => Object.getOwnPropertyDescriptor(owner, name)?.get;
const tagOf = getter(TypedArray, Symbol.toStringTag);
const bufferOf = getter(TypedArray, "buffer");
const offsetOf = getter(TypedArray, "byteOffset");
const lengthOf = getter(TypedArray, "byteLength");
const bufferLengthOf = getter(ArrayBuffer.prototype, "byteLength");
const SINGLE = ["Uint8Array", "Uint8ClampedArray", "Int8Array"];
// The ArrayBuffer getter refuses a SharedArrayBuffer, which a host may not even define
function isShared(buffer) {
    try {
        bufferLengthOf.call(buffer);
        return false;
    }
    catch {
        return true;
    }
}
/**
 * A plain `Uint8Array` over the memory of a view of single bytes, or null; a detached one is
 * null. Shared memory is copied, so another thread cannot change the bytes between two reads.
 */
export function viewBytes(value) {
    if (!SINGLE.includes(tagOf.call(value)))
        return null;
    try {
        const buffer = bufferOf.call(value);
        const view = new Uint8Array(buffer, offsetOf.call(value), lengthOf.call(value));
        return isShared(buffer) ? new Uint8Array(view) : view;
    }
    catch {
        return null;
    }
}
/** `viewBytes`, and an `ArrayBuffer` as the bytes it holds. */
export function plainBytes(value) {
    const view = viewBytes(value);
    if (view !== null)
        return view;
    try {
        bufferLengthOf.call(value);
        return new Uint8Array(value);
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=bytes.js.map