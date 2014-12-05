var queries = require('./queries'),
    keyPath = require('tribe.expressions/keyPath'),
    _ = require('underscore'),
    Q = require('q');

module.exports = function (entityData, database) {
    return {
        store: function (entities) {
            if (entities.constructor === Array)
                return Q.all(_.map(entities, storeEntity));
            return storeEntity(entities);

            function storeEntity(entity) {
                return database
                    .run(queries.store(entityData.name, entityData.indexes, entity))
                    .then(function (result) {
                        if (entityData.keyPath)
                            keyPath.set(entityData.keyPath, entity, result);
                        return entity;
                    });
            }
        },
        retrieve: function (predicates) {
            return database.all(queries.retrieve(entityData.name, predicates)).then(function (rows) {
                return _.map(rows, function (row) {
                    return JSON.parse(row.__content);
                });
            });
        }
    };
}
