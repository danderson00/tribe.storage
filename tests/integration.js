module.exports = function (options, suite, test, expect, teardown) {
    suite('tribe.storage.integration.' + options.type, function () {
        var storage = require('tribe.storage'),
            db;

        test("basic store and retrieve", function () {
            return open(['p1', 'p2'],
                [
                    { p1: 1, p2: 'test' },
                    { p1: 2, p2: 'test2' }
                ])
                .then(function (container) {
                    return container.retrieve({ p: 'p1', v: 1 });
                })
                .then(function (rows) {
                    expect(rows.length).to.equal(1);
                    delete rows[0].id;
                    expect(rows[0]).to.deep.equal({ p1: 1, p2: 'test' });
                });
        });

        test("multiple key index store and retrieve", function () {
            return open([['p1', 'p2']],
                [
                    { p1: 'test', p2: 1 },
                    { p1: 'test', p2: 2 },
                    { p1: 'test', p2: 3 },
                    { p1: 'test2', p2: 2 },
                ])
                .then(function (container) {
                    return container.retrieve([{ p: 'p1', v: 'test' }, { p: 'p2', o: '>=', v: 2 }]);
                })
                .then(function (rows) {
                    expect(rows.length).to.equal(2);
                });
        });

        test("multiple key order does not need to match expression order", function () {
            return open([['p1', 'p2']], [{ p1: 'test', p2: 1 }])
                .then(function (container) {
                    return container.retrieve([{ p: 'p2', v: 1 }, { p: 'p1', v: 'test' }]);
                })
                .then(function (rows) {
                    expect(rows.length).to.equal(1);
                });
        });

        test("complex object store and retrieve", function () {
            return open([['p1.p2', 'p3']],
                [
                    { p1: { p2: 'test' }, p3: 1 },
                    { p1: { p2: 'test' }, p3: 1 },
                    { p1: { p2: 'test2' }, p3: 1 }
                ])
                .then(function (container) {
                    return container.retrieve([{ p: 'p1.p2', v: 'test' }, { p: 'p3', v: 1 }]);
                })
                .then(function (rows) {
                    expect(rows.length).to.equal(2);
                });
        });

        test("add operation returns entity with autoIncrement keyPath property set", function () {
            return open([], [], 'id')
                .then(function (container) {
                    return container.store({});
                })
                .then(function (updatedEntity) {
                    expect(updatedEntity).to.deep.equal({ id: 1 });
                });
        });

        test("multiple add operation returns entities with autoIncrement keyPath property set", function () {
            return open([], [], 'id')
                .then(function (container) {
                    return container.store([{}, {}]);
                })
                .then(function (updatedEntity) {
                    expect(updatedEntity).to.deep.equal([{ id: 1 }, { id: 2 }]);
                });
        });

        test("stored entity has autoIncrement keyPath property set", function () {
            var container;
            return open([], [], 'id')
                .then(function (db) {
                    container = db;
                    return container.store({});
                })
                .then(function () {
                    return container.retrieve({ p: 'id', v: 1 });
                })
                .then(function (entities) {
                    expect(entities.length).to.equal(1);
                    expect(entities[0]).to.deep.equal([{ id: 1 }, { id: 2 }]);
                });
        });

        function open(indexes, entities, keyPath) {
            var entity;

            return storage.open([{ name: 'test', indexes: indexes, keyPath: keyPath, autoIncrement: true }], options)
                .then(function (provider) {
                    db = provider;
                    entity = provider.entity('test');
                    return entity.store(entities);
                })
                .then(function () {
                    return entity;
                });
        }

        teardown(function () {
            db.close();
        });
    });

};