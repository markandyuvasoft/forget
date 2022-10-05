import mongoose from "mongoose";


const authSchema = new mongoose.Schema({

    name:{
        type:String,
    },
    email:{
        type:String,
    },
    password:{
        type:String,
    },
    Cpassword:{
        type:String,
    },
    mobile:{
        type:Number,
    },
    city:{
        type:String,
    },
    gender:{
        type:String,
    },
    token:{
        type:String,
        default:''
    }
})

const Auth = mongoose.model('Auth1',authSchema)

export default Auth;