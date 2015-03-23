var keyPath = require('tribe.expressions/keyPath'),
    evaluate = require('tribe.expressions/evaluate'),
    promises = require('./promises'),
    sequence = require('./sequence');

module.exports = function (entityData) {
    var entities = {},
        seq = sequence();

    return {
        store: function (entity) {
            if(entity.constructor === Array)
                for(var i = 0, l = entity.length; i < l; i++)
                    storeEntity(entity[i]);
            else
                storeEntity(entity);
            return promises.resolved(entity);
        },
        retrieve: function (expression) {
            var results = [];
            for(var id in entities)
                if(entities.hasOwnProperty(id) && evaluate(expression, entities[id]))
                    results.push(entities[id]);
            return promises.resolved(results);
        }
    }

    function storeEntity(entity) {
        var id = keyPath(entityData.keyPath || '__keyPath', entity);
        if(!id) {
            id = seq.next();
            if(entityData.keyPath)
                keyPath.set(entityData.keyPath, entity, id);
        }

        entities[id] = entity;
        return entity;
    }
};
