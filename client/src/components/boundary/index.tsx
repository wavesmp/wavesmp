import type { ErrorInfo, ReactNode } from "react";
import React from "react";

interface BoundaryProps {
  /* An error from the state, shown like a render error */
  err?: unknown;
  children: ReactNode;
}

interface BoundaryState {
  err: unknown;
  errInfo: ErrorInfo | null;
}

function describeErr(err: unknown): string {
  if (err instanceof Error) {
    return err.toString();
  }
  if (typeof err === "string") {
    return err;
  }
  return JSON.stringify(err);
}

/* The component stack for render errors. Otherwise, the error's stack */
function getErrStack(
  err: unknown,
  errInfo: ErrorInfo | null,
): string | undefined {
  const componentStack = errInfo?.componentStack;
  if (componentStack) {
    return componentStack;
  }
  return err instanceof Error ? err.stack : undefined;
}

/* Error boundaries must be class components */
class Boundary extends React.PureComponent<BoundaryProps, BoundaryState> {
  constructor(props: BoundaryProps) {
    super(props);
    this.state = { err: null, errInfo: null };
  }

  override componentDidCatch(err: unknown, errInfo: ErrorInfo): void {
    this.setState({ err, errInfo });
  }

  override render(): ReactNode {
    const { children } = this.props;
    const err: unknown = this.props.err ?? this.state.err;
    if (err) {
      const { errInfo } = this.state;
      const errStack = getErrStack(err, errInfo);
      return (
        <div className="main-err-container absolute-center">
          <div className="main-err-sign">
            <i className="fa fa-exclamation-circle main-err-icon danger" />
            <div className="main-err-text">
              <h1 className="main-err-title">Oops...</h1>
              <h4>Something went wrong. Try again later.</h4>
            </div>
          </div>
          <details className="pre-wrap">
            {describeErr(err)}
            <br />
            {errStack}
          </details>
        </div>
      );
    }
    return children;
  }
}

export { Boundary };
