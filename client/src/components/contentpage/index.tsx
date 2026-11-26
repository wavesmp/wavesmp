import type { JSX, ReactNode } from "react";
import { memo } from "react";

import { useLayout, usePlaying, useSidebar } from "src/providers/hooks";

import "./index.css";

interface ContentPageProps {
  title: string;
  children?: ReactNode;
}

const ContentPage = memo(function ContentPage({
  title,
  children,
}: ContentPageProps): JSX.Element {
  const layout = useLayout();
  const sidebar = useSidebar();
  const playing = usePlaying();
  const isSliderVisible = playing.track != null;

  let className;
  /* Usually, transitions are enabled on this element. However,
   * disable the transitions when moving from layouts, so that
   * the element can snap into place. Adding a new transition
   * for this case would conflict with the current one, so handle
   * it programmatically (no pure-CSS solution available AFAIK) */
  if (layout > 1) {
    className = "contentpage-container-transition ";
  } else {
    className = "";
  }
  className += "contentpage-container contentpage-container-";
  if (sidebar) {
    className += "wide";
  } else {
    className += "narrow";
  }
  if (isSliderVisible) {
    className += " contentpage-container-player-visible";
  }
  return (
    <div className={className}>
      <div className="contentpage-panel">
        <div className="contentpage-title">
          <h1>{title}</h1>
        </div>
        {children}
      </div>
    </div>
  );
});

export { ContentPage };
