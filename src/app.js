const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/user");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const cors = require("cors")
const { userAuth } = require('./middlewares/auth');

const app = express();

app.use(cors(
  {
    origin: "http://localhost:5173",
    credentials: true
  }
));
app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require('./routes/user')


app.use('/', authRouter);
app.use('/', profileRouter);
app.use('/', requestRouter)
app.use('/', userRouter)


// Get user by email

app.get("/user", userAuth, async (req, res) => {
  const userEmail = req.body.emailId;

  try {
    const users = await User.find({ emailId: userEmail });
    if (users.length === 0) {
      res.status(404).send("User not found");
    } else {
      res.send(users);
    }
  } catch (err) {
    res.status(400).send("Something went wrong");
  }
});

//Feed API - GET /feed - get all the users form the database

app.get("/feed", userAuth, async (req, res) => {
  try {
    const users = await User.find({});
    if (users.length === 0) {
      res.status(404).send("Users not found");
    } else {
      res.send(users);
    }
  } catch (err) {
    res.status(400).send("Something went wrong");
  }
});

app.delete("/user", userAuth, async (req, res) => {
  const userId = req.body.userId;
  try {
    const user = await User.findByIdAndDelete(userId);
    res.send("User deleted successfully");
  } catch (err) {
    res.status(400).send("Something went wrong");
  }
});

// update the data of the user

app.patch("/user/:userId", userAuth, async (req, res) => {
  // const userId = req.body.userId;
  const userId = req.params?.userId;
  const data = req.body;
  try {
    const ALLOWED_UPDATES = ["photoUrl", "gender", "age", "about", "skills"];
    const isUpdatesAllowed = Object.keys(data).every((k) =>
      ALLOWED_UPDATES.includes(k)
    );
    if (!isUpdatesAllowed) {
      throw new Error("Update not allowed");
    }
    if (data?.skills.length > 10) {
      throw new Error("Skills cannot be greater than 10");
    }
    await User.findByIdAndUpdate({ _id: userId }, data, {
      returnDocument: "after",
      runValidators: true,
    });
    res.send("User data updated successfully");
  } catch (err) {
    // res.status(400).send("Something went wrong")
    res.status(400).send("UPDATE FAILED:" + err.message);
  }
});

connectDB()
  .then(() => {
    console.log("Database Connection established");
    app.listen(8080, () => {
      console.log("Server is listening at port 8080 ....");
    });
  })
  .catch((err) => {
    console.log("Database cannot be connected", err.message);
  });
