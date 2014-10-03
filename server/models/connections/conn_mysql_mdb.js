/**
 * Created by VinceZK on 9/16/14.
 */
var async = require('async');
var mysql = require('mysql');
var pool = mysql.createPool({
    host: 'localhost',
    user: 'nodejs',
    password: 'nodejs',
    database: 'MDB',
    port: 3306
});
var tenant_domain = '';
var entities = [];

module.exports = {
    entities: entities,

    pool: pool,

    setTenantDomain: function(tenant){
        tenant_domain = tenant;
    },

    getTenantDomain: function () {
        return tenant_domain;
    },

    loadEntities: function(waitForFinish) {
        var selectSQL1 = "select * from entity where TENANT_DOMAIN = "
            + pool.escape(tenant_domain);

        pool.query(selectSQL1, function (err, entityRows) {
            async.map(entityRows, function (entityRow, callback) {
                var entity = {
                    TENANT_DOMAIN: entityRow.TENANT_DOMAIN,
                    ENTITY_ID: entityRow.ENTITY_ID,
                    ENTITY_NAME: entityRow.ENTITY_NAME,
                    ENTITY_DESC: entityRow.ENTITY_DESC,
                    MARSHALL: entityRow.MARSHALL,
                    VERSION_NO: entityRow.VERSION_NO,
                    ATTRIBUTES: []
                }

                var selectSQL2 = "select * from attribute where TENANT_DOMAIN = "
                    + pool.escape(tenant_domain) + " and RELATION_ID = "
                    + pool.escape(entityRow.ENTITY_ID);
                pool.query(selectSQL2, function (err, attrRows) {
                    if (err)return callback(err, entityRow.ENTITY_ID);
                    for (var i in attrRows) {
                        var attribute = {
                            ATTR_GUID: attrRows[i].ATTR_GUID,
                            TENANT_DOMAIN: attrRows[i].TENANT_DOMAIN,
                            RELATION_ID: attrRows[i].RELATION_ID,
                            ATTR_NAME: attrRows[i].ATTR_NAME,
                            DATA_TYPE: attrRows[i].DATA_TYPE,
                            DATA_LENGTH: attrRows[i].DATA_LENGTH,
                            SEARCHABLE: attrRows[i].SEARCHABLE,
                            NOT_NULL: attrRows[i].NOT_NULL,
                            UNIQUE: attrRows[i].UNIQUE,
                            DOMAIN_ID: attrRows[i].DOMAIN_ID,
                            FINALIZE: attrRows[i].FINALIZE
                        };
                        entity.ATTRIBUTES.push(attribute);
                    }
                    entities.push(entity);
                    callback(null, entityRow.ENTITY_ID);
                });

            }, function (err, results) {
                if (err) {
                    console.log("There is error in loading attributes!")
                    waitForFinish(err, results);
                }
                waitForFinish(null, "Entities are initialized!" + results);
            });
        })
    },

    executeSQL: function(selectSQL,callback,waitForFinish) {
        pool.getConnection(function (err, conn) {
            if (err) {
                console.log("mySql POOL ==> " + err);
                return callback(err);
            }

            conn.query(selectSQL, function (err, rows) {
                if (err) {
                    console.log("mySql Select ==> " + err);
                    conn.release();
                    callback(err);
                }
                conn.release();
                callback(null, rows);
                if(waitForFinish !== undefined)
                   waitForFinish(null, selectSQL);
            })
        });
    }
};
