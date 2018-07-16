const types = require('waves-action-types')

function uploadInfoUpdate(id, attr, update) {
  return { type: types.UPLOAD_TRACK_UPDATE, id, attr, update }
}

module.exports.uploadInfoUpdate = uploadInfoUpdate
