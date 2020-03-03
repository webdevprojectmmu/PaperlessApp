var express = require('express');
var router = express.Router();
const Sequelize = require("sequelize");
const sequelize = new Sequelize('mysql://'+process.env.DBNAME+':'+process.env.DBPASSWORD+'@'+process.env.DBURL+':'+process.env.DBPORT+'/'+process.env.DATABASE+'');
const Orders = sequelize.import("../model/orders");
const Staff = sequelize.import("../model/staff");
const staffModel = require("../model/staff")
const bcrypt = require("bcryptjs")
const passport = require("passport");
/* GET home page. */

var LocalStrategy = require('passport-local').Strategy;
passport.use('local-signup', new LocalStrategy(

    {
        passReqToCallback: true // allows us to pass back the entire request to the callback

    }, function (req, username, password, done) {
        console.log("Signup for - ", username)
        var generateHash = function (password) {
            return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);

        }
        Staff.findOne({
            where: {
                username: username
            }
        }).then(function (user) {
            console.log(user);
            if (user) {
                return done(null, false, {
                    message: 'That email is already taken'
                });
            } else {
                var userPassword = generateHash(password);
                var data = {
                    username: email,
                    password: userPassword,

                };

                Staff.create(data).then(function (newUser, created) {
                    if (!newUser) {
                        return done(null, false);
                    }
                    if (newUser) {
                        return done(null, newUser);
                    }

                });
            }
        });
    }
));


passport.use("local",new LocalStrategy(
    {
        passReqToCallback: true
    },

    function(req,username, password, done) {

            var validPassword = function(staff,password) {
                return bcrypt.compareSync(password, staff);
            };
            Staff.findOne({
                where: {
                    username: username
                }
            }).then(function (user) {
                console.log(user)

                if (!user) {
                    return done(null, false, {
                        message: 'NAME'
                    });
                }
                if (!validPassword(user.dataValues.password, password)) {
                    console.log(password)
                    return done(null, false, {
                        message: 'PASSWORD'
                    });
                }
                var userinfo = user.get();
                return done(null, userinfo);
            }).catch(function (err) {
                console.log("Error:", err);
                return done(null, false, {
                    message: 'WRONG'
                });
            });



    }
));

passport.serializeUser(function(staff, done) {
    done(null, staff.dataValues.staff_id);
});

passport.deserializeUser(function(id, done) {
    Staff.findByPk(id).then(staff => {
        if (staff) {
            done(null, staff.get());
        }
        else {
            done(staff,null)
        }
    });
});
router.post("/register",passport.authenticate("local"), (req,res) =>{
res.redirect("/orders")
});




router.post('/login', passport.authenticate('local'),
    function(req, res) {
        res.redirect("/orders")
    }
);

router.get("/login", function (req,res) {

    res.render("login")
})

router.get('/',authenticationMiddleware(), function(req, res, next) {
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



function authenticationMiddleware () {
    return function (req, res, next) {
        if (req.isAuthenticated()) {
            return next()
        }
        res.redirect('/orders/login')
    }
}

module.exports = router;
