const types = require("waves-action-types");

function layoutSet(layout) {
  return { type: types.LAYOUT_SET, layout };
}

module.exports.layoutSet = layoutSet;
