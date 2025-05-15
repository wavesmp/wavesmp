import React from "react";
import { Link } from "react-router-dom";

import "./index.css";
import GithubCorner from "./githubCorner";
import LogoSvg from "../common/logo-wide.svg";

const SITE_PATH = "/";

export default class MenuBar extends React.PureComponent {
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
