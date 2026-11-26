import type { Reducer } from "src/types/actionTypes";
import type { TracksState } from "src/types/stateTypes";

import { combineReducers } from "../combineReducers";
import { reducerLibraries as libraries } from "./libraries";
import { reducerPlaying as playing } from "./playing";
import { reducerPlaylists as playlists } from "./playlists";

const tracks: Reducer<TracksState> = combineReducers<TracksState>({
  libraries,
  playlists,
  playing,
});

export { tracks };
