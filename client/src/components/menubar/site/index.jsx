import React from "react";
import { Link } from "react-router-dom";

import "./index.css";

import LogoSvg from "../common/logo-wide.svg?react";
import { GithubCorner } from "./githubCorner";

const SITE_PATH = "/";

class MenuBar extends React.PureComponent {
  render() {
    return (
      <header>
        <Link to={SITE_PATH} className="menubar-site-logos">
          <LogoSvg className="menubar-site-logo" />
          <span className="menubar-site-logo-name">WAVES</span>
        </Link>
        <GithubCorner />
      </header>
    );
  }
}

export { MenuBar };
