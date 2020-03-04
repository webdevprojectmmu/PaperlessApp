var express = require('express');
var router = express.Router();
const Sequelize = require("sequelize");
const sequelize = new Sequelize('mysql://'+process.env.DBNAME+':'+process.env.DBPASSWORD+'@'+process.env.DBURL+':'+process.env.DBPORT+'/'+process.env.DATABASE+'');
const Orders = sequelize.import("../model/orders");
const Staff = sequelize.import("../model/staff");
const staffModel = require("../model/staff")
const bcrypt = require("bcryptjs");
const passport = require("passport");
/* GET home page. */



router.post("/register", (req,res) =>{
    const username = req.body.username;
    const name = req.body.name;
    const password = req.body.password
    const role = req.body.role

    bcrypt.hash(password, 8 , (err,hash) => {
        Staff.create({
            username: username,
            name: name,
            password: hash,
            role: role

        }).then((results,err)=>{
            if (err) throw err;
            const staffID = results.staff_id;
            Staff.findOne({where: {staff_id: staffID}}).then((staffID,err)=>{
                if (staffID.role === 4){
                    const staff = staffID.staff_id
                    req.login(staff, function (err) {
                        res.redirect("/orders")

                    })
                } else if(staffID.role === 3) {
                    const staff = staffID.staff_id
                    req.login(staff, function (err) {
                        res.redirect("/admin")

                    })
                } else if(staffID.role === 2) {
                    const staff = staffID.staff_id
                    req.login(staff, function (err) {
                        res.redirect("/waiter")

                    })
                }
                else if(staffID.role === 1) {
                    const staff = staffID.staff_id
                    req.login(staff, function (err) {
                        res.redirect("/kitchen")

                    })
                }


                });

        })
    })


});

passport.serializeUser(function(staff, done) {
    console.log(staff)
    done(null, staff);
});

passport.deserializeUser(function(staff, done) {
    console.log(staff)
    done(null, staff)
});




router.post('/login',passport.authenticate('local', {
    successfulRedirect: "/orders",
    failureRedirect: "/orders/login"
}),authenticationMiddleware(),
    function(req, res) {
        res.redirect("/orders")
    }
);

router.get("/login", function (req,res) {

    res.render("login")
})

router.get("/logout", (req,res)=>{
    req.session.destroy();
    req.logout();
    console.log(req.session)
    res.redirect("/orders/login")

})

router.get('/',authenticationMiddleware(), function(req, res) {
    console.log(req.isAuthenticated())
    console.log(req.user)
    Orders.findAll().then(result => {
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


            Staff.findAll({attributes: ["role"], where: {staff_id: req.user.staff_id}}).then((role) => {
                console.log(role[0].role)
                if (role[0].role === 4 || role[0].role === 1 ) {
                    return next()
                }
                else if (role[0].role === 2 || role[0].role === 3 ) {
                    return res.redirect('/orders/login')
                }

            })

        } else {
             return res.redirect('/orders/login')
        }
    }
}

module.exports = router;
