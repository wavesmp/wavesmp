import ObjectID from "bson-objectid";
import { parseBlob } from "music-metadata";

/* Given the raw file to be uploaded,
 * return file metadata in an object. */
async function processTrack(file) {
  const metadata = await parseBlob(file, { duration: true });
  const { common, format } = metadata;
  /* A list of artists is only set when the file stores several. Otherwise,
   * the single credit is in artist */
  const { title, artist, artists, albumArtist, album, genres } = common;
  const { duration } = format;
  const upload = {
    id: ObjectID().toString(),
    source: "file",
    title: title && title.trim(),
    artist:
      (artists ? artists.map(trim).join(", ") : artist && artist.trim()) ||
      albumArtist,
    album: album && album.trim(),
    genre: genres && genres.map(trim).join(", "),
    duration,
    file,
  };

  addMissingTags(upload);
  // TODO use picture
  return upload;
}

function addMissingTags(item) {
  if (!item.title || !item.artist) {
    const fileName = trimFileExt(item.file.name.trim());
    const parts = fileName.split("-");
    if (parts.length === 2) {
      const [artist, title] = parts;
      item.artist = item.artist || artist.trim();
      item.title = item.title || title.trim();
    } else if (item.title) {
      item.artist = fileName.trim();
    } else {
      item.title = fileName.trim();
    }
  }
  for (const tag of ["album", "genre"]) {
    item[tag] = item[tag] || `Unknown ${tag}`;
  }
}

function trimFileExt(name) {
  return name.substring(0, name.lastIndexOf(".")) || name;
}

function trim(s) {
  return s.trim();
}

export { processTrack };
