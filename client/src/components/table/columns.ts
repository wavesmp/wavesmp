import { Album, Artist, CreatedAt, Genre, Name, State, Time } from "./rows";
import type { Column } from "./tableTypes";

const playlistColumns: Column[] = [
  {
    title: "Name",
    attribute: "title",
    Component: Name,
  },
  {
    title: "State",
    Component: State,
  },
  {
    title: "Time",
    attribute: "duration",
    Component: Time,
  },
  {
    title: "Artist",
    attribute: "artist",
    Component: Artist,
  },
  {
    title: "Album",
    attribute: "album",
    Component: Album,
  },
  {
    title: "Genre",
    attribute: "genre",
    Component: Genre,
  },
  {
    title: "Created At",
    attribute: "createdAt",
    Component: CreatedAt,
  },
];

const libraryColumns: Column[] = playlistColumns.map((col) => ({
  ...col,
  sortable: !!col.attribute,
}));

const uploadColumns: Column[] = playlistColumns.filter(
  (c) => c.title !== "Created At",
);

export { libraryColumns, playlistColumns, uploadColumns };
