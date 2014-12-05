﻿var Q = require('q'),
    _ = require('underscore');

module.exports = function (entity, database) {
    var indexes = entity.indexes,
        existingColumns, existingIndexes;

    return loadTableData()
        .then(createTable)
        .then(createIndexes);

    function loadTableData(name) {
        return database.all("pragma table_info(" + entity.name + ")")
            .then(function (rows) {
                existingColumns = _.pluck(rows, 'name');
                return database.all("pragma index_list(" + entity.name + ")")
            })
            .then(function (rows) {
                existingIndexes = _.pluck(rows, 'name');
            });
    }

    function createTable() {
        if (existingColumns.length === 0)
            return database.run("create table " + entity.name + " (__key integer primary key autoincrement, __content text)");
    }

    function createIndexes() {
        return Q.all(_.map(indexes, function (index) {
            if (!indexExists(index)) {
                return Q.all(createIndexColumns()).then(createIndex);
            }

            function createIndexColumns() {
                if (index.constructor === Array)
                    return _.map(index, createIndexColumn);
                return [createIndexColumn(index)];
            }

            function createIndexColumn(path) {
                if(!columnExists(path))
                return database.run("alter table " + entity.name + " add column " + indexName(path) + " text");
            }

            function createIndex() {
                return database.run("create index " + indexName(index) + " on " + entity.name + " (" + indexColumns(index) + ")");
            }

            function indexColumns() {
                if (index.constructor === Array)
                    return _.map(index, indexName).join(',');
                return indexName(index);
            }

            function indexExists() {
                return existingIndexes.indexOf(indexName(index)) > -1;
            }

            function columnExists(path) {
                return existingColumns.indexOf(indexName(path)) > -1;
            }
        }));
    }

    function indexName(index) {
        if (index.constructor === Array)
            return _.map(index, indexName).join('__');
        return index.replace(/\./g, '_');
    }
};