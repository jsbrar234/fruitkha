const Users = require("../models/users");
var express = require('express');
const { default: mongoose } = require('mongoose');

const checkAdmin = async() => {
    const data = await Users.find({
      role : "admin"
    })
  
    if(data){
      return data;
    }
    else{
      return null
    }
  }

  module.exports.checkAdmin = checkAdmin