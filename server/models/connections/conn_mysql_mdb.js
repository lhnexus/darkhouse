/**
 * Created by VinceZK on 9/16/14.
 */
var debug = require('debug')('darkhouse:conn_mysql_mdb');
var async = require('async');
var mysql = require('mysql');
var pool = mysql.createPool({
    host: 'localhost',
    user: 'nodejs',
    password: 'nodejs',
    database: 'MDB',
    port: 3306
});
//var pool = mysql.createPool({
//    host: '121.40.149.111',
//    user: 'root',
//    password: 'root',
//    database: 'MDB',
//    port: 3306
//});
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
        if (entities.length > 0){
            waitForFinish(null);
            return;
        }

        var selectSQL1 = "select * from ENTITY where TENANT_DOMAIN = "
            + pool.escape(tenant_domain);
        pool.query(selectSQL1, function (err, entityRows) {
            if(err)throw err; //Actually, the err cannot be catched outside as the nodejs async mechanism
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

                var selectSQL2 = "select * from ATTRIBUTE where TENANT_DOMAIN = "
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
                    debug("Error occurs in loading attributes! \n" +
                          "Error message: %s", err);
                    waitForFinish(err, results);
                }
                waitForFinish(null, "Entities are initialized!" + results);
            });
        })
    },

    executeSQL: function(selectSQL,callback) {
        pool.getConnection(function (err, conn) {
            if (err) {
                debug("mySql POOL ==> %s", err);
                throw("mySql POOL ==> " + err);
            }

            conn.query(selectSQL, function (err, rows) {
                if (err) {
                    debug("mySql Select ==> %s", err);
                    conn.release();
                    return callback(err);
                }
                conn.release();
                callback(null, rows);
            })
        });
    },

    doUpdatesParallel: function(updateSQLs, callback){
        pool.getConnection(function(err, conn){
            if (err) {
                debug("mySql POOL ==> %s", err);
                throw("mySql POOL ==> " + err);
            }
            conn.beginTransaction(function(err){
                if (err) {
                    debug("mySql TRANSACTION error ==> %s", err);
                    throw("mySql TRANSACTION ==> " + err);
                }

                async.map(updateSQLs, function (updateSQL, callback){
                    conn.query(updateSQL, function(err,result){
                        if (err) {
                            debug("mySql Update Error ==> %s", updateSQL);
                            conn.rollback(function(){
                                return callback(err, result);
                            });
                        };
                        callback(null,  result);
                    })
                },function (err, results) {
                    if (err) {
                        debug("Error occurs in doUpdatesParallel() when executing update SQLs ==> %s", err);
                        return callback(err, results);
                    }
                    conn.commit(function(err){
                        if(err){
                            debug("mySql Commit ==> %s",err)
                            conn.rollback(function(){
                                return callback(err, results);
                            });
                        }
                        callback(null, results);
                    })
                })
            })
        })
    },

    doUpdatesSeries: function(updateSQLs, callback){
        pool.getConnection(function(err, conn){
            if (err) {
                debug("mySql POOL ==> %s", err);
                throw("mySql POOL ==> " + err);
            }
            conn.beginTransaction(function(err){
                if (err) {
                    debug("mySql TRANSACTION error ==> %s", err);
                    throw("mySql TRANSACTION ==> " + err);
                }

                async.mapSeries(updateSQLs, function (updateSQL, callback){
                    conn.query(updateSQL, function(err,result){
                        if (err) {
                            debug("mySql Update Error ==> %s", updateSQL);
                            conn.rollback(function(){
                                return callback(err, result);
                            });
                        };
                        callback(null, result);
                    })
                },function (err, results) {
                    if (err) {
                        debug("Error occurs in doUpdatesSeries() when executing update SQLs ==> %s", err);
                        return callback(err, results);
                    }
                    conn.commit(function(err){
                        if(err){
                            debug("mySql Commit ==> %s",err)
                            conn.rollback(function(){
                                return callback(err, results);
                            });
                        }
                        callback(null, results);
                    })
                })
            })
        })
    }
};
