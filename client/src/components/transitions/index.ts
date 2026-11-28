/*
 * Enter and exit animations are CSS only (see the fade classes in
 * src/styles/global.css and the sidebar transitions). Animated elements stay
 * mounted, and a class switches them between shown and hidden, so CSS can
 * transition both ways.
 */
import { useState } from "react";

/*
 * The value as of the last render where visible was true. Lets hidden
 * content keep showing what it showed while it fades out. The value must be
 * stable across renders (e.g. state or memoized), since a new value while
 * visible is stored.
 */
function useLastVisible<T>(value: T, visible: boolean): T {
  const [last, setLast] = useState(value);
  if (visible && last !== value) {
    setLast(value);
  }
  return visible ? value : last;
}

export { useLastVisible };
