const types = require("waves-action-types");

function sidebarSet(sidebar) {
  return { type: types.SIDEBAR_SET, sidebar };
}

module.exports.sidebarSet = sidebarSet;
