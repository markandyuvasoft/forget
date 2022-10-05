import express from 'express'
import mongoose from 'mongoose'
import * as path from 'path'
import bcrypt from 'bcrypt'
import Jwt from 'jsonwebtoken'
import Auth from '../models/auth.js'
// import config from '../config/config.js'
import checkauth from "../middleware/check-auth.js";
import randomstring from 'randomstring'
import nodemailer from "nodemailer"


const authrouter = express.Router()


const secure = async (password) => {

    try {
        const passwordhash = await bcrypt.hash(password, 10)
        return passwordhash

    } catch (error) {
        res.status(400).send({ message: "error" })
    }
}

const createtoken = async (id) => {

    try {

        // const tokn = await Jwt.sign({ _id: id }, config.secret)

         const tokn = await Jwt.sign({ _id: id }, "thshsnsnsnsn")

        return tokn

    } catch (error) {

        res.send("error")
    }
}


const sendset = async (name, email, token) => {

    const transporter = nodemailer.createTransport({
        port: 465,                     // true for 465, false for other ports
        host: "smtp.gmail.com",
        auth: {
            user: 'amandighe0@gmail.com',
            pass: 'ryedthquvuawjzxh'
        },
        secure: true,
    });

    const mailoptions = {

        from: 'amandighe0@gmail.com',
        to: email,
        subject: 'reset password',
        html: '<p> hii ' + name + ', plz copy the link and <a href="https://adsasas.herokuapp.com/reset?token=' + token + '"> reset your password</a>'
    };

    transporter.sendMail(mailoptions, function (err, info) {
        if (err)
            console.log(err)
        else
            res.status(200).send(mailoptions)
    });

}


//....................................USER REGISTER START.............................................................................................
authrouter.post("/register", async (req, res) => {

    const { name, email, password, Cpassword, mobile, city, gender } = req.body

    if (!name || !email || !password || !Cpassword || !mobile || !city || !gender) {

        return res.status(422).send({ error: "plz fill the field properly" })
    }
    else {

        const spassword = await secure(req.body.password)

        const user = new Auth({
            name: req.body.name,
            email: req.body.email,
            password: spassword,
            Cpassword:spassword,
            mobile: req.body.mobile,
            city:req.body.city,
            gender:req.body.gender,

        })

        const userdata = await Auth.findOne({ email: req.body.email })

        if (userdata) {

            res.status(400).send({ message: "email already exist" })

        } else if (password != Cpassword) {

            return res.status(422).send({ error: "password are not match" })
        }
        else {

            const userd = await user.save()
        
        res.status(200).send({ message: "welcome....successful register" })
    }
}
});

//....................................USER REGISTER END.............................................................................................
  

//.................USER LOGIN START.................................................................................................................
authrouter.post('/login', async (req, res) => {

    try {

        const email = req.body.email
        const password = req.body.password

        const userdet = await Auth.findOne({ email: email })

        if (userdet) {

            const pswdmatch = await bcrypt.compare(password, userdet.password)

            const tokendata = await createtoken(userdet._id)

            if (pswdmatch) {

                const userdetails = {

                    _id: userdet._id,
                    name: userdet.name,
                    email: userdet.email,
                    password: userdet.password,
                    mobile: userdet.mobile,
                    token: tokendata
                }
                res.status(200).send({ message: " success", userdetails })


            } else {
                res.status(400).send({ message: "not correct your details" })
            }
        } else {
            return res.status(422).send({ error: "plz fill the field properly" })
        }
    } catch (error) {

        res.status(400).send({ message: "error" })
    }

})
//.................USER LOGIN END.................................................................................................................

//UPDATE USER PASSWORD.....................................................................................
authrouter.post("/update", checkauth, async (req, res, next) => {

    const userid = req.body.userid
    const password = req.body.password

    const data = await Auth.findOne({ _id: userid })

    if (data) {

        const newpswd = await secure(password)

        const userdata = await Auth.findOneAndUpdate({ _id: userid }, {
            $set: {

                password: newpswd
            }
        })

        res.status(200).send("successfully change your password")
    } else {
        res.status(400).send("user id not found please try again")
    }
})

//FORGET PASSWORD API............................................................
authrouter.post("/forget", async (req, res) => {
    try {

        const email = req.body.email

        const userdata = await Auth.findOne({ email: email })

        if (userdata) {

            const randomString = await randomstring.generate()

            const data = await Auth.updateOne({ email: email }, { $set: { token: randomString } })

            sendset(userdata.name, userdata.email, randomString)

            res.status(200).send("please check your mail and reset your password")

        } else {
            res.status(400).send("email not exist")
        }
    } catch (error) {

        res.status(400).send("error please try again")
    }
})


//RESET PASSWORD API START.......................................................
authrouter.get("/reset", async (req, res) => {

    try {

        const token = req.query.token

        const tokendata = await Auth.findOne({ token: token })

        if (tokendata) {

            const password = req.body.password
            const newpass = await secure(password)

            const userdata = await Auth.findByIdAndUpdate({ _id: tokendata._id }, { $set: { password: newpass, token: '' } }, { new: true })

            res.status(200).send("user password is updated")

        } else {

            res.status(401).send("expire your link send again forget requiest")
        }
    } catch (error) {

    }
})


export default authrouter;