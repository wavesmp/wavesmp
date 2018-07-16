const Fuse = require('fuse.js')

function trackSearch(items, searchString) {
  /* TODO this search is probably not meant for a music library.
   * Consider replacing */
  const options = {
    keys: ['title', 'artist', 'album', 'genre'],
    shouldSort: false,
    threshold: 0.2
  }
  const fuse = new Fuse(items, options)
  return fuse.search(searchString)
}

module.exports = trackSearch
