
    var Auth = auth;

    var LocalStrategy = require('passport-local').Strategy;

    passport.use('local-signup', new LocalStrategy(

        {
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass back the entire request to the callback

        }, function (req, email, password, done) {
            console.log("Signup for - ", email)
            var generateHash = function (password) {
                return bCrypt.hashSync(password, bCrypt.genSaltSync(8), null);

            }
            Auth.findOne({
                where: {
                    email: email
                }
            }).then(function (user) {
                //console.log(user);
                if (user) {
                    return done(null, false, {
                        message: 'That email is already taken'
                    });
                } else {
                    var userPassword = generateHash(password);
                    var data = {
                        email: email,
                        password: userPassword,
                        firstname: req.body.firstname,
                        lastname: req.body.lastname
                    };

                    Auth.create(data).then(function (newUser, created) {
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

    //LOCAL SIGNIN
    passport.use('local-signin', new LocalStrategy(

        {
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass back the entire request to the callback
        },
        function (req, email, password, done) {
            var Auth = auth;
            var isValidPassword = function (userpass, password) {
                return bCrypt.compareSync(password, userpass);
            }
            Auth.findOne({
                where: {
                    email: email
                }
            }).then(function (user) {
                if (!user) {
                    return done(null, false, {
                        message: 'EMAIL'
                    });
                }
                if (!isValidPassword(user.password, password)) {
                    return done(null, false, {
                        message: 'PASSWORD'
                    });
                }
                var userinfo = user.get();
                return done(null, userinfo);
            }).catch(function (err) {

                return done(null, false, {
                    message: 'WRONG'
                });
            });
        }
    ));



