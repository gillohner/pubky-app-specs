import { type Post } from "./models/post.js";
import { type Root } from "./path.js";
interface Copy {
    from: string;
    to: string;
}
/**
 * Publishing one private version: the media copies to run first, then the post to PUT, its
 * private media references respelled to their public form in the reference positions only.
 */
export declare function planPublish(owner: string, id: string, editId: string, value: Post, slug: string | null): {
    copies: Copy[];
    put: {
        id: string;
        editId: string;
        path: import("./path.js").OwnerPath;
        value: Post;
        body: string;
    };
};
/**
 * Unpublishing: every public version newer than the private head is copied back, oldest
 * first; without a private tree the newest public version seeds it. Then the deletes.
 */
export declare function planUnpublish(id: string, publicPaths: string[], legacyPaths: string[], privateHead: string | null): {
    copies: Copy[];
    deletes: string[];
};
interface StoredCopy {
    root: Root;
    path: string;
}
/** Legacy first, then every version oldest first with `pub` before `priv`. */
export declare function deleteOrder(id: string, legacyPaths: string[], copies: StoredCopy[]): string[];
/** Deleting a post everywhere: the deletes in order, then the media to consider collecting. */
export declare function planDelete(owner: string, id: string, legacyPaths: string[], copies: StoredCopy[], versions: Post[]): {
    deletes: string[];
    mediaGcCandidates: string[];
};
export {};
//# sourceMappingURL=lifecycle.d.ts.map