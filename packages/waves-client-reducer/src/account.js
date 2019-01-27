const actionTypes = require('waves-action-types')

const initialState = {
  columns: null,
  rowsPerPage: null,
  user: null,
  /* Application starts by fetching user */
  fetchingUser: true,
  theme: 'light'
}

function account(state = initialState, action) {
  switch (action.type) {
    case actionTypes.ACCOUNT_LOGIN: {
      const { user } = action
      return {...state, user, fetchingUser: false }
    }
    case actionTypes.ACCOUNT_SET_SETTINGS: {
      const { columns, rowsPerPage, theme } = action
      return {...state, columns, rowsPerPage, theme }
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
