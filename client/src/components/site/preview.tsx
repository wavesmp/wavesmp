import type { JSX } from "react";
import { memo } from "react";

import wmpDarkImgUrl from "./wmp-dark.png";
import wmpLightImgUrl from "./wmp-light.png";

interface PreviewProps {
  theme: string;
}

const Preview = memo(function Preview(props: PreviewProps): JSX.Element {
  const { theme } = props;
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
});

export { Preview };
