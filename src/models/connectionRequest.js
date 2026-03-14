const mongoose = require('mongoose');

const connectionRequestSchema = new mongoose.Schema({
    fromUserId : {
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",// reference to the User collection
        required: true
    },
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    status: {
        type: String,
        required : true,
        enum : {
            values: ["ignore", "interested", "accepted","rejected"],
            message: `{VALUE} is incorrect status type`
        }
    }
},{
    timestamps: true
})

// connectionRequest.find({fromUserId: 693fa1d333f961e70e529372, toUserId: 693fc7f733f961e70e529378})

connectionRequestSchema.index({fromUserId: 1, toUserId: 1});

connectionRequestSchema.pre("save", function (next){
    const connectionRequest = this;
    //check if the fromUserId is same as toUserId
    if(connectionRequest.fromUserId.equals(connectionRequest.toUserId)){
        throw new Error ("Cannot send connection request to yourself!")
    }
    next();
})

const ConnectionRequestModel = new mongoose.model("ConnectionRequest", connectionRequestSchema);

module.exports = ConnectionRequestModel;