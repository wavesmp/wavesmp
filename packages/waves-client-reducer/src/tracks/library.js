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

      const libraryUpdate = {...library}
      for (const deleteId of deleteIds) {
        delete libraryUpdate[deleteId]
      }
      return libraryUpdate
    }
    case actionTypes.LIBRARY_TRACK_UPDATE: {
      const track = library[action.id]
      return {...library, [action.id]: {
          ...track,
          [action.attr]: action.update
        }
      }
    }
    default:
      return library
  }
}

module.exports = reducerLibrary

