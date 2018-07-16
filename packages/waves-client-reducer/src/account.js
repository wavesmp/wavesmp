const actionTypes = require('waves-action-types')

const initialState = {
  columns: null,
  rowsPerPage: null,
  user: null,
  /* Application starts by fetching user */
  fetchingUser: true
}

function account(state = initialState, action) {
  switch (action.type) {
    case actionTypes.ACCOUNT_LOGIN: {
      const { user } = action
      return {...state, user, fetchingUser: false }
    }
    case actionTypes.ACCOUNT_SET_SETTINGS: {
      const { columns, rowsPerPage } = action
      return {...state, columns, rowsPerPage }
    }
    case actionTypes.ACCOUNT_SET_FETCHING_USER: {
      const { fetchingUser } = action
      return {...state, fetchingUser }
    }
    default:
      return state
  }
}

module.exports = account
