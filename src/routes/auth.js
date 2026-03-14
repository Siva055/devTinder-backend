const express = require("express");
const authRouter = express.Router()
const { validateSignUpData } = require("../utils/validation");
const User = require("../models/user");
const bcrypt = require("bcrypt");

// signup

authRouter.post("/signup", async (req, res) => {
  // Validation of data

  await validateSignUpData(req);

  const { firstName, lastName, emailId, password } = req.body;

  //Encrypt the password
  const passwordHash = await bcrypt.hash(password, 10);

  console.log(passwordHash);

  // Creating a new instance of the User Model

  const user = new User({
    firstName,
    lastName,
    emailId,
    password: passwordHash,
  });

  try {
    const savedUser = await user.save(); // this function returns a promise

    // create a jwt token
    const token = await savedUser.getJWT();

    // add the token to the cookie and send the response back to the user
    res.cookie("token", token, { httpOnly: true, expires: new Date(Date.now() + 8 * 3600000) });

    res.json({ message: "User added successfully!!!", data: savedUser });
  } catch (err) {
    res.status(400).send("Error saving the user: " + err.message);
  }
});

// login

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    const user = await User.findOne({ emailId: emailId });

    if (!user) {
      throw new Error("Invalid Credentials");
    }

    const isPasswordValid = await user.validatePassword(password)

    if (isPasswordValid) {
      // create a jwt token
      const token = await user.getJWT();

      // add the token to the cookie and send the response back to the user
      res.cookie("token", token, { httpOnly: true, expires: new Date(Date.now() + 8 * 3600000) });
      res.send(user);
    } else {
      res.status(500).send("Invalid Credentials");
    }
  } catch (err) {
    res.status(400).send("Error logging in for the user", err.message);
  }
});

// logout

authRouter.post("/logout", async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now())
  })
  res.send("Logged out successfully!!")
})

module.exports = authRouter;