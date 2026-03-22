const { SendEmailCommand } = require("@aws-sdk/client-ses");
const { sesClient } = require("./sesClient")

const createSendEmailCommand = (toAddress, fromAddress, subject, body) => {
    return new SendEmailCommand({
        Destination: {
            CcAddresses: [

            ],
            ToAddresses: [
                toAddress
            ]
        },
        Message: {
            Body: {
                Html: {
                    Charset: "UTF-8",
                    Data: "<h1>${body}</h1>"
                },
                Text: {
                    Charset: "UTF-8",
                    Data: "This is the text format email"
                },
                Subject: {
                    Charset: "UTF-8",
                    Data: subject
                }
            },
            Source: fromAddress,
            ReplyToAddresses: [

            ]
        }
    })
}

const run = async (subject, body) => {
    const SendEmailCommand = createSendEmailCommand(
        "recipient@example.com",
        "sender@example.com",
        subject,
        body
    );

    try {
        return await sesClient.send(SendEmailCommand)
    } catch (caught) {
        if (caught instanceof Error && caught.name === "MessageRejected") {
            /** @type {import('@aws-sdk/client-ses').MessageRejected}  */
            const messageRejectedError = caught;
            return messageRejectedError;
        }
        throw caught;
    }
};

module.exports = { run }