import ObjectID from 'bson-objectid'
import * as musicmetadata from 'music-metadata-browser'

/* Given the raw file to be uploaded,
 * return file metadata in an object. */
export default async function processTrack(file) {
  const metadata = await musicmetadata.parseBlob(file, {
    duration: true,
    native: true
  })
  const { common, format } = metadata
  const { title, artists, albumartist, album, genre } = common
  const { duration } = format
  const upload = {
    id: ObjectID().toString(),
    source: 'file',
    title: title && title.trim(),
    artist: (artists && artists.map(trim).join(', ')) || albumartist,
    album: album && album.trim(),
    genre: genre && genre.map(trim).join(', '),
    duration,
    file
  }

  addMissingTags(upload)
  // TODO use picture
  return upload
}

function addMissingTags(item) {
  if (!item.title || !item.artist) {
    const fileName = trimFileExt(item.file.name.trim())
    const parts = fileName.split('-')
    if (parts.length == 2) {
      const [artist, title] = parts
      item.artist = item.artist || artist.trim()
      item.title = item.title || title.trim()
    } else {
      if (!item.title) {
        item.title = fileName.trim()
        item.artist = item.artist || `Unknown artist`
      } else {
        item.artist = fileName.trim()
        item.title = item.title || `Unknown title`
      }
    }
  }
  const tag = 'genre'
  item[tag] = item[tag] || `Unknown ${tag}`
}

function trimFileExt(name) {
  return name.substring(0, name.lastIndexOf('.')) || name
}

function trim(s) {
  return s.trim()
}
