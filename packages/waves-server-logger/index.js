const log = require('winston');

log.remove(log.transports.Console);

log.add(log.transports.Console, {
    formatter: function(options) {
      var rawMsg = (options.message !== undefined ? options.message : '');
      var rawMeta
      try {
        rawMeta = (options.meta && Object.keys(options.meta).length ?
                   '\n' + JSON.stringify(options.meta, null, 3) : '' );
      } catch (e) {
        rawMeta = options.meta
      }
      var msg = '[' + options.level + '] ' + rawMsg + rawMeta;
      return log.config.colorize(options.level, msg);
    }
  }
);

log.level = 'debug'
module.exports = log
