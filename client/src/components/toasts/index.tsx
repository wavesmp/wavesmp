import type { AnimationEvent, CSSProperties, JSX, MouseEvent } from "react";
import { memo, useState } from "react";

import { TOAST_ID_ATTR, TOAST_TIMEOUT, toastTypes } from "src/constants";
import type { BoundActions } from "src/providers/dispatcher";
import type { Toast, ToastType } from "src/types/stateTypes";

import "./index.css";

const ICONS: Record<ToastType, string> = {
  [toastTypes.Success]: "fa fa-lg fa-2x fa-check",
  [toastTypes.Error]: "fa fa-lg fa-2x fa-exclamation-triangle",
};

interface ToastsProps {
  actions: BoundActions;
  toasts: Toast[];
}

/* The toast's timeout, for its fade out (see index.css) */
function getToastStyle(toast: Toast): CSSProperties {
  const timeout = toast.timeout ?? TOAST_TIMEOUT;
  return { "--toast-timeout": `${timeout.toString()}ms` } as CSSProperties;
}

/*
 * Toasts fade in as they are added. They fade out before their timeout
 * removes them, or when closed, and are removed once the fade out ends
 */
const Toasts = memo(function Toasts(props: ToastsProps): JSX.Element {
  const { actions, toasts } = props;
  /* Toasts fading out after a close click */
  const [closingIds, setClosingIds] = useState<ReadonlySet<number>>(
    () => new Set(),
  );

  const onCloseClick = (ev: MouseEvent<HTMLElement>): void => {
    const toastId = parseInt(
      ev.currentTarget.getAttribute(TOAST_ID_ATTR) ?? "",
      10,
    );
    setClosingIds((ids) => new Set(ids).add(toastId));
  };

  const onAnimationEnd = (ev: AnimationEvent<HTMLElement>): void => {
    if (ev.target !== ev.currentTarget || ev.animationName !== "fade-out") {
      return;
    }
    const toastId = parseInt(
      ev.currentTarget.getAttribute(TOAST_ID_ATTR) ?? "",
      10,
    );
    actions.toastRemove(toastId);
    setClosingIds((ids) => {
      if (!ids.has(toastId)) {
        return ids;
      }
      const remaining = new Set(ids);
      remaining.delete(toastId);
      return remaining;
    });
  };

  return (
    <div className="toasts-container">
      <span>
        {toasts.map((toast) => {
          const { type, msg } = toast;
          const iconClass = ICONS[type];
          const lowerType = type.toLowerCase();
          let className = "toast-container";
          if (toast.id !== undefined && closingIds.has(toast.id)) {
            className += " toast-container-closing";
          }
          return (
            <div
              key={toast.id}
              className={className}
              style={getToastStyle(toast)}
              data-toast={toast.id}
              onAnimationEnd={onAnimationEnd}
            >
              <div className={`toast-bar toast-bar-${lowerType}`} />
              <div className="toast-content">
                <div
                  className={`toast-icon-container toast-icon-container-${lowerType}`}
                >
                  <i className={iconClass} />
                </div>
                <div className="toast-text-container">
                  <div>
                    <b>{type}</b>
                  </div>
                  <div>{msg}</div>
                </div>
                <div
                  className="toast-close"
                  data-toast={toast.id}
                  onClick={onCloseClick}
                >
                  <i className="fa fa-lg fa-times" />
                </div>
              </div>
            </div>
          );
        })}
      </span>
    </div>
  );
});

export { Toasts };
