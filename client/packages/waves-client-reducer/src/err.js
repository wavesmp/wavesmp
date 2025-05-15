const actionTypes = require("waves-action-types");

const initialState = null;

function err(state = initialState, action) {
  switch (action.type) {
    case actionTypes.ERR: {
      return action.err;
    }
    default:
      return state;
  }
}
module.exports = err;
