const actionTypes = require('waves-action-types')

/* library maps track ids to tracks. Tracks contain:
 * - Title
 * - Artist
 * - Genre
 * - etc...
 */
const initialLibrary = null

function reducerLibrary(library = initialLibrary, action) {
  switch (action.type) {
    case actionTypes.TRACKS_UPDATE:
      return action.libraryById
    case actionTypes.TRACKS_DELETE: {
      const { deleteIds } = action

      const libraryUpdate = { ...library }
      for (const deleteId of deleteIds) {
        delete libraryUpdate[deleteId]
      }
      return libraryUpdate
    }
    case actionTypes.LIBRARY_TRACK_UPDATE: {
      const { ids, key, value } = action
      const libraryUpdate = { ...library }
      for (const id of ids) {
        libraryUpdate[id] = { ...library[id], [key]: value }
      }
      return libraryUpdate
    }
    default:
      return library
  }
}

module.exports = reducerLibrary
