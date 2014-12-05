module.exports = function (entities, previousEntities) {
    return function (database, transaction) {
        for(var i = 0, l = entities.length; i < l; i++) {
            var entity = entities[i],
                store = retriveStore(entity);

            if(entity.indexes)
                for (var j = 0, l2 = entity.indexes.length; j < l2; j++)
                    createIndex(store, entity.indexes[j]);
        }

        function retriveStore(entity) {
            if (!database.objectStoreNames.contains(entity.name))
                return database.createObjectStore(entity.name, {
                    autoIncrement: entity.autoIncrement || !entity.keyPath,
                    keyPath: entity.keyPath
                });

            return transaction.objectStore(entity.name);
        }

        function createIndex(store, index) {
            var name = indexName(index);

            if (!store.indexNames.contains(name))
                store.createIndex(name, index, { unique: false });
        }
    };
}

function indexName(index) {
    if (index.constructor === Array)
        return index.sort().join('_');
    return index;
}
