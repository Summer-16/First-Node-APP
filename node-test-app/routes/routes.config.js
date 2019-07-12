var jwt = require('jsonwebtoken');
var passwordHash = require('password-hash');
var logincount = 0;
//var fs = require('fs');
//var privateKey = fs.readFileSync('../config/key.txt');
var privateKey = 'summer33@@*&)2224.SDWDsssss';
const mongodb_connect = require('../config/config.mongo');
const mailer = require('./mail.js');
var host;

exports.routesConfig = function (app) {
    app.post('/sign_up', function (req, res) {
        var name = req.body.name;
        var email = req.body.email.toLowerCase();
        var pass = req.body.password;
        var phone = req.body.phone;

        var message_error = "";
        var check = 1;
        if (name == '') {
            console.log("Empty name");
            message_error = "one or more value is empty Please fill all Fields";
            console.log(message_error);
        }
        else if (email == '') {
            console.log("Empty Email");
            message_error = "one or more value is empty Please fill all Fields";
            console.log(message_error);
        }
        else if (pass == '') {
            console.log("Empty Password");
            message_error = "one or more value is empty Please fill all Fields";
            console.log(message_error);
        }
        else if (phone == '') {
            console.log("Empty Phone");
            message_error = "one or more value is empty Please fill all Fields";
            console.log(message_error);
        }
        else if (email) {
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if (!re.test(email)) {
                message_error = "Please provide a valid email address";
                console.log("Email format wrong");
                check = 0;
            }
            mongodb_connect.findemail(email, function (err, result) {
                if (!err && result) {
                    if (result.email == email) {
                        res.render('pages/sign_up', { message: "Email Id already Exist try logging in or give new ID." });
                        check = 0;
                        console.log("Email Id already Exist");
                    }
                }
            });
        }
        else if (phone.length != 10) {
            message_error = "Please provide a valid Mobile Number";
            console.log("Phone length not 10");
            check = 0;
        }
        else if (pass.length < 8) {
            message_error = "Password Must be 8 or more digit long";
            console.log("Pass length not 8");
            check = 0;
        }
        if (name != '' && email != '' && pass != '' && phone != '' && check == 1) {
            var token = jwt.sign({
                exp: Math.floor(Date.now() / 1000) + 300,
                email: email
            }, privateKey);

            var data = {
                "name": name,
                "email": email,
                "Hpassword": passwordHash.generate(pass),
                "phone": phone,
                "verified": 0
            }

            mongodb_connect.insertdata(data, function (err, result) {
                if (!err) {
                    var link = "http://127.0.0.1:8181/verify?id=" + token;
                    mailer.mailsend_registered(data, link, pass);
                    res.render('pages/login', { message: "You are registered, Please verify your email to log in. Verification link sent on your registered email.", session_check: false, resetpass: false, newpass: false });
                    check = 0;
                    console.log(result);
                }
                else {
                    console.log("Some error occur in DB insertion");
                }
            })

        }
        else {
            //req.flash('error_msg', message_error);
            res.render('pages/signup', { message: message_error });
        }

    });

    app.post('/sign_in', function (req, res) {
        var email = req.body.email;
        var Pass = req.body.password;
        console.log(email);

        mongodb_connect.findemail(email, function (err, result) {
            console.log(err);
            console.log(result);

            if (!err && result && passwordHash.verify(Pass, result.Hpassword)) {
                if (result.verified == 1) {
                    console.log(req.session)
                    console.log("Login ok");
                    req.session.email = email;
                    req.session.name = result.name;
                    // req.flash('success_msg', 'You logged in hooray');
                    console.log("Redirecting to home");
                    return res.redirect('/');
                }
                else {
                    console.log("Login Failed");
                    res.render('pages/login', { message: "login_error, Cyka Blyat Email is not verified", resetpass: false, newpass: false });
                }
            }
            else {
                console.log("Login Failed");
                console.log(err);
                logincount++;
                if (logincount < 3) {
                    res.render('pages/login', { message: "login_error, Cyka Blyat Email or Pass is wrong", resetpass: false, newpass: false });
                }
                else {
                    res.render('pages/login', { message: "login_error, Cyka Blyat Email or Pass is wrong, did you forgot the password", resetpass: true, newpass: false });
                }
            }
        })
    });

    app.post('/reset_pass', function (req, res) {
        var email = req.body.email;
        if (email) {
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if (!re.test(email)) {
                console.log("Email format wrong");
                res.render('pages/resetpass', { message: "Email id is wrong", session_check: false });
            }
            else {
                mongodb_connect.findemail(email, function (err, result) {
                    if (!err && result != null) {
                        if (result.email == email) {
                            var token = jwt.sign({
                                exp: Math.floor(Date.now() / 1000) + 300,
                                email: email,
                                newpass: true
                            }, privateKey);

                            var link = "http://127.0.0.1:8181/new_pass?id=" + token;
                            mailer.mailsend_passreset(email, link);
                            res.render('pages/login', { message: "Please check your mail for reset link", session_check: false, resetpass: false, newpass: false });
                        }
                        else {
                            res.render('pages/login', { message: "Email doesn't match", session_check: false, resetpass: true, newpass: false });
                        }
                    }
                    else {
                        res.render('pages/login', { message: "Not a registered user", session_check: false, resetpass: true, newpass: false });
                    }
                });
            }
        }


    });

    app.get('/new_pass', function (req, res) {
        jwt.verify(req.query.id, privateKey, function (err, decoded) {
            if (err) {
                console.log("Bad Token");
                res.end("<h1>Bad request</h1>");
            } else {
                mongodb_connect.findemail(decoded.email, function (err, result) {
                    if (!err && result && result.email == decoded.email && result.verified == '1') {
                        res.render('pages/login', { message: "Enter New Password", session_check: false, resetpass: false, newpass: decoded.newpass, email:decoded.email });
                    }
                });
            }
        });


    });

    app.post('/new_pass_update', function (req, res) {
        var email = req.body.email.toLowerCase();
        var hpass = passwordHash.generate(req.body.password);

        mongodb_connect.findemail(email, function (err, result) {
            if (!err && result && result.email == email) {
                mongodb_connect.updatepassword(email,hpass, function (err) {
                    if (!err) {
                        console.log("password updated");
                        res.render('pages/login', { message: "password updated", session_check: false, resetpass: false, newpass: false });
                        }
                });
            }
        });

    });


    app.use(function (req, res, next) {
        res.locals.message = "";
        res.locals.email = "";
        res.locals.resetpass = false;
        res.locals.newpass = false;
        next()
    })

    // let setGlobals = function(req,res,next){
    //     res.locals.resetpass = true
    //     next()
    // }

    // index page 
    app.get('/', function (req, res) {
        if (req.session.email)
            res.render('pages/index', { session_check: true, session_name: req.session.name });
        else
            res.render('pages/login', { session_check: false });
    });

    // about page 
    app.get('/contact', function (req, res) {
        if (req.session.email)
            res.render('pages/contact', { session_check: true, session_name: req.session.name });
        else
            res.render('pages/login', { session_check: false });
    });

    // home page 
    app.get('/index', function (req, res) {
        if (req.session.email)
            res.render('pages/index', { session_check: true, session_name: req.session.name });
        else
            res.render('pages/login', { session_check: false });
    });

    // login page 
    app.get('/login', function (req, res) {
        res.render('pages/login', { session_check: false });
    });

    // login page 
    app.get('/resetpass', function (req, res) {
        res.render('pages/resetpass', { message: "", session_check: false });
    });

    // logout page 
    app.get('/logout', function (req, res) {
        req.session.destroy();
        //req.session = null;
        res.render('pages/login', { session_check: false });
    });

    // signup page 
    app.get('/signup', function (req, res) {
        res.render('pages/signup', { message: "", session_check: false });
    });

    app.get('/verify', function (req, res) {
        console.log(req.query.id);
        console.log(privateKey);
        jwt.verify(req.query.id, privateKey, function (err, decoded) {
            if (err) {
                console.log("Bad Token");
                res.end("<h1>Bad Token</h1>");
            } else {
                mongodb_connect.findemail(decoded.email, function (err, result) {
                    if (!err && result && result.email == decoded.email && result.verified != '1') {
                        mongodb_connect.updatedata(decoded.email, function (err) {
                            if (!err) {
                                console.log("email is verified");
                                // res.end("<h1>Email " + result.email + " is been Successfully verified, You can go and login");
                                res.render('pages/login', { message: "Email " + result.email + " is been Successfully verified, You can go and login" });
                            }
                        });
                    }
                    else {
                        if (result.verified == '1') {
                            console.log("email is already verified");
                            // res.end("<h1>Email " + result.email + " is been Successfully verified, You can go and login");
                            res.render('pages/login', { message: "Email " + result.email + " is already verified, You can login" });
                        }
                        else {
                            console.log("email is not verified");
                            res.end("<h1>Bad Request</h1>");
                        }
                    }
                });
            }
        });
    });

}