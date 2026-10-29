
import userModel from "../model/user.model.js";
import crypto from "crypto"
import jwt from "jsonwebtoken"
import config from "../configuration/config.js";
import { json } from "express";
import { ref } from "process";
import { configDotenv } from "dotenv";
import sessionModel from "../model/sessions.model.js";


export async function registerUser(req,res) {
  
  const {username, email, password} = req.body;

  const isUserExists = await userModel.findOne({
    $or : [
      {username},
      {email}
    ]
    })  

    if(isUserExists){
      res.status(409).json({
        message : "user already exists with provided either username or password!"
      })
    }


    const hashedPass = crypto.createHash("sha256").update(password).digest("hex");

    const savedUser = await userModel.create({
      username,
      email,
      password : hashedPass
    })



        // jwt token creation 
     const refreshToken = jwt.sign({
      id: savedUser._id
    }, config.JWT_SECRET, {
      expiresIn : "7d"
    })

    const refreshHashToken = crypto.createHash("sha256").update(refreshToken).digest("hex");

    const session = sessionModel.create({
        user : savedUser._id,
        refreshTokenHash : refreshHashToken,
        ip : req.ip,
        userAgent : req.headers["user-agent"],

    })

    const accessToken = jwt.sign({
      id: savedUser._id,
      sessionId : session._id,

    }, config.JWT_SECRET, {
      expiresIn : "15m"
    })

   

    res.cookie("refreshToken", refreshToken, {
      httpOnly : true,
      secure : true,
      sameSite : "strict",
      maxAge : 7 * 24 * 60 * 60 *1000,

    })

    res.status(201).json({
      message : "user registered successfull 🥳",
      user : {
        username : savedUser.username,
        email : savedUser.email
      },
      accessToken,

    })


}


export async function login (req, res){
  const {email, password} = req.body;

  const user = await userModel.findOne({
    email,
  })

  if(!user) {
    return res.status(404).json({
      message : "user not found"
    })
  }


  const refreshToken = jwt.sign({
    id : user._id,
  }, config.JWT_SECRET, {
    expiresIn : "7d"
  })

  const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

  const session = await sessionModel.create({
    user : user.id,
    refreshTokenHash,
    ip : req.ip,
    userAgent : req.headers["user-agent"]
  })

  res.cookie("refreshToken", refreshToken,{
    httpOnly : true,
    secure : true,
    sameSite : "strict",
    maxAge : 7 * 4 * 60 * 60 * 1000,
  })


  const accessToken = jwt.sign({
    id : user._id,

  }, config.JWT_SECRET, { expiresIn : "15m"});

  
  res.status(200).json({
    message : "user logged-in  successfully",
    user : {
        username : user.username,
        email : user.email,
    },
    accessToken,
  })

}


export async function getAllUsers(req, res) {

  const users  = await userModel.find()

  if(!users.length) throw new Error("no users in the database");


  res.status(200).json({
    message : "all users fetched",
    users
  })
  
}

export async function getMe(req, res) {

  const token = req.headers.authorization?.split(" ")[1];

  if(!token) return res.status(404).json({message : "token not found"});

  const decoded = jwt.verify(token, config.JWT_SECRET);

  const user = await userModel.findById(decoded.id);

  res.status(200).json({
    message : "user is fetched",
    user :{
      username : user.username,
      email : user.email
    }
  })

  
}

export async function refreshToken(req, res) {
  const refreshToken = req.cookies.refreshToken;

  // if refresg token not found then 
  if(!refreshToken) return res.status(401).json({mesage:"Refresh Token not found"});
  
  //  if we found the refresh token we have to now extract the user
  const decode = jwt.verify(refreshToken, config.JWT_SECRET);


    const refreshHashToken = crypto.createHash("sha256").update(refreshToken).digest("hex");

    const session = await sessionModel.findOne({
      refreshTokenHash : refreshHashToken,
      revoke : false,

    })


      if(!session){
        return res.status(400).json({
          message : "invalid refresh token"
        })
      }



  // generate the brand new access token 
  const accessToken = jwt.sign({
    id : decode.id,
  }, 
    config.JWT_SECRET,
    { expiresIn : "15m"}
  )

  const newRefreshToken = jwt.sign({
    id : decode.id,

  }, config.JWT_SECRET,{
    expiresIn : "7d"
  })

  const newRefreshTokenhash = crypto.createHash("sha256").update(newRefreshToken).digest("hex");

  session.refreshTokenHash = newRefreshTokenhash;
  await session.save();

  res.cookie("refreshToken", newRefreshTokenhash, {
      httpOnly : true,
      secure : true,
      sameSite : "strict",
      maxAge : 7 * 24 * 60 * 60 *1000,

    })

  res.status(200).json({
    mesage:"new fresh accessToken is generated successfully",
    accessToken,

  })


}

export async function logout(req,res){
  const refreshToken = req.cookies.refreshToken;
  if(!refreshToken){
    return res.status(400).json({
      message:"Refresh token not found!"
    })
  }

  const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

  const session = await sessionModel.findOne({
    refreshTokenHash,
    revoke : false,

  })

  if(!session){
    return res.status(400).json({
      message  : "invalid refresh token!"
    })
  }

  session.revoke = true;
  await session.save();


  res.status(201).json({
    message : "logout successfully",
    session
  })

}

export async function logoutAll(req,res) {
  
  const refreshToken = req.cookies.refreshToken;

  if(!refreshToken){
    return res.status(400).json({
      message: "refresh token not found!"
    })
  }

  const decode = jwt.verify(refreshToken,config.JWT_SECRET);

  await sessionModel.updateMany({
    user : decode._id,
    revoke : false 
  }, {
    revoke : true
  })

  res.clearCookie("refreshToken")
  res.status(200).json({
    message: "loged-out from all devices successfully",
  })


}

