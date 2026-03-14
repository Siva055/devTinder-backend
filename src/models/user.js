const mongoose = require("mongoose")
const validator = require("validator")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    firstName : {
        type: String,
        required: true,
        minLength: 4,
        maxLength: 50
    },
    lastName : {
        type : String
    },
    emailId : {
        type : String,
        lowercase: true,
        required: true,
        unique: true,
        trim : true,
        validate(value){
           if(!validator.isEmail(value)){
            throw new Error("Invalid email address:"+value)
           }
        }
    },
    password : {
        type : String,
        required: true,
        validate(value){
            if(!validator.isStrongPassword(value)){
                throw new Error("Enter a strong password")
            }
        }
    },
    age : {
        type : Number,
        min: 18
    },
    gender : {
        type :  String
    },
    photoUrl:{
        type: String,
        default: "https://static.vecteezy.com/system/resources/thumbnails/045/944/199/small/male-default-placeholder-avatar-profile-gray-picture-isolated-on-background-man-silhouette-picture-for-user-profile-in-social-media-forum-chat-greyscale-illustration-vector.jpg",
        validate(value){
            if(!validator.isURL(value)){
                throw new Error("Invalid Photo URL" + value)
            }
        }
    },
    about : {
        type: String,
        default: "This is a default about me"
    },
    skills: {
        type : [String]
    }
},{timestamps : true})

userSchema.methods.getJWT = async function () {
  const user = this;

  const token = jwt.sign(
    { _id: user._id },
    "DEV@Tinder$790",
    { expiresIn: "1h" } 
  );

  return token;
};

userSchema.methods.validatePassword  = async function (passwordInputByUser) {
    const user = this;
    const passwordHash = user.password;

    const isPasswordValid = await bcrypt.compare(passwordInputByUser, passwordHash);

    return isPasswordValid;
}

module.exports = mongoose.model("User", userSchema)