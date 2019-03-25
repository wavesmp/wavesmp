import ObjectID from 'bson-objectid'
const musicmetadata = require('musicmetadata')

/* Given the raw file to be uploaded,
 * return file metadata in an object. */
export default function processTrack(file) {
  return new Promise((resolve, reject) => {
    musicmetadata(file, { duration: true }, (err, metadata) => {
      if (err) {
        reject(err)
        return
      }

      const upload = {
        id: ObjectID().toString(),
        source: 'file',
        title: metadata.title.trim(),
        artist: metadata.artist.map(trim).join(', '),
        album: metadata.album.trim(),
        genre: metadata.genre.map(trim).join(', '),
        duration: metadata.duration,
        file
      }

      addMissingTags(upload)

      // const pictures = metadata.picture;
      // const numPictures = pictures.length
      // if (numPictures > 0) {
      //   if (numPictures > 1) {
      //     console.log('Detected multiple pictures for track. Using only first one')
      //   }
      //   // picture has format (string) and data (Uint8Array) attributes
      //   const picture = pictures[0];
      //   upload.image = URL.createObjectURL(...)
      //   upload.picture = picture
      // }
      // // TODO do sth w picture. not used atm

      resolve(upload)
    })
  })
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
