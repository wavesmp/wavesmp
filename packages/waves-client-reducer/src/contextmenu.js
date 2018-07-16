const actionTypes = require('waves-action-types')

/* State is list of objects describing a context menu. e.g.
 * [
 *   {
 *     type - describes the type of context menu. Maps to a component
 *     x - left coordinate of contextmenu
 *     y - top coordinate of contextmenu
 *     props - props passed to the context menu component
 *   }
 * ]
 */
const initialState = [
]

function contextmenu(state = initialState, action) {
  switch (action.type) {
    case actionTypes.CONTEXTMENU_RESET: {
      return []
    }
    case actionTypes.CONTEXTMENU_SET: {
      const { menu } = action
      return [menu]
    }
    // Context menu set must be called before this
    case actionTypes.CONTEXTMENU_NEXT: {
      const { menu } = action
      const numMenus = state.length
      const oldMenu = state[numMenus - 1]
      menu.x = oldMenu.x
      menu.y = oldMenu.y
      return [...state, menu]
    }
    // Context menu next should be called before this
    case actionTypes.CONTEXTMENU_BACK: {
      const newState = [...state]
      newState.pop()
      return newState
    }
    default:
      return state
  }
}

module.exports = contextmenu
