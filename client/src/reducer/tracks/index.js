import { combineReducers } from "../combineReducers";

import { reducerLibraries as libraries } from "./libraries";
import { reducerPlaying as playing } from "./playing";
import { reducerPlaylists as playlists } from "./playlists";

const tracks = combineReducers({
  libraries,
  playlists,
  playing,
});

export { tracks };
