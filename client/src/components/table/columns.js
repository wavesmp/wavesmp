import { Album, Artist, CreatedAt, Genre, Name, State, Time } from "./rows";

const playlistColumns = [
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

const libraryColumns = playlistColumns.map((col) => ({
  ...col,
  sortable: !!col.attribute,
}));

const uploadColumns = playlistColumns.filter((c) => c.title !== "Created At");

export { libraryColumns, playlistColumns, uploadColumns };
