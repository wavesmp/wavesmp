import { combineReducers } from "./combineReducers";

import { account } from "./account";
import { err } from "./err";
import { layout } from "./layout";
import { menu } from "./menu";
import { menubar } from "./menubar";
import { modal } from "./modal";
import { sidebar } from "./sidebar";
import { toasts } from "./toasts";
import { tracks } from "./tracks";

const rootReducer = combineReducers({
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
