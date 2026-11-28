import { actionTypes } from "src/actionTypes";
import { MENU_WIDTH } from "src/constants";
import type { WavesAction } from "src/types/actionTypes";
import type { Menu } from "src/types/stateTypes";

type MenuAction<T extends WavesAction["type"]> = Extract<
  WavesAction,
  { type: T }
>;

function menuReset(): MenuAction<typeof actionTypes.MENU_RESET> {
  return { type: actionTypes.MENU_RESET };
}

function getTransform(x: number, y: number): string {
  const { pageXOffset, innerWidth } = window;
  const hasRightSpace = pageXOffset + innerWidth - x >= MENU_WIDTH;
  if (hasRightSpace) {
    return `translate(${x.toString()}px, ${y.toString()}px)`;
  }
  return `translate(calc(${x.toString()}px - 100%), ${y.toString()}px)`;
}

/* Set menu based on click position
 * i.e. ev.pageX, ev.pageY */
function menuSet(
  menu: Menu & { ev: Pick<MouseEvent, "pageX" | "pageY"> },
): MenuAction<typeof actionTypes.MENU_SET> {
  const { ev } = menu;
  const { pageX: x, pageY: y } = ev;
  menu.transform = getTransform(x, y);
  return { type: actionTypes.MENU_SET, menu };
}

function getOffset(elem: Element): { left: number; top: number } {
  const { left, top } = elem.getBoundingClientRect();
  return {
    left: left + window.scrollX,
    top: top + window.scrollY,
  };
}

/* Set menu based on element position
 * i.e. ev.currentTarget */
function menuSetElem(
  menu: Menu & { ev: { currentTarget: HTMLElement } },
): MenuAction<typeof actionTypes.MENU_SET> {
  const { ev } = menu;
  const { currentTarget: elem } = ev;
  const { offsetWidth: width, offsetHeight: height } = elem;
  const { left, top } = getOffset(elem);
  const x = left + width;
  const y = top + height;
  menu.transform = getTransform(x, y);
  return { type: actionTypes.MENU_SET, menu };
}

function menuNext(menu: Menu): MenuAction<typeof actionTypes.MENU_NEXT> {
  return { type: actionTypes.MENU_NEXT, menu };
}

function menuBack(): MenuAction<typeof actionTypes.MENU_BACK> {
  return { type: actionTypes.MENU_BACK };
}

export { menuBack, menuNext, menuReset, menuSet, menuSetElem };
