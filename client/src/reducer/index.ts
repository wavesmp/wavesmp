import type { Reducer } from "src/types/actionTypes";
import type { State } from "src/types/stateTypes";

import { account } from "./account";
import { combineReducers } from "./combineReducers";
import { err } from "./err";
import { layout } from "./layout";
import { menu } from "./menu";
import { menubar } from "./menubar";
import { modal } from "./modal";
import { sidebar } from "./sidebar";
import { toasts } from "./toasts";
import { tracks } from "./tracks";

const rootReducer: Reducer<State> = combineReducers<State>({
  account,
  err,
  layout,
  menu,
  menubar,
  modal,
  sidebar,
  toasts,
  tracks,
});

export { rootReducer };
