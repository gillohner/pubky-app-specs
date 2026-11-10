import { checkReference } from "../canonicalize.js";
import { limits } from "../data.js";
import { fail, throwing } from "../errors.js";
import { checkPublicKey } from "../ids.js";
import { inputOf, inputReads, list, object, option, string } from "../json/schema.js";
import { codePointLen, frozenTrim, trimmedOrNull } from "../text.js";
import { socialPath } from "../path.js";
import { checkExtra, validate } from "./common.js";
const link = object("PubkySocialUserLink", { title: string, url: string });
// Display text, absent or not blank and at most `max` code points
function checkText(text, field, max) {
    if (text === null)
        return;
    if (frozenTrim(text) === "")
        fail("blank", `${field} must not be blank`, field);
    if (codePointLen(text) > max)
        fail("length", `${field} must be at most ${max} code points`, field, max);
}
function checkLink(value, index, each) {
    each(() => checkExtra(value.extra, `links[${index}].`));
    each(() => checkText(value.title, `links[${index}].title`, limits.userLinkTitleMaxLength));
    each(() => checkReference(`links[${index}].url`, value.url, "web", limits.userLinkUrlMaxLength, true, null));
}
export const user = {
    codec: object("PubkySocialUser", {
        name: string,
        bio: option(string),
        image: option(string),
        links: option(list(link)),
        status: option(string),
    }),
    maxBytes: limits.objectMaxBytes,
    // The profile has one root, the public one, whatever root a caller reads it under
    check(value, _id, _publicRoot, each) {
        each(() => checkExtra(value.extra));
        // Padding is display text, so it is counted, not removed; only whitespace is still no name
        each(() => {
            if (frozenTrim(value.name) === "")
                fail("blank", "name must not be blank", "name");
            const length = codePointLen(value.name);
            if (length < limits.userNameMinLength || length > limits.userNameMaxLength)
                fail("length", `name must be ${limits.userNameMinLength} to ${limits.userNameMaxLength} code points`, "name", length < limits.userNameMinLength ? limits.userNameMinLength : limits.userNameMaxLength);
        });
        each(() => checkText(value.bio, "bio", limits.userBioMaxLength));
        const { image, links } = value;
        if (image !== null)
            each(() => checkReference("image", image, "pubky or web", limits.imageUrlMaxLength, true, null));
        if (links !== null) {
            each(() => {
                if (links.length > limits.userLinksMaxCount)
                    fail("count", `Too many links (max: ${limits.userLinksMaxCount})`, "links", limits.userLinksMaxCount);
            });
            links.forEach((link, index) => checkLink(link, index, each));
        }
        each(() => checkText(value.status, "status", limits.userStatusMaxLength));
    },
};
/**
 * A fresh profile. The builder trims the display text; references are stored as written. A
 * validator passes a collecting `each` and no owner.
 */
export function buildUser(owner, input, each = throwing) {
    if (owner !== null)
        checkPublicKey(owner);
    const { str, opt, items } = inputReads(each);
    const i = inputOf(input, "input", ["name", "bio", "image", "links", "status"], each);
    const value = {
        name: frozenTrim(str(i.name, "input.name")),
        bio: trimmedOrNull(opt(i.bio, "input.bio")),
        image: opt(i.image, "input.image"),
        links: items(i.links, "input.links", (js, at) => {
            const l = inputOf(js, at, ["title", "url"], each);
            return { title: frozenTrim(str(l.title, `${at}.title`)), url: str(l.url, `${at}.url`), extra: new Map() };
        }),
        status: trimmedOrNull(opt(i.status, "input.status")),
        extra: new Map(),
    };
    return { id: "", path: socialPath("public", "profile.json"), value, body: validate(user, value, null, true, each) };
}
//# sourceMappingURL=user.js.map