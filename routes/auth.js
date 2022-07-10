const express = require('express');
const router = express.Router();
const Users = require('../models/Users');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = "I@mTheBe$tH@cker"
const fetchuser = require('../middleware/fetchuser')

// Create a user using POST "/api/auth/createuser" Doesn't require auth 
router.post('/createuser',[
    body('email','Enter a vaild email address').isEmail(),
    body('fname','Enter a valid name').isLength({ min: 3 }),
    body('lname','Enter a valid name'),
    body('password','Password must be atleat 5 characters').isLength({ min: 5 }),
],async (req,res)=>{
  // If there are errors, return bad request and error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success:false, errors: errors.array() });
    }
    // Check whether the email already exists
    try {
      let user = await Users.findOne({email: req.body.email});
      if(user){
        return res.status(400).json({success:false, error:"Email Aalready Exists"});
      }
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password,salt);

      user = await Users.create({
        fname: req.body.fname,
        lname: req.body.lname,
        email: req.body.email,
        password: secPass,
      })

      const data ={user:{id:user.id}}
      const authToken = jwt.sign(data,JWT_SECRET);
      res.json({success:true, authToken:authToken})

    } catch (error) {
      console.error(error);
      res.status(500).json({success:false, error:"Some Error Occured"});
    }
});


// Authenticate a user using POST "/api/auth/login" Doesn't require login 
router.post('/login',[
    body('email','Enter a vaild email address').isEmail(),
    body('password','Password must be atleat 5 characters').isLength({ min: 5 }),
],async (req,res)=>{
  // If there are errors, return bad request and error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success:false, errors: errors.array() });
    }
    const {email,password} = req.body;
    try {
      let user = await Users.findOne({email});
      if(!user){
        return res.status(400).json({success:false, error: "Invalid Email or Password"})
      }
      const pwdComp = await bcrypt.compare(password,user.password);
      if(!pwdComp){
        return res.status(400).json({success:false, error: "Invalid Email or Password"});
      }
      const data ={user:{id:user.id}};
      const authToken = jwt.sign(data,JWT_SECRET);
      res.json({success:true ,authToken:authToken})
    } catch (error) {
      console.error(error);
      res.status(500).json({success:false, error:"Some Error Occured"});
    }
});

// Get logged in user details using POST "/api/auth/getuser" requires login
router.post('/getuser', fetchuser, async (req,res)=>{
    try {
      const userId = req.user.id;
      const user = await Users.findById(userId).select("-password");
      res.json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({error:"Some Error Occured"});
    }
});

module.exports = router