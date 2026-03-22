const express = require("express");
const requestRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest")
const User = require('../models/user')

const sendEmail = require("../utils/sendEmail")

requestRouter.post("/request/send/:status/:toUserId", userAuth, async (req, res) => {
  try {
    const fromUserId = req.user._id;
    const toUserId = req.params.toUserId;
    const status = req.params.status;

    const allowedStatus = ["ignored", "interested"]
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        message: "Invalid status type" + status
      })
    }

    //If toUserId exists in the db

    const toUser = await User.findById(toUserId)

    if (!toUser) {
      return res.status(404).json({
        message: "User not found"
      })
    }

    // If there is an existing connection request present
    const existingConnectionRequest = await ConnectionRequest.findOne({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId }
      ]
    })

    if (existingConnectionRequest) {
      return res.status(400).send({ message: "Connection Request already exists!!" })
    }

    const connectionRequest = new ConnectionRequest({
      fromUserId, toUserId, status
    });

    const connectionRequestData = await connectionRequest.save();

    const emailRes = await sendEmail.run("A new friend request from " + req.user.firstName, req.user.firstName + " is " + status + " in " + toUser.firstName);
    console.log(emailRes)

    if (status === "interested") {
      res.json({
        message: req.user.firstName + " is " + status + " in " + toUser.firstName,
        data: connectionRequestData
      })
    } else {
      res.json({
        message: req.user.firstName + status + toUser.firstName,
        data: connectionRequestData
      })
    }
  }
  catch (err) {
    res.status(400).send("ERROR: " + err.message)
  }

  res.send(user.firstName + "sent the connection request!")
})


requestRouter.post("/request/review/:status/:requestId", userAuth, async (req, res) => {

  try {
    const loggedInUser = req.user;
    const { status, requestId } = req.params;

    // validate the status

    const allowedStatus = ["accepted", "rejected"]
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Status not allowed!" })
    }

    const connectionRequest = await ConnectionRequest.findOne({
      _id: requestId,
      toUserId: loggedInUser._id,
      status: "interested"
    })

    if (!connectionRequest) {
      return res
        .status(404)
        .json({ message: "Connection Request Not Found" })
    }
    // Akshay => Elon
    // Is Elon loggedin user
    // always the receiver person should be the loggedinuser
    // loggedinuserid = touserid
    // status  = interested
    // request id should be valid

    connectionRequest.status = status;

    const data = await connectionRequest.save();

    res.json({ message: "Connection Request " + status, data })

  } catch (err) {
    res.status(400).send("ERROR: " + err.message)
  }

})

module.exports = requestRouter;