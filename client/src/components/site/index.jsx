import { memo } from "react";

import { useAccount, useActions, useErr, useToasts } from "src/providers/hooks";

import "./index.css";

import { Boundary } from "../boundary";
import { MenuBar } from "../menubar/site";
import { Toasts } from "../toasts";
import { Preview } from "./preview";
import { SignIn } from "./signin";

const Site = memo(function Site() {
  const actions = useActions();
  const err = useErr();
  const { theme } = useAccount();
  const toasts = useToasts();

  return (
    <Boundary err={err}>
      <>
        <MenuBar />
        <SignIn actions={actions} />
        <Preview theme={theme} />
        <Toasts actions={actions} toasts={toasts} />
      </>
    </Boundary>
  );
});

export { Site };
