import { type Each } from "../errors.js";
import { type Extra } from "../json/schema.js";
import { type Model } from "./common.js";
export interface UserLink extends Extra {
    /** The link's label, trimmed by the builder: 1 to 100 code points, not blank. */
    title: string;
    /** A canonical `http://` or `https://` URL, stored as written: at most 300 code points. */
    url: string;
}
export interface User extends Extra {
    /** The display name, trimmed by the builder: 3 to 50 code points, not blank. */
    name: string;
    /** A short description, trimmed by the builder: at most 160 code points; null for none. */
    bio: string | null;
    /** The avatar: a canonical pubky or web URI of at most 300 code points, never under the private root; null for none. */
    image: string | null;
    /** At most 5 links shown on the profile; null for none. */
    links: UserLink[] | null;
    /** A status line, trimmed by the builder: at most 50 code points; null for none. */
    status: string | null;
}
export declare const user: Model<User>;
/**
 * A fresh profile. The builder trims the display text; references are stored as written. A
 * validator passes a collecting `each` and no owner.
 */
export declare function buildUser(owner: string | null, input: unknown, each?: Each): {
    id: string;
    path: import("../path.js").OwnerPath;
    value: User;
    body: string;
};
//# sourceMappingURL=user.d.ts.map