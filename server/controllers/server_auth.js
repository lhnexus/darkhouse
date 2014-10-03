/**
 * Created by VinceZK on 9/21/14.
 */
var debug = require('debug')('darkhouse');
var passport =  require('passport');
var LocalStrategy = require('passport-local').Strategy;
var user = require('../models/server_user.js');
var _ = require('underscore');

module.exports = {

    login: function(req, res, next){
        passport.authenticate('local', function(err, user, info){
            user = _.reject(user, function(attribute){
                return (attribute.attr_name === 'PASSWORD' ||
                    attribute.attr_name === 'PWD_STATE' ||
                    attribute.attr_name === 'LOCK');
            });

            var data = {
                userInfo: user,
                otherInfo: info,
                errorInfo: err
            }

            if (err) {
                data.errorInfo = err;
                return res.json(data); }

            req.logIn(user, function(err) {
                if (err){
                    data.errorInfo = err.message;
                    return res.send(data);
                }
                res.json(data);
            });
        })(req, res, next);
    },

    renewPWD:function(req, res){
       user.changePWD(req.body.email, req.body.password, function(err){
           if(err){
               res.send(538, 'Server Error!');
           }else{
               res.send(200);
           }
       })
    },

    logout: function(req, res){
        if(req.user){
            req.logout();
            res.send(200);
        }else{
            res.send(400, 'Not logged in');
        }
    },

    LocalStrategy: new LocalStrategy(
        function(username, password, done){
           debug("Enter LocalStrategy with " + username + " and " + password);
           user.getUserByEmail(username, function(err, userAttributes){
               if(err){
                   return done(err);
               }

               if(userAttributes.length === 0){
                   return done(null,  false, { message: '',
                                               errorEmail: 'Incorrect Email!',
                                               errorPassword: ''});
               }

               var userPWD = _.find(userAttributes, function (attribute) {
                   return attribute.attr_name === 'PASSWORD';
               });

               if(userPWD && userPWD.attr_value === password){
                   var pwdState = _.find(userAttributes, function (attribute) {
                       return attribute.attr_name === 'PWD_STATE';
                   });

                   if(pwdState.attr_value == 0) {//Password is initial,and need to reset!
                       return done(null,  userAttributes, {message: 'renewPWD',
                                                           errorEmail:'',
                                                           errorPassword:''});
                   }else{//Password is valid
                       return done(null,  userAttributes, {message: 'Success',
                                                           errorEmail:'',
                                                           errorPassword:''});
                   }
               }else{
                   return done(null,  false, { message: '',
                                               errorEmail: '',
                                               errorPassword:'Incorrect password!'});
               }
           })
    }),

    serializeUser: function(userAttributes, done) {
        if(userAttributes){
            var userID = _.find(userAttributes, function (attribute) {
                return attribute.attr_name === 'USER_ID';
            });
            done(null, userID.attr_value);
        }else{//In case login fail, then create a fake session
            done(null, 0);
        }


    },

    deserializeUser: function(id, done) {
        user.getUserByID(id, function(err, userAttributes){
            if(err){
                return done(err);
            }

            if(userAttributes.length === 0){
                return done(null,  false, { message: 'Session is expired!'});
            }else{
                var userAttr = {
                    userInfo: []
                }
                userAttr.userInfo = _.reject(userAttributes, function(attribute){
                    return (attribute.attr_name === 'PASSWORD' ||
                            attribute.attr_name === 'PWD_STATE' ||
                            attribute.attr_name === 'LOCK');
                });
                return done(null,  userAttr);
            }

        })
    },

    ensureAuthenticated:function(req, res, next) {
        if (req.isAuthenticated()) { return next(); }
        res.send(401);
    },

    session:function(req,res){
        if(req.user){
            res.json(req.user);
        }
        else{
            res.send(200);
        }
    },

    getUserMeta:function(req, res){
        res.json(user.getUserEntityMeta());
    }

}