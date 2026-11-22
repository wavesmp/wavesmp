import { actionTypes } from "src/actionTypes";

function sidebarSet(sidebar) {
  return { type: actionTypes.SIDEBAR_SET, sidebar };
}

export { sidebarSet };
