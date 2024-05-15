var express = require('express');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const Users = require('../models/users');
const router = express.Router();

const nodemailer = require('nodemailer')
const Stripe = require('stripe');
const Address = require('../models/address');
const { default: mongoose } = require('mongoose');
const stripe = Stripe('sk_test_51P7mtVP2juis5ZCN59phy87RnMxw5AOJObgGLvDBOgFZeXn2zfBGvuE77dpdq8dexhkG9hEtTpv7Iw5DvhjrU9um00XQsWyePd');

// Route for user sign-up
router.post('/signUp', async (req, res, next) => {
  try {
    const { firstName, lastName, phone, email, password } = req.body;

    const customer = await stripe.customers.create({
      name: `${firstName} ${lastName} `,
      email: email,
    });

    const existingUser = await Users.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: "User Already Exists" });
    }

    const newUser = new Users({
      firstName,
      lastName,
      phone,
      email,
      password,
      customerId: customer.id
    });

    const savedUser = await newUser.save();

    var token = jwt.sign({
      userId: savedUser._id,
    }, 'login');

    savedUser.accessToken = token;
    let data = await savedUser.save();

    if (data) {
      return res.status(201).json({
        message: "Account Created Successfully",
        data: data
      });
    } else {
      throw new Error("Failed to Create Account");
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET USER DETAILS


router.get('/getUserDetails', auth, async (req, res, next) => {

  const userId = req.userId

  const data = await Users.findOne({
    _id: userId
  }, {
    firstName: 1,
    lastName: 1,
    phone: 1,
    email: 1
  })

  if (data) {
    res.status(200).send({
      message: "Data Found",
      data
    })
  }
  else {
    res.status(400).send({
      message: "No Data Found"
    })
  }

});


// LOGIN

router.post('/login', async (req, res, next) => {
  try {
    let { email, password } = req.body;
    let record = await Users.findOne({ email, password })


    if (record == null) {
      res.status(401).send({ message: "Invalid Credentials" });
    }


    else {
      var token = jwt.sign({
        userId: record._id,
      }, 'login');

      record.accessToken = token;
      let data = await record.save();

      if (data) {
        return res.status(200).send({
          statusCode: 200,
          message: "LOG IN SUCCESSFUL",
          accessToken: token
        })
      }
      else {
        return res.status(401).send({
          message: "Login Failed"
        })
      }
    }
  } catch (error) {
    return res.status(500).send({
      message: "INTERNAL SERVER ERROR",
    })
  }
})

// ADD USERS ADDRESS


router.post('/addAddress', auth, async (req, res, next) => {

  const userId = req.userId

  const { fullName, mobile, pincode, houseNo, area, landmark, city, state, isDefault } = req.body

  const data = await Address.create({
    userId: new mongoose.Types.ObjectId(userId),
    fullName,
    mobile,
    pincode,
    houseNo,
    area,
    landmark,
    city,
    state,
    isDefault
  })

  if (data) {
    res.status(200).send({
      message: "Address Added Successfully",
      data: data
    })
  }
  else {
    res.status(400).send({
      message: "Failed to Add Address",
    })
  }


});

// GET USER ADDRESS


router.post('/getAddress', auth, async (req, res, next) => {

  try {
    const userId = req.userId;

    const data = await Address.aggregate([
      {
        $match: { userId: new mongoose.Types.ObjectId(userId) }
      },
      {
        $lookup: {
          from: "users",
          let: { uid: "$userId" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$uid"] }
              }
            }
          ],
          as: "userDetails"
        }
      },
    ])

    if (data.length > 0) {
      res.status(200).send({
        message: "Data Found",
        data: data
      })
    }
    else {
      res.status(400).send({
        message: "No Data Found"
      })
    }
  } catch (error) {
    console.log("ERROR", error)
    res.status(200).send({
      message: "Internal Server Error"
    })
  }

});


// FORGOT PASSWORD AND SEND OTP

router.put('/sendOtp', async (req, res, next) => {

  const { email } = req.body;

  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'jsbrar07427@gmail.com',
      pass: 'gzabllmnmytyhnmy'
    }
  });

  const verify = await Users.findOne({
    email
  })
  if (verify) {
    const otp = Math.floor(100000 + Math.random() * 900000);

    const data = await Users.findOneAndUpdate({ email: email }, { $set: { otp: otp } })

    if (data) {
      let mailOptions = {
        from: email,
        to: email,
        subject: "Fruitkha Forgot Password OTP",
        text: 
        `Dear User,
        Your One-Time Password (OTP) for verification is: ${otp.toString()}.
        
        Please use this OTP to complete your action. Do not share this OTP with anyone for security reasons.
        
        Thank you,
        Fruitkhha Pvt. Ltd.`
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
            message: "OTP SENT SUCCESSFULLY"
          })
        }
      });
    }
    else {
      return res.status(400).send({
        message: "FAILED TO SEND OTP"
      })
    }
  }
  else {
    return res.status(400).send({
      message: "There is no account aasociated with this Email"
    })
  }


});

// VERIY OTP 
router.post('/verifyOtp', async (req, res, next) => {

  const {email, otp} =req.body;

  const data = await Users.findOne({email})


  try {
    if(data){
      if(otp==data.otp){
        return res.status(200).send({
          success : true,
          message : "OTP VERIFIED"
        })
      }
  
      else{
        return res.status(200).send({
          success : false,
          message : "INVALID OTP"
        })
      }
    }
  
    else{
      return res.status(400).send({
        message : "Unable to Find Account"
      })
    }
  } catch (error) {
    console.log('error', error)
  }

});


// FOR CHANGING PASSWORD


router.put('/changePassword', async (req, res, next) => {

  const {email, password} = req.body;

  const data = await Users.findOneAndUpdate({ email: email }, { $set: { password: password } })

  if(data){
    return res.status(200).send({
      success : true,
      message : "Password Updated Successfully"
    })
  }

  else{
    return res.status(401).send({
      success : true,
      message : "Failed to change the Password"
    })
  }

});




module.exports = router;
