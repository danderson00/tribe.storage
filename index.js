var open = require('./open'),
    stores = {
        sqlite3: require('./sqlite3')
    };

module.exports = {
    open: function (entities, options) {
        options = options || {};
        options.type = options.type || 'sqlite3';
        return open(stores[options.type], entities, options);
    }
}