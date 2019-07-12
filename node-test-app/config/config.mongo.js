const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/foodie_form');
db = mongoose.connection;
db.on('error', console.log.bind(console, "connection error"));
db.once('open', function (callback) {
    console.log("connection succeeded");
})

exports.insertdata = function (data, callback) {
    db.collection('details').insertOne(data, function (err, collection) {
        if (err) return callback(err, null);   // calllbak(err,result)
        console.log("New Record inserted Successfully");
        return callback(null, collection)
    });
}

exports.updatedata = function (mail, callback) {
    db.collection('details').findOneAndUpdate({email:mail,},{$set:{verified:"1"}},function (err, collection) {
        if (err) return callback(err);   // calllbak(err,result)
        console.log("Record updated Successfully (Verified)");
        return callback(null)
    });
}

exports.updatepassword= function (mail,hpass, callback) {
    db.collection('details').findOneAndUpdate({email:mail,},{$set:{Hpassword:hpass}},function (err, collection) {
        if (err) return callback(err);   // calllbak(err,result)
        console.log("Record updated Successfully (Verified)");
        return callback(null)
    });
}


exports.findemail = function (email, callback) {
    db.collection('details').findOne({ "email": email }, function (err, details_query) {
        if (err) return callback(err, null);   // calllbak(err,result)
        console.log("Record Found (using email for login)");
        return callback(null, details_query)
    });
}

exports.findrandom = function (random, callback) {
    console.log(random);
    db.collection('details').findOne({ "token": random }, function (err, details_query) {
        console.log(details_query);
        if (err) return callback(err, null);   // calllbak(err,result)
        console.log("Record Found (using random no)");
        return callback(null, details_query)
    });
}
