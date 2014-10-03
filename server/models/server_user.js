/**
 * Created by VinceZK on 9/16/14.
 */
var debug = require('debug')('darkhouse/user');
var _ = require('underscore');
var async = require('async');
var entityDB = require('./connections/conn_mysql_mdb.js');
var userEntity = _.find(entityDB.entities,function(entity) {
    return entity['ENTITY_ID'] === 'user';
});
if (userEntity === undefined){
    console.log("There is no user entity in the tenant domain: " + entityDB.getTenantDomain());
    //return;
}

module.exports = {

    /**
     * Get all the attributes one by one.
     * It is only for test purpose, to test using async.map to execute multiple sqls in paralle1.
     * The method getUserByID is good to use a join SQL. But in some case, a complex join SQL may not
     * the best solution vs execute multiple sqls.
     */
    getUserByID_tst:function(userID,callback) {
        var attrUserID = _.find(userEntity.ATTRIBUTES, function (attribute) {
            return attribute.ATTR_NAME === 'USER_ID';
        });

        var selectSQL = "select * from " + "UIX_" + attrUserID.ATTR_GUID
            + " WHERE VALUE0 = " + entityDB.pool.escape(userID);
        var userAttributes = [];

        entityDB.executeSQL(selectSQL, function(err, rows){
            if(err)
                return callback(err);

            async.map(userEntity.ATTRIBUTES,function(attribute,callback){
                var userAttrSQL = "select * from VALUE where REC_GUID = "
                    + entityDB.pool.escape(rows[0].REC_GUID)
                    + " and attr_guid = "
                    + entityDB.pool.escape(attribute.ATTR_GUID);

                entityDB.executeSQL(userAttrSQL, function(err, rows){
                    var userAttribute = {
                        attr_name: attribute.ATTR_NAME,
                        attr_value: rows[0].VALUE0
                    }
                    userAttributes.push(userAttribute);
                }, callback)

            }, function (err, results) {
                if (err) {
                    console.log("There is error in loading attributes!"+results)
                }
                callback(null, userAttributes);
            })
        });
    },

    /**
     * Get all the attributes value in a join SQL
     */
    getUserByID:function(userID,callback) {
        var attrUserID = _.find(userEntity.ATTRIBUTES, function (attribute) {
            return attribute.ATTR_NAME === 'USER_ID';
        });

        var selectSQL = "SELECT C.ATTR_NAME, A.VALUE0 "
                      + "FROM MDB.VALUE as A "
                      + "INNER JOIN MDB.UIX_" + attrUserID.ATTR_GUID + " AS B "
                      + "ON A.REC_GUID = B.REC_GUID "
                      + "RIGHT JOIN MDB.ATTRIBUTE AS C "
                      + "ON A.ATTR_GUID = C.ATTR_GUID "
                      + "WHERE B.VALUE0 = " + entityDB.pool.escape(userID);

        var userAttributes = [];

        entityDB.executeSQL(selectSQL, function(err, rows){
            if(err)
                return callback(err);

            for(var i in rows){
                var userAttribute = {
                    attr_name: rows[i].ATTR_NAME,
                    attr_value: rows[i].VALUE0
                }
                userAttributes.push(userAttribute);
            }

            callback(null,  userAttributes);
        })
    },

    /**
     * Get all the attributes value in a join SQL
     */
    getUserByEmail:function(email,callback) {
        var attrEmail = _.find(userEntity.ATTRIBUTES, function (attribute) {
            return attribute.ATTR_NAME === 'EMAIL';
        });
        var selectSQL = "SELECT C.ATTR_NAME, A.VALUE0 "
            + "FROM MDB.VALUE as A "
            + "INNER JOIN MDB.UIX_" + attrEmail.ATTR_GUID + " AS B "
            + "ON A.REC_GUID = B.REC_GUID "
            + "RIGHT JOIN MDB.ATTRIBUTE AS C "
            + "ON A.ATTR_GUID = C.ATTR_GUID "
            + "WHERE B.VALUE0 = " + entityDB.pool.escape(email);

        var userAttributes = [];

        entityDB.executeSQL(selectSQL, function(err, rows){
            if(err)
                return callback(err);

            for(var i in rows){
                var userAttribute = {
                    attr_name: rows[i].ATTR_NAME,
                    attr_value: rows[i].VALUE0
                }
                userAttributes.push(userAttribute);
            }

            callback(null,  userAttributes);
        })
    },

    /**
     * Get the meta data of user entity
     */
    getUserEntityMeta:function(){
        return userEntity;
    },

    /**
     * Renew the password. update PASSWORD & PWD_STATE at same time.
     * Currently, DB transaction is not implemented. Using async.parallel
     * is a workaround solution. There are 2 options:
     * 1) Using nodejs mysql lib's transaction api,
     * 2) Write mysql store procedures.
     * @param email
     * @param newPWD
     * @param callback
     */
    changePWD: function(email, newPWD, callback){
        var attrEmail = _.find(userEntity.ATTRIBUTES, function (attribute) {
            return attribute.ATTR_NAME === 'EMAIL';
        });
        var attrPWD = _.find(userEntity.ATTRIBUTES, function (attribute) {
            return attribute.ATTR_NAME === 'PASSWORD';
        });
        var attrPWD_STATE = _.find(userEntity.ATTRIBUTES, function (attribute) {
            return attribute.ATTR_NAME === 'PWD_STATE';
        });
        var updateSQL1 = "UPDATE VALUE set VALUE0 = " + entityDB.pool.escape(newPWD)
            + " WHERE REC_GUID = (select REC_GUID from UIX_"+ attrEmail.ATTR_GUID
            + " WHERE VALUE0 = " + entityDB.pool.escape(email) + ")"
            + " AND ATTR_GUID = " + entityDB.pool.escape(attrPWD.ATTR_GUID);

        var updateSQL2 = "UPDATE VALUE set VALUE0 = 1"
            + " WHERE REC_GUID = (select REC_GUID from UIX_"+ attrEmail.ATTR_GUID
            + " WHERE VALUE0 = " + entityDB.pool.escape(email) + ")"
            + " AND ATTR_GUID = " + entityDB.pool.escape(attrPWD_STATE.ATTR_GUID);

        async.parallel([
            function(callback){
                entityDB.executeSQL(updateSQL1,function(err, rows){
                    if(err){
                        callback(err,1);
                    }else{
                        callback(null,1);
                    }
                })
            },
            function(callback){
                entityDB.executeSQL(updateSQL2,function(err, rows){
                    if(err){
                        callback(err, 2);
                    }else{
                        callback(null,2);
                    }
                })
            }],
            function (err, results) {
                callback(err, results);
            })

    }
};


