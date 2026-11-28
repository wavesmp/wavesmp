import ObjectID from "bson-objectid";
import { parseBlob } from "music-metadata";

import type { Track } from "src/types/trackTypes";

/* An upload, before missing tags are filled in */
type RawUpload = Omit<Track, "title" | "artist" | "album" | "genre"> & {
  title: string | undefined;
  artist: string | undefined;
  album: string | undefined;
  genre: string | undefined;
  file: File;
};

/* Given the raw file to be uploaded,
 * return file metadata in an object. */
async function processTrack(file: File): Promise<Track & { file: File }> {
  const metadata = await parseBlob(file, { duration: true });
  const { common, format } = metadata;
  /* A list of artists is only set when the file stores several. Otherwise,
   * the single credit is in artist */
  const { title, artist, artists, albumArtist, album, genres } = common;
  const { duration } = format;
  const upload: RawUpload = {
    id: new ObjectID().toHexString(),
    source: "file",
    title: title?.trim(),
    artist: firstTag(
      artists ? artists.map(trim).join(", ") : artist?.trim(),
      albumArtist,
    ),
    album: album?.trim(),
    genre: genres?.map(trim).join(", "),
    duration: duration ?? 0,
    file,
  };

  // TODO use picture
  return addMissingTags(upload);
}

function addMissingTags(item: RawUpload): Track & { file: File } {
  let { title, artist } = item;
  if (!title || !artist) {
    const fileName = trimFileExt(item.file.name.trim());
    const parts = fileName.split("-");
    const [partArtist, partTitle] = parts;
    if (
      parts.length === 2 &&
      partArtist !== undefined &&
      partTitle !== undefined
    ) {
      artist = firstTag(artist, partArtist.trim());
      title = firstTag(title, partTitle.trim());
    } else if (title) {
      artist = fileName.trim();
    } else {
      title = fileName.trim();
    }
  }
  return {
    ...item,
    title,
    artist: artist ?? "",
    album: firstTag(item.album, "Unknown album"),
    genre: firstTag(item.genre, "Unknown genre"),
  };
}

/* The first tag that is set. Empty tags are not set */
function firstTag(tag: string | undefined, fallback: string): string;
function firstTag(...tags: (string | undefined)[]): string | undefined;
function firstTag(...tags: (string | undefined)[]): string | undefined {
  return tags.find((tag) => tag);
}

function trimFileExt(name: string): string {
  return name.substring(0, name.lastIndexOf(".")) || name;
}

function trim(s: string): string {
  return s.trim();
}

export { processTrack };
