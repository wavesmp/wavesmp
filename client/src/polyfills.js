/* music-metadata-browser expects a global Buffer, which webpack 4 used to
 * polyfill automatically. Vite does not, so provide it here. This module
 * must be imported before any module that uses Buffer.
 *
 * music-metadata also imports the node "assert" module. It resolves to the
 * "assert" npm package, which is a direct dependency so it is always
 * installed where vite can find it. */
import { Buffer } from "buffer";

if (typeof window.Buffer === "undefined") {
  window.Buffer = Buffer;
}
