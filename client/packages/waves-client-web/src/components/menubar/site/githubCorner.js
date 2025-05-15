import React from "react";

import GithubCornerSvg from "./github-corner-right.svg";

export default class GithubCorner extends React.PureComponent {
  render() {
    return (
      <a
        className="absolute-top-right"
        href="https://github.com/wavesmp/wavesmp"
      >
        <GithubCornerSvg />
      </a>
    );
  }
}
