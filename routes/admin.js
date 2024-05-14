var express = require('express');
const { default: mongoose } = require('mongoose');
const auth = require('../middleware/auth');
var router = express.Router();
const jwt = require('jsonwebtoken');
const Users = require('../models/users');


const checkAdmin = async () => {
  const data = await Users.find({
    role: "admin"
  })

  if (data) {
    return data;
  }
  else {
    return null
  }
}

// // Create Admin
// router.post('/createAdmin', async (req, res, next) => {

//     try {
//         const { firstName, lastName, phone, email, password } = req.body;

//         const existingUser = await Admin.findOne({ email });

//         if (existingUser) {
//           return res.status(409).json({ message: "User Already Exists" });
//         }

//         const newUser = new Admin({
//           firstName,
//           lastName,
//           phone,
//           email,
//           password,
//         });

//         const savedUser = await newUser.save();

//         var token = jwt.sign({
//           userId: savedUser._id,
//         }, 'adminLogin');

//         savedUser.accessToken = token;
//         let data = await savedUser.save();

//         if (data) {
//           return res.status(201).json({
//             message: "Account Created Successfully",
//             data: data
//           });
//         } else {
//           throw new Error("Failed to Create Account");
//         }
//       } catch (error) {
//         console.error("Error:", error);
//         res.status(500).json({ message: "Internal server error" });
//       }
// })


// // Login Admin

router.post('/adminLogin', async (req, res, next) => {
  try {
    let { email, password } = req.body;
    let record = await Users.findOne({ email, password })


    if (record == null) {
      res.status(401).send({ message: "Invalid Credentials" });
    }

    if (record.role === 'admin'){
      var token = jwt.sign({
        userId: record._id,
      }, 'login');

      record.accessToken = token;
      let data = await record.save();

      if (data) {
        return res.status(200).send({
          statusCode: 200,
          message: "Admin Login Successfull",
          accessToken: token
        })
      }
      else {
        return res.status(401).send({
          message: "Admin Login Failed"
        })
      }
    }

    else{
      return res.status(400).send({
        message: "THIS PORTAL IS FOR ADMINS NOT FOR USERS"
      })
    }
  } catch (error) {
    console.log('error', error)
    return res.status(500).send({
      message: "INTERNAL SERVER ERROR"
    })
  }
})

// GET USER DETAILS


router.get('/getUserDetailsAdmin',auth, async (req, res, next) => {

  try {
    const data = await Users.find({role : "user"});
  
    if(data){
      res.status(200).send({
        message : "DATA FOUND",
        data : data
      })
    }
  
    else{
      res.status(400).send({
        message : "DATA NOT FOUND"
      })
    }
  } catch (error) {
    console.log("error", error)
    res.status(500).send({
      message : "Internal Sever Error"
    })
  }

});






module.exports = router;
