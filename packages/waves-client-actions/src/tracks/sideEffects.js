function download(id) {
  return (dispatch, getState, { player }) => {
    const { tracks } = getState()
    const { library } = tracks
    // TODO should refactor with getTrackById.. but without uploads
    const track = library[id]

    player.download(track)
  }
}

module.exports.download = download
