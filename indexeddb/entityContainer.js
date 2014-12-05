var indexes = require('./indexes'),
    keyPath = require('tribe.expressions/keyPath');

module.exports = function (store, definition) {
    return {
        store: function (entity) {
            return store.add(entity).then(function (result) {
                if (definition.keyPath)
                    keyPath.set(definition.keyPath, entity, result);
                return entity;
            });
        },
        retrieve: function (expression) {
            return store.index(indexes.indexName(expression), indexes.convertExpression(expression));
        }
    };
};