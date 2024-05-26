import { Name, State, Time, Artist, Album, Genre, CreatedAt } from "./rows";

export const playlistColumns = [
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

export const libraryColumns = playlistColumns.map((col) => ({
  ...col,
  sortable: !!col.attribute,
}));

export const uploadColumns = playlistColumns.filter(
  (c) => c.title !== "Created At",
);
