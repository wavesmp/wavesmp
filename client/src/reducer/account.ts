import { actionTypes } from "src/actionTypes";
import type { ReducerAction } from "src/types/actionTypes";
import type { Account } from "src/types/stateTypes";

const initialState: Account = {
  columns: null,
  rowsPerPage: null,
  user: null,
  /* Application starts by fetching user */
  fetchingUser: true,
  theme: "light",
};

function account(
  state: Account = initialState,
  action: ReducerAction,
): Account {
  switch (action.type) {
    case actionTypes.ACCOUNT_LOGIN: {
      const { user } = action;
      return { ...state, user, fetchingUser: false };
    }
    case actionTypes.ACCOUNT_SET_SETTINGS: {
      const { settings } = action;
      return { ...state, ...settings };
    }
    case actionTypes.ACCOUNT_SET_FETCHING_USER: {
      const { fetchingUser } = action;
      return { ...state, fetchingUser };
    }
    default:
      return state;
  }
}

export { account };
