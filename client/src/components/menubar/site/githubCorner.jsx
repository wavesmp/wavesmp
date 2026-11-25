import { memo } from "react";

import GithubCornerSvg from "./github-corner-right.svg?react";

const GithubCorner = memo(function GithubCorner() {
  return (
    <a className="absolute-top-right" href="https://github.com/wavesmp/wavesmp">
      <GithubCornerSvg />
    </a>
  );
});

export { GithubCorner };
