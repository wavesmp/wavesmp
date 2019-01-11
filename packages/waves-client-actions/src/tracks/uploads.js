const types = require('waves-action-types')

function uploadInfoUpdate(id, key, value) {
  return { type: types.UPLOAD_TRACKS_UPDATE, ids: [id], key, value }
}

module.exports.uploadInfoUpdate = uploadInfoUpdate
