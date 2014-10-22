/**
 * Created by VinceZK on 10/18/14.
 */
var entityDB = require('../../server/models/connections/conn_mysql_mdb.js');
var blog;
var blogId;
var blogObj;
var async = require('async');

describe('blog entity tests', function() {
    before('Initialize the MDB meta data', function (done) {
        async.series([
            function(callback){
                entityDB.setTenantDomain('darkhouse.com');
                entityDB.loadEntities(callback);
            },
            function(callback){
                blog = require('../../server/models/server_blog.js');
                blogObj = {
                    ID: 0,
                    NAME: 'blogs/blog1.html',
                    PUBLISH_TIME: '2014/10/07',
                    TITLE: 'Compose Your First Single Page Application',
                    ABSTRACT: 'If you want to compose a web application, you must consider following stuff...',
                    AUTHOR: 'VinceZK'
                };
                callback(done());
            }
        ])
    });

    describe('#addBlog(blog)', function () {
        it('should create a new blog in DB, and return a blog ID > 0', function (done) {
            blog.addBlog(blogObj,function(err,retBlogID){
                if(err)throw err;
                blogId = retBlogID;
                blogId.should.be.above(0);
                blogObj.ID = blogId;
                done();
            });
        })
    });

    describe('#getBlogFromId(blogId)', function () {
        it('should return a blog in JSON format with ID = blogId', function (done) {
            blog.getBlogFromId(blogId,function(err,retBlogObj){
                if(err)throw err;
                retBlogObj.should.eql(blogObj);
                done();
            });
        });

        it('should return a null object as the blogId is not exist', function (done) {
            blog.getBlogFromId(999999,function(err,retBlogObj){
                if(err)throw err;
                (retBlogObj === null).should.be.true;
                done();
            });
        });
    });

    describe('#softDeleteBlog(blogId)', function () {
        it('should set the DEL flag to 1', function (done) {
            blog.softDeleteBlog(blogId, function(err,retCode){
                (err === null).should.be.true;
                retCode.should.equal(1);
                done();
            });
        });

        it('should return a message says the blog ID 999999 is not exist!', function (done) {
            blog.softDeleteBlog(999999, function(err, retCode){
                (err === null).should.be.true;
                retCode.should.equal(0);
                done();
            });
        });
    });

    describe('#restoreBlog(blogId)', function () {
        it('should set the DEL flag to 0', function (done) {
            blog.restoreBlog(blogId, function(err,retCode){
                (err === null).should.be.true;
                retCode.should.equal(1);
                done();
            });
        });

        it('should return a message says the blog ID 999999 is not exist!', function (done) {
            blog.restoreBlog(999999, function(err, retCode){
                (err === null).should.be.true;
                retCode.should.equal(0);
                done();
            });
        });
    });

    describe('#hardDeleteBlog(blogId)', function () {
        before('Soft delete the blogId', function(done){
            blog.softDeleteBlog(blogId, function(err,retCode){
                if(err)throw err;
                retCode.should.equal(1);
                done();
            });
        });

        it('should delete the blog from DB!', function (done) {
            blog.hardDeleteBlog(blogId, function(err,retCode){
                (err === null).should.be.true;
                retCode.should.be.above(0);
                done();
            });
        });

        it('should not delete the blog without soft-deletion first!', function (done) {
            blog.hardDeleteBlog(1, function(err,retCode){
                (err === null).should.be.true;
                retCode.should.equal(-1);
                done();
            });
        });

        it('should return 0 as the blogId = 999999 is not exist!', function (done) {
            blog.hardDeleteBlog(999999, function(err, retCode){
                (err === null).should.be.true;
                retCode.should.equal(0);
                done();
            });
        });
    });

    describe('#getBlogList(blogId)', function () {
        it('should return a list of blog items', function (done) {
            blog.getBlogList(function(err, list){
                (err === null).should.be.true;
                list.length.should.be.above(0);
                done();
            });
        });
    });
});