import type { JSX, MouseEvent } from "react";
import { memo } from "react";

import { CSSTransitionGroup } from "src/components/transitions";
import { TOAST_ID_ATTR, toastTypes } from "src/constants";
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

const Toasts = memo(function Toasts(props: ToastsProps): JSX.Element {
  const onCloseClick = (ev: MouseEvent<HTMLElement>): void => {
    const { actions } = props;
    const toastId = parseInt(
      ev.currentTarget.getAttribute(TOAST_ID_ATTR) ?? "",
      10,
    );
    actions.toastRemove(toastId);
  };

  const { toasts } = props;
  return (
    <div className="toasts-container">
      <CSSTransitionGroup
        transitionName="fade"
        transitionEnterTimeout={800}
        transitionLeaveTimeout={300}
      >
        {toasts.map((toast) => {
          const { type, msg } = toast;
          const iconClass = ICONS[type];
          const lowerType = type.toLowerCase();
          return (
            <div key={toast.id} className="toast-container">
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
      </CSSTransitionGroup>
    </div>
  );
});

export { Toasts };
