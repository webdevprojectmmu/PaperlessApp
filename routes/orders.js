var express = require('express');
var router = express.Router();
const Sequelize = require("sequelize");
const sequelize = new Sequelize('mysql://'+process.env.DBNAME+':'+process.env.DBPASSWORD+'@'+process.env.DBURL+':'+process.env.DBPORT+'/'+process.env.DATABASE+'');
const Orders = sequelize.import("../model/orders");
const Staff = sequelize.import("../model/staff");
const staff = require("../model/staff")
const passport = require("passport");
const bcrypt = require("bcryptjs");
/* GET home page. */

function comparePassword (candidatePassword, hash, callback){
    bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
        if(err) throw err;
        callback(null, isMatch);
    });
}

var LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy(
    function(username, password, done) {
        Staff.findOne({where:{username: username}}).then(()=> {
           Staff.comparePassword(password, Staff.password, function(err, isMatch){
                if(err) throw err;
                if(isMatch){
                    return done(null, Staff);
                } else {
                    return done(null, false, {message: 'Invalid password'});
                }
            });
        })
    }
));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.getUserById(id, function(err, user) {
        done(err, user);
    });
});


router.post('/login', passport.authenticate('local'),
    function(req, res) {
        res.redirect("/orders")
    }
);

router.get("/login", function (req,res) {
    res.render("login")
})

router.get('/', function(req, res, next) {
    Orders.findAll().then(result => {
        console.log(result)
        res.render("orders", {orders: result})
    })

});

router.get("/search", function (req,res) {
    Orders.findOne({where: {id: req.body}}).then(result => {
        console.log(result);
        console.log(req.body.getOrderID)
        res.render("orders", {orders: result})
    })

})

router.get('*', function(req, res){



    res.send('Sorry, this is an invalid URL.' + req.originalUrl+ '<br>' +
        'Press this link to return to parent directory <a href="/orders">Orders</a> or wait for redirect');
});


module.exports = router;
