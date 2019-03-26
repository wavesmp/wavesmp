const Fuse = require('fuse.js')

function trackSearch(items, searchString) {
  const options = {
    keys: ['title', 'artist', 'album', 'genre'],
    shouldSort: false,
    threshold: 0.2
  }
  const fuse = new Fuse(items, options)
  return fuse.search(searchString)
}

module.exports = trackSearch
