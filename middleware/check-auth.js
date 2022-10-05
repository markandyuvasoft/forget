import express from 'express'
import  Jwt  from 'jsonwebtoken'
// import config from '../config/config.js'

const checkauth=(req,res,next)=>{
    
    try{
const token= req.headers.authorization.split(" ")[1]
//  console.log(token)
// const verify = Jwt.verify(token,config.secret)

 const verify = Jwt.verify(token,"thshsnsnsnsn")


next()

    }
    catch(error)
    {
        return res.status(401).json({
            msg: 'only access authorised person'
        })
    }
} 
export default checkauth;