//var passport = require('passport');
var express = require('express');
var router = express.Router();
var Auth = require('./controllers/server_auth.js')

/*router.use('/wiz', function(req,res){
    res.render('../app/wizardApp.html');
})*/


/*
 restful APIs
 */
// Basic login with username & password
router.post('/api/login',Auth.login);
router.get('/api/login',Auth.ensureAuthenticated,Auth.session);
router.delete('/api/login',Auth.logout);

router.post('/api/renewPWD',Auth.ensureAuthenticated,Auth.renewPWD);
router.get('/api/getUserMeta',Auth.ensureAuthenticated,Auth.getUserMeta);

// angular启动页
//router.use('/app/*', Auth.ensureAuthenticated);

router.use('/*', function(req, res){
    res.render('index');
});




module.exports = router;
