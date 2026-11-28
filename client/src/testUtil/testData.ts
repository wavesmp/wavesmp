/*
 * Shared test fixtures. Some values (e.g. the modal and toast types, and the
 * track sources) are not valid values of their types. The code under test
 * passes them through, so they are cast to the types
 */
import type { Modal, Toast, User } from "src/types/stateTypes";
import type { Track } from "src/types/trackTypes";

const TEST_MODAL1 = {
  type: "type1",
  props: {
    prop: "prop1",
  },
} as unknown as Modal;

const TEST_USER1: User & { idp: string } = {
  idp: "testIdp1",
  idpId: "testIdpId1",
  email: "testEmail1",
  name: "testName1",
};

const TEST_USER1_UPDATE: Partial<User> = {
  email: "testUpdatedEmail1",
  name: "testUpdatedName1",
};

const TEST_USER2: User & { idp: string } = {
  idp: "testIdp2",
  idpId: "testIdpId2",
  email: "testEmail2",
  name: "testName2",
};

const TEST_USER2_UPDATE: Partial<User> = {
  email: "testUpdatedEmail2",
  name: "testUpdatedName2",
};

const TEST_TRACK1 = {
  title: "testTitle1",
  artist: "testArtist1",
  album: "testAlbum1",
  genre: "testGenre1",
  duration: 61.7,
  source: "testSource1",
} as unknown as Omit<Track, "id">;

const TEST_TRACK1_UPDATE: Pick<Track, "title" | "artist" | "album" | "genre"> =
  {
    title: "testUpdatedTitle1",
    artist: "testUpdatedArtist1",
    album: "testUpdatedAlbum1",
    genre: "testUpdatedGenre1",
  };

const TEST_TRACK2 = {
  title: "testTitle2",
  artist: "testArtist2",
  album: "testAlbum2",
  genre: "testGenre2",
  duration: 62.7,
  source: "testSource2",
} as unknown as Omit<Track, "id">;

const TEST_TRACK2_UPDATE: Pick<Track, "title" | "artist" | "album" | "genre"> =
  {
    title: "testUpdatedTitle2",
    artist: "testUpdatedArtist2",
    album: "testUpdatedAlbum2",
    genre: "testUpdatedGenre2",
  };

const TEST_TOAST1 = {
  id: 1,
  type: "testType1",
  msg: "testMsg1",
} as unknown as Toast;

const TEST_TOAST2 = {
  id: 2,
  type: "testType2",
  msg: "testMsg2",
} as unknown as Toast;

const TEST_PLAYLIST_NAME1 = "testPlaylistName1";

const TEST_PLAYLIST_NAME2 = "testPlaylistName2";

const TEST_PLAYLIST_COPY_NAME1 = "testPlaylistCopyName1";

const TEST_PLAYLIST_COPY_NAME2 = "testPlaylistCopyName2";

const TEST_PLAYLIST_MOVE_NAME1 = "testPlaylistMoveName1";

const TEST_PLAYLIST_MOVE_NAME2 = "testPlaylistMoveName2";

const TEST_IDP = "testIdp";

const TEST_TRACK_ID = "testTrackId";

const TEST_SEARCH = "testSearch";

const TEST_TOKEN = "testToken";

const TEST_INDEX = "testIndex";

const TEST_SELECTION = "testSelection";

const TEST_SORT_KEY = "testSortKey";

const TEST_ASCENDING = "testAscending";

export {
  TEST_ASCENDING,
  TEST_IDP,
  TEST_INDEX,
  TEST_MODAL1,
  TEST_PLAYLIST_COPY_NAME1,
  TEST_PLAYLIST_COPY_NAME2,
  TEST_PLAYLIST_MOVE_NAME1,
  TEST_PLAYLIST_MOVE_NAME2,
  TEST_PLAYLIST_NAME1,
  TEST_PLAYLIST_NAME2,
  TEST_SEARCH,
  TEST_SELECTION,
  TEST_SORT_KEY,
  TEST_TOAST1,
  TEST_TOAST2,
  TEST_TOKEN,
  TEST_TRACK1,
  TEST_TRACK1_UPDATE,
  TEST_TRACK2,
  TEST_TRACK2_UPDATE,
  TEST_TRACK_ID,
  TEST_USER1,
  TEST_USER1_UPDATE,
  TEST_USER2,
  TEST_USER2_UPDATE,
};
