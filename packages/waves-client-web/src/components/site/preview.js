import React from "react";

import wmpLightImgUrl from "./wmp-light.png";
import wmpDarkImgUrl from "./wmp-dark.png";

export default class Preview extends React.PureComponent {
  render() {
    const { theme } = this.props;
    const imgSrc = theme === "dark" ? wmpDarkImgUrl : wmpLightImgUrl;
    return (
      <div className="site-main-right">
        <div className="site-main-browser">
          <div className="site-main-browser-bar">
            <div className="site-main-browser-close" />
            <div className="site-main-browser-min" />
            <div className="site-main-browser-max" />
          </div>
          <img src={imgSrc} className="site-main-browser-img" />
        </div>
      </div>
    );
  }
}
