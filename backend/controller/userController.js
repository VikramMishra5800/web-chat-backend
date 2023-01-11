const asyncHandler = require("express-async-handler");
const { findOne } = require("../models/userModels");
const User = require("../models/userModels")
const generateToken = require("../config/generateToken");
const { json } = require("express");

//asyncHandler is a npm package to handle error related to async

/* for registration */
const registerUser = asyncHandler(async(req,res,next) =>{
    const {name,email,password,pic} = req.body

    // To check whether the user already exists or not
    const userExists = await User.findOne({email})

    //if exists throw an error message
    if(userExists)
    {
        next(Error("User with same Email id already exists"));
    }

    //if not exists, creating the user
    const newUser = await User.create({
        name,
        email,
        password,
        pic,
    })

    // if user created successfully then send data in the form of json
    if(newUser)
    {
        res.json({
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            pic: newUser.pic,
            token: generateToken(newUser._id)
        })
    }

    //if failed to create a user then throw an error message
    else
    {
        next(Error("Failed to create a user"));
    }
})

/* for login */
const authUser = async(req,res,next) => {
    const {email,password} = req.body
    const user = await User.findOne({email});

    if(user && (await user.matchPassword(password)))
    {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            pic: user.pic,
            token: generateToken(user._id)
        })
    }
    else {
        next(Error);
      }
}

// /api/user?search=vikram      -> to search any query
const allUsers = asyncHandler(async(req,res) => {
    const keyword = req.query.search
    ? {
        $or: [
            {name: { $regex: req.query.search, $options: "i"}},
            {email: { $regex: req.query.search, $options: "i"}}
        ]
    }
    : {};

    const users = await User.find(keyword).find({_id: {$ne: req.user._id}});
    res.send(users);
})


module.exports = {registerUser,authUser,allUsers};