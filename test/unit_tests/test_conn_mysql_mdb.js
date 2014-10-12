/**
 * Created by VinceZK on 10/10/14.
 */
var entityDB = require('../../server/models/connections/conn_mysql_mdb.js');
describe('connections', function(){
    before(function(){
        entityDB.setTenantDomain('darkhouse.com');

    })

    describe('#loadEntities()', function(){
        beforeEach(function(done){
            entityDB.loadEntities(done);
        })

        it('should return 3 entities', function(){
            //assert.equal(entityDB.entities.length,3);
            entityDB.entities.length.should.equal(3);
        })

        it('should have entry: blog', function(){
            //assert.equal(entityDB.entities.length,3);
            entityDB.entities[0].ENTITY_ID.should.equal('role');
        })
    })

    describe('#executeSQL()', function(){
        it('should return tenant "darkhouse.com"', function(done){
            var selectSQL = "SELECT * FROM TENANTS";
            entityDB.executeSQL(selectSQL, function(err, rows){
                if(err)throw err;
                //assert.equal(rows[0].TENANT_DOMAIN, 'darkhouse.com');
                rows[0].TENANT_DOMAIN.should.equal('darkhouse.com');
                done();
            })
        })

        it('should return "User" entity name', function(done){
            var selectSQL = "SELECT * FROM ENTITY WHERE TENANT_DOMAIN = "
                          + entityDB.pool.escape(entityDB.getTenantDomain())
                          + " AND ENTITY_ID = 'user'";
            entityDB.executeSQL(selectSQL, function(err, rows){
                if(err)throw err;
                //assert.equal(rows[0].ENTITY_NAME, 'User');
                rows[0].ENTITY_NAME.should.equal('User');
                done();
            })
        })

    })
});
