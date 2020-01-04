const { getPlaylistSelectors } = require('waves-client-selectors')
const { getPlaylistNameFromRoute } = require('waves-client-util')

const { pause, play } = require('./playing')
const { selectionClearAndAdd } = require('./playlists')
const { trackToggle } = require('./toggle')

function tracksKeyDown(ev, history) {
  return async (dispatch, getState) => {
    const { key, target } = ev
    const { tagName, contentEditable } = target
    if (tagName === 'INPUT' || contentEditable === 'true') {
      return
    }

    switch (key) {
      case ' ': {
        const { track, isPlaying } = getState().tracks.playing
        if (track) {
          ev.preventDefault()
          if (isPlaying) {
            dispatch(pause())
          } else {
            await dispatch(play())
          }
          return
        }
      }
      // Fall through (treat as track toggle)
      case 'Enter':
      case 'j':
      case 'k':
      case 'h':
      case 'l': {
        const { location } = history
        const { search, pathname } = location
        const playlistName = getPlaylistNameFromRoute(pathname)
        if (!playlistName) {
          return
        }
        const playlistSelectors = getPlaylistSelectors(playlistName)
        if (!playlistSelectors) {
          return
        }
        const props = playlistSelectors.getPlaylistProps(getState(), search)
        if (!props.loaded) {
          return
        }
        playlistKeyDown(ev, history, dispatch, key, playlistName, props)
      }
    }
  }
}

function playlistKeyDown(ev, history, dispatch, key, playlistName, props) {
  switch (key) {
    case 'h': {
      const { currentPage } = props
      if (currentPage < 1) {
        return
      }
      const { search, pathname } = history
      const qp = new URLSearchParams(search)
      qp.set('page', currentPage - 1)
      history.push({ pathname, search: qp.toString() })
      break
    }
    case 'l': {
      const { currentPage, lastPage } = props
      if (currentPage >= lastPage) {
        return
      }
      const { search, pathname } = history
      const qp = new URLSearchParams(search)
      qp.set('page', currentPage + 1)
      history.push({ pathname, search: qp.toString() })
      break
    }
    case 'k':
    case 'j': {
      const { displayItems, selection } = props
      const n = displayItems.length
      if (n === 0) {
        return
      }
      let i
      if (key === 'j') {
        i = n - 1
        if (selection.has(displayItems[i].index)) {
          return
        }
        while (i > 0) {
          i -= 1
          if (selection.has(displayItems[i].index)) {
            i += 1
            break
          }
        }
      } else {
        i = 0
        if (selection.has(displayItems[i].index)) {
          return
        }
        while (i < n - 1) {
          i += 1
          if (selection.has(displayItems[i].index)) {
            i -= 1
            break
          }
        }
      }
      dispatch(
        selectionClearAndAdd(
          playlistName,
          displayItems[i].index,
          displayItems[i].id,
          displayItems
        )
      )
      break
    }
    case ' ':
    case 'Enter': {
      const { displayItems, selection } = props
      if (displayItems.length === 0 || selection.size === 0) {
        return
      }
      for (const item of displayItems) {
        if (selection.has(item.index)) {
          if (key === ' ') {
            ev.preventDefault()
          }
          dispatch(trackToggle(item.id, playlistName, item.index))
        }
      }
    }
  }
}

module.exports.tracksKeyDown = tracksKeyDown
