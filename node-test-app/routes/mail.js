var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'arvindsharma5133@gmail.com',
        pass: 'Borntodie1'
    }
});


exports.mailsend_registered=function(data,link,pass){
    const mailOptions = {
        from: 'arvindsharma5133@gmail.com', // sender address
        to: data.email, // list of receivers
        subject: 'SignUP Sucessfull, Confirm EMAIL', // Subject line
        html: "<p>hey, you just signed up on my test page.<br>Here are your credentials save then for future use and keep them safe<br>email : "+data.email+"<br>Pasword : "+pass+"<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a></p>" //plain text body
    };
    
    transporter.sendMail(mailOptions, function (err, info) {
        if (err)
            console.log(err)
        else
            console.log(info);
    });
}



exports.mailsend_passreset=function(email,link){   
    const mailOptions = {
        from: 'arvindsharma5133@gmail.com', // sender address
        to: email, // list of receivers
        subject: 'Reset Password', // Subject line
        html: "<p>hey, you requested for password reset.<br> Please Click on the link to reset your password.<br><a href="+link+">Click here to Reset</a></p>" //plain text body
    };
    
    transporter.sendMail(mailOptions, function (err, info) {
        if (err)
            console.log(err)
        else
            console.log(info);
    });
}