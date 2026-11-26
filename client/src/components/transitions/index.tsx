import type { ElementType, JSX, ReactElement, ReactNode, Ref } from "react";
import { Children, cloneElement, isValidElement, useRef } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import type { CSSTransitionProps } from "react-transition-group/CSSTransition";

/* A child that attaches the ref to its root element */
type RefElement = ReactElement<{ ref?: Ref<HTMLElement> }>;

/* The props given here, plus the ones TransitionGroup adds (in, onExited,
 * etc.), which are forwarded to CSSTransition */
interface TransitionItemProps extends Pick<
  CSSTransitionProps<HTMLElement>,
  "in" | "onExited" | "appear" | "enter" | "exit"
> {
  classNames: string;
  timeout: { enter: number; exit: number };
  children: RefElement;
}

/* Animates one child. TransitionGroup passes the transition props (in,
 * onExited, etc.), which are forwarded to CSSTransition. The child must
 * attach the ref to its root element, which gets the transition classes */
function TransitionItem({
  children,
  ...transitionProps
}: TransitionItemProps): JSX.Element {
  const nodeRef = useRef<HTMLElement>(null);
  return (
    <CSSTransition {...transitionProps} nodeRef={nodeRef}>
      {cloneElement(children, { ref: nodeRef })}
    </CSSTransition>
  );
}

interface CSSTransitionGroupProps {
  children?: ReactNode;
  component?: ElementType;
  transitionName: string;
  transitionEnterTimeout: number;
  transitionLeaveTimeout: number;
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
}: CSSTransitionGroupProps): JSX.Element {
  const timeout = {
    enter: transitionEnterTimeout,
    exit: transitionLeaveTimeout,
  };
  return (
    <TransitionGroup component={component}>
      {Children.toArray(children)
        .filter((child): child is RefElement => isValidElement(child))
        .map((child) => (
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
