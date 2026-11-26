import { Children, cloneElement, useRef } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";

/* Animates one child. TransitionGroup passes the transition props (in,
 * onExited, etc.), which are forwarded to CSSTransition. The child must
 * attach the ref to its root element, which gets the transition classes */
function TransitionItem({ children, ...transitionProps }) {
  const nodeRef = useRef(null);
  return (
    <CSSTransition {...transitionProps} nodeRef={nodeRef}>
      {cloneElement(children, { ref: nodeRef })}
    </CSSTransition>
  );
}

/*
 * Animates children as they enter and leave, keyed by their keys. Adds the
 * classes `${transitionName}-enter(-active)` and `${transitionName}-exit(-active)`
 * to each child's root element.
 *
 * Keeps the props of react-transition-group v1's CSSTransitionGroup, which
 * React 19 no longer supports (it relied on findDOMNode)
 */
function CSSTransitionGroup({
  children,
  component = "span",
  transitionName,
  transitionEnterTimeout,
  transitionLeaveTimeout,
}) {
  const timeout = {
    enter: transitionEnterTimeout,
    exit: transitionLeaveTimeout,
  };
  return (
    <TransitionGroup component={component}>
      {Children.toArray(children).map((child) => (
        <TransitionItem
          key={child.key}
          classNames={transitionName}
          timeout={timeout}
        >
          {child}
        </TransitionItem>
      ))}
    </TransitionGroup>
  );
}

export { CSSTransitionGroup };
