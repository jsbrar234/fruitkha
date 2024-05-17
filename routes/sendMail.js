var express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const nodemailer = require('nodemailer')
const { default: mongoose } = require('mongoose');




router.post('/sendFeedback', async (req, res, next) => {
    const { name, email, phone, subject, message } = req.body;

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.NODE_EMAIL,
            pass: process.env.NODE_EMAIL_PASS
        }
    });


    let mailOptions = {
        from: email,
        to: 'jsbrar283@gmail.com',
        subject: subject,
        text: `email : ${email} \n phone : ${phone} \n message : ${message} `
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
            res.status(400).send({
                message: "FAILED TO SEND EMAIL"
            })
        } else {
            console.log('Email sent: ' + info.response);
            res.status(200).send({
                message: "MAIL SENT SUCCESSFULLY"
            })
        }
    });

});



module.exports = router;