import { memo } from "react";
import { Link } from "react-router";

import "./index.css";

import LogoSvg from "../common/logo-wide.svg?react";
import { GithubCorner } from "./githubCorner";

const SITE_PATH = "/";

const MenuBar = memo(function MenuBar() {
  return (
    <header>
      <Link to={SITE_PATH} className="menubar-site-logos">
        <LogoSvg className="menubar-site-logo" />
        <span className="menubar-site-logo-name">WAVES</span>
      </Link>
      <GithubCorner />
    </header>
  );
});

export { MenuBar };
