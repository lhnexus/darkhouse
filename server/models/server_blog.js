/**
 * Created by VinceZK on 10/9/14.
 */
'use strict'

var entityDB = require('./connections/conn_mysql_mdb.js');
var blogEntity = _.find(entityDB.entities,function(entity) {
    return entity['ENTITY_ID'] === 'blog';
});
if (blogEntity === undefined){
    console.log("There is no user entity in the tenant domain: " + entityDB.getTenantDomain());
}
var uuid = require('node-uuid');

module.exports = {
    addBlog:function(blog){
        var insertSQL;
        var attribute;
        var recGuid = uuid.v4();
        var insertSQL1 = "INSERT INTO ENTITY_INSTANCES VALUES ("
                  + entityDB.pool.escape(entityDB.getTenantDomain())
                  + ", 'blog', "
                  + entityDB.pool.escape(recGuid)
                  + ", ,"
                  + "'1')";
        var insertSQL2 = "INSERT INTO UIX_5299ED5694B542DF9FBC9EBDF19D3D15 VALUES ( null, "
        + entityDB.pool.escape(recGuid) + ")";
        entityDB.executeSQL(insertSQL1,function(err, rows){

        })
        entityDB.executeSQL(insertSQL2,function(err, rows){

        })


        for(attribute in blogEntity.ATTRIBUTES){
            insertSQL = 'UPDATE VALUE SET VALUE0 = ' + entityDB.pool.escape(blog[attribute.ATTR_NAME])
                      + ' WHERE REC_GUID = ';
        }
    },

    getBlogList: function () {
        var attrEmail = _.find(userEntity.ATTRIBUTES, function (attribute) {
            return attribute.ATTR_NAME === 'EMAIL';
        });
        var selectSQL = "SELECT C.ATTR_NAME, A.VALUE0 "
            + "FROM MDB.VALUE as A "
            + "INNER JOIN MDB.UIX_" + attrEmail.ATTR_GUID + " AS B "
            + "ON A.REC_GUID = B.REC_GUID "
            + "RIGHT JOIN MDB.ATTRIBUTE AS C "
            + "ON A.ATTR_GUID = C.ATTR_GUID "
            + "WHERE B.VALUE0 = " + entityDB.pool.escape(email.toLowerCase());

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
    }
}