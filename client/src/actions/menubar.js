import { actionTypes } from "src/actionTypes";

function menubarSet(menubar) {
  return { type: actionTypes.MENUBAR_SET, menubar };
}

export { menubarSet };
