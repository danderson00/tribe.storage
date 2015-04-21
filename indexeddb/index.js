var open = require('./db/open'),
    reset = require('./reset'),
    metadata = require('./metadata'),
    upgrade = require('./upgrade'),
    entityContainer = require('./entityContainer'),
    Q = require('q'),

    entitiesHaveChanged = require('tribe.storage/utilities/metadata').entitiesHaveChanged,

    db;

var api = module.exports = {
    open: function (options, entities) {
        options = options || {};

        return Q.when(resetIfRequired())
            .then(metadata)
            .then(function (oldData) {
                if(!oldData || entitiesHaveChanged(oldData.entities, entities)) {
                    var version = (oldData ? oldData.version : 0) + 1,
                        provider;

                    return open('__entities', version, upgrade(entities, oldData && oldData.entities))
                        .then(function (newProvider) {
                            provider = newProvider;
                            return metadata(version, entities);
                        })
                        .then(function () {
                            return provider;
                        });
                } else {
                    return open(oldData.name, oldData.version);
                }
            })
            .then(function (database) {
                db = database;
            });

        function resetIfRequired() {
            if (options.reset)
                return reset();
        }
    },
    entityContainer: function (entity) {
        return entityContainer(db.store(entity), entity);
    },
    close: function () {
        db && db.close();
        metadata.close();
    }
};
