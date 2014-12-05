var predicateSql = require('./predicateSql'),
    expressions = require('tribe.expressions'),
    _ = require('underscore');

module.exports = {
    store: function (entityData, entity) {
        var columns = _.flatten(entityData.indexes);

        // if we've specified a keyPath and it's not an autoIncrement column, 
        // we need to explicitly populate the column value so it can be queried
        if (entityData.keyPath && !entityData.autoIncrement)
            columns.push(entityData.keyPath);

        return {
            sql: "insert into " + entityData.name + " " + columnList() + " values " + paramList(columns.length + 2),
            parameters: paramArray()
        };

        function columnList() {
            return '(' + ['__content'].concat(columnNames()).join(',') + ')';
        }

        function columnNames() {
            return _.map(columns, columnName);
        }

        function columnName(path) {
            return path.replace(/\./g, '_');
        }

        function paramArray() {
            return [JSON.stringify(entity)].concat(_.map(columns, function (index) {
                return expressions.evaluateKeyPath(index, entity);
            }));
        }
    },
    retrieve: function (entity, predicates) {
        var query = predicateSql.toSql(predicates);
        query.sql = "SELECT * FROM " + entity + query.sql;
        return query;
    }
};

function paramList(length) {
    return '(' + new Array(length).join(',?').substring(1) + ')'
}
