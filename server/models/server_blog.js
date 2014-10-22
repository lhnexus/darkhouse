/**
 * Created by VinceZK on 10/9/14.
 */
'use strict';
var debug = require('debug')('darkhouse:server_blog');
var entityDB = require('./connections/conn_mysql_mdb.js');
var _ = require('underscore');
var blogEntity = _.find(entityDB.entities,function(entity) {
    return entity['ENTITY_ID'] === 'blog';
});
if (blogEntity === undefined){
    debug("Error occurs in server_blog: \n" +
          "There is no blog entity exist in tenant %s\n", entityDB.getTenantDomain());
}
var guid = require('../util/guid.js');

module.exports = {
    /**
     * Save the blog JSON object to mysql DB
     * @param blog
     * return an auto incremented blog ID in callback functions
     * @param callback
     */
    addBlog:function(blog,callback){
        var recGuid = guid.genTimeBased();
        var insertSQL1 = "INSERT INTO ENTITY_INSTANCES VALUES ("
                          + entityDB.pool.escape(entityDB.getTenantDomain())
                          + ", 'blog', "
                          + entityDB.pool.escape(recGuid)
                          + ", 0 ,"
                          + "'1')";
        var insertSQL2 = "INSERT INTO UIX_5299ED5694B542DF9FBC9EBDF19D3D15 (`REC_GUID`) VALUES ("
                          + entityDB.pool.escape(recGuid) + ")";

        entityDB.doUpdatesSeries([insertSQL1,insertSQL2], function(err,results){
            if(err){
                debug("Error occurs in addBlog() when executing series updates.\n" +
                      "Error info: %s \n" +
                      "SQL statements: 1) %s \n 2) %s\n", err, insertSQL1, insertSQL2);
                return callback(err);
            }

            //Get the new added blog ID;
            //console.log(results);
            var blogID = results[1].insertId;

            var insertSQLs = [];
            var attrValue = null;
            var insertSQL;
            _.each(blogEntity.ATTRIBUTES, function(attribute){
                if(attribute.ATTR_NAME === 'ID'){
                    insertSQL = "INSERT INTO VALUE (REC_GUID, ATTR_GUID, VALUE0, VERSION_NO, CHANGE_NO) VALUES ("
                        + entityDB.pool.escape(recGuid) + ","
                        + entityDB.pool.escape(attribute.ATTR_GUID) + ","
                        + entityDB.pool.escape(blogID) + ","
                        + "'0', '1')";
                    insertSQLs.push(_.clone(insertSQL));
                }else{
                    attrValue = blog[attribute.ATTR_NAME];
                    if(attrValue){
                        insertSQL = "INSERT INTO VALUE (REC_GUID, ATTR_GUID, VALUE0, VERSION_NO, CHANGE_NO) VALUES ("
                            + entityDB.pool.escape(recGuid) + ","
                            + entityDB.pool.escape(attribute.ATTR_GUID) + ","
                            + entityDB.pool.escape(attrValue) + ","
                            + "'0', '1')";
                        insertSQLs.push(_.clone(insertSQL));
                    }
                }
            });
            entityDB.doUpdatesParallel(insertSQLs,  function(err){
                if(err){
                    debug("Error occurs in addBlog() when doing parallel updates.\n" +
                          "Error info: %s \n" +
                          "SQL statements: %o \n", err,insertSQLs);
                    callback(err, blogID);
                }else{
                    callback(null, blogID);
                }
            })
        })
    },

    /**
     * get a blog from ID
     * @param blogId
     * @param callback
     * If the blogId is not existed in DB, callback will return a null object
     * Else return the actual blog in JSON object.
     */
    getBlogFromId: function(blogId,callback){
        var attrMeta;
        var blogObj = {};
        var selectSQL = "SELECT * FROM UIX_5299ED5694B542DF9FBC9EBDF19D3D15 WHERE VALUE0 = "
                        + entityDB.pool.escape(blogId);
        entityDB.executeSQL(selectSQL, function(err, rec){
            if(err){
                debug("Error occurs in getBlogFromId() when executing selectSQL.\n" +
                      "Error info: %s\n" +
                      "SQL statement: %s\n",  err, selectSQL);
                return callback(err);
            }

            if(rec.length === 0){//The blogId is not exist!
                return callback(null, null);
            }

            selectSQL = "SELECT ATTR_GUID, VALUE0 FROM VALUE WHERE REC_GUID = "
                        + entityDB.pool.escape(rec[0].REC_GUID);
            entityDB.executeSQL(selectSQL, function(err, attributes){
                if(err){
                    debug("Error occurs in getBlogFromId() when getting blog attribute values.\n" +
                          "Error info: %s\n" +
                          "SQL statement: %s\n", err,selectSQL);
                    return callback(err);
                }

                _.each(attributes,function(attribute){
                    attrMeta = _.find(blogEntity.ATTRIBUTES,function(attr){
                        return attr['ATTR_GUID'] === attribute.ATTR_GUID;
                    });
                    blogObj[attrMeta.ATTR_NAME] = attribute.VALUE0;
                });

                callback(null,  blogObj);
            })
        })
    },

    /**
     * Soft delete a blog by set the DEL flag to 1
     * @param blogId
     * @param callback
     * retCode === 0: no blog is updated, possibly the blogId is not exist
     * retCode === 1: the corresponding blog is updated
     */
    softDeleteBlog: function(blogId,callback){
        var updateSQL = "UPDATE ENTITY_INSTANCES SET DEL = 1 WHERE TENANT_DOMAIN = "
                        + entityDB.pool.escape(entityDB.getTenantDomain())
                        + " AND ENTITY_ID = 'blog' AND REC_GUID = "
                        + "(SELECT REC_GUID FROM UIX_5299ED5694B542DF9FBC9EBDF19D3D15"
                        + " WHERE VALUE0 = " + entityDB.pool.escape(blogId) + ")";
        entityDB.doUpdatesParallel([updateSQL], function(err,results){
            if(err){
                debug("Error occurs in softDeleteBlog() when doing parallel updates. \n" +
                      "Error info: %s\n" +
                      "SQL statement: %s\n", err, updateSQL);
                return callback(err);
            }
            var retCode = results[0].changedRows;
            callback(null,retCode);
        })
    },

    /**
     * Restore the soft deleted blog
     * @param blogId
     * @param callback
     * retCode === 0: no blog is updated, possibly the blogId is not exist
     * retCode === 1: the corresponding blog is restored
     */
    restoreBlog: function(blogId,callback){
        var updateSQL = "UPDATE ENTITY_INSTANCES SET DEL = 0 WHERE TENANT_DOMAIN = "
            + entityDB.pool.escape(entityDB.getTenantDomain())
            + " AND ENTITY_ID = 'blog' AND REC_GUID = "
            + "(SELECT REC_GUID FROM UIX_5299ED5694B542DF9FBC9EBDF19D3D15"
            + " WHERE VALUE0 = " + entityDB.pool.escape(blogId) + ")";
        entityDB.doUpdatesParallel([updateSQL], function(err,results){
            if(err){
                debug("Error occurs in restoreBlog() when doing parallel updates.\n" +
                      "Error info: %s\n" +
                      "SQL statement: %s\n", err,  updateSQL);
                return callback(err);
            }
            var retCode = results[0].changedRows;
            callback(null,retCode);
        })
    },

    /**
     * Delete the blog from the DB
     * @param blogId
     * @param callback
     * retCode === -1: Need soft deletion first
     * retCode === 0: The blogId is not exist
     * retCode > 0: The blog is deleted
     */
    hardDeleteBlog: function(blogId,callback){
        var REC_GUID;
        var retCode;
        var selectSQL = "SELECT REC_GUID, DEL FROM ENTITY_INSTANCES WHERE TENANT_DOMAIN = "
                        + entityDB.pool.escape(entityDB.getTenantDomain())
                        + " AND ENTITY_ID = 'blog'"
                        + " AND REC_GUID = (SELECT REC_GUID FROM UIX_5299ED5694B542DF9FBC9EBDF19D3D15 WHERE VALUE0 = "
                        + entityDB.pool.escape(blogId) + ")";
        entityDB.executeSQL(selectSQL, function(err, rows){
            if(err){
                debug("Error occurs in hardDeleteBlog() when executing select SQL.\n" +
                    "Error info: %s\n" +
                    "SQL statement: %s\n",err, selectSQL);
                return callback(err);
            }

            if(rows.length === 0){
                retCode = 0; //The blog ID is not exist!
                return callback(null, retCode);
            }

            if(rows[0].DEL !== 1){
                retCode = -1; //Need soft deleted first!
                return callback(null, retCode);
            }

            REC_GUID = rows[0].REC_GUID;
            var deleteSQLs = [];
            var deleteSQL;
            deleteSQL = "DELETE FROM ENTITY_INSTANCES WHERE TENANT_DOMAIN = "
                        + entityDB.pool.escape(entityDB.getTenantDomain())
                        + " AND ENTITY_ID = 'blog'"
                        + " AND REC_GUID = " + entityDB.pool.escape(REC_GUID);
            deleteSQLs.push(_.clone(deleteSQL));

            deleteSQL = "DELETE FROM UIX_5299ED5694B542DF9FBC9EBDF19D3D15 WHERE REC_GUID = "
                        + entityDB.pool.escape(REC_GUID);
            deleteSQLs.push(_.clone(deleteSQL));

            deleteSQL = "DELETE FROM VALUE WHERE REC_GUID = "
                        + entityDB.pool.escape(REC_GUID);
            deleteSQLs.push(_.clone(deleteSQL));

            entityDB.doUpdatesParallel(deleteSQLs, function(err,results){
                if(err){
                    debug("Error occurs in hardDeleteBlog() when doing parallel updates. \n" +
                        "Error info: %s\n" +
                        "SQL statements: %s\n", err,  deleteSQLs);
                    return callback(err);
                }
                retCode = results.length;
                callback(null,retCode);
            })
        })

    },

    /**
     * get blog list (filter the DEL = 1)
     * @param callback
     * callback will return the list object.
     */
    getBlogList: function(callback) {
        var currRecGuid = '0';
        var attrMeta;
        var blogList = [];
        var blogItem = {};
        var selectSQL = "SELECT REC_GUID, ATTR_GUID, VALUE0 AS ATTR_VALUE " +
            "FROM MDB.VALUE WHERE REC_GUID IN (SELECT REC_GUID FROM MDB.ENTITY_INSTANCES" +
            " WHERE TENANT_DOMAIN = " + entityDB.pool.escape(entityDB.getTenantDomain()) +
            " AND ENTITY_ID = 'blog'  AND DEL = 0 ) ORDER BY REC_GUID";

        entityDB.executeSQL(selectSQL, function(err, attributes){
            if(err){
                debug("Error occurs in getBlogList when executing selectSQL.\n " +
                      "Error Info: %s \n" +
                      "The SQL statement: %s \n", err, selectSQL);
                return callback(err);
            }

            _.each(attributes,function(attribute){
                if(currRecGuid !== attribute.REC_GUID){
                    if(currRecGuid !== '0'){
                        blogList.push(blogItem);
                        blogItem = {};
                    }
                    currRecGuid = attribute.REC_GUID;
                }

                attrMeta = _.find(blogEntity.ATTRIBUTES,function(attr){
                    return attr['ATTR_GUID'] === attribute.ATTR_GUID;
                });
                blogItem[attrMeta.ATTR_NAME] = attribute.ATTR_VALUE;
            });
            if(Object.keys(blogItem).length > 0){
                blogList.push(blogItem);
            }

            callback(null, blogList);
        });
    }
};