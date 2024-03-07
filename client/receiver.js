const net = require("net");
const fs = require("fs");
const crypto = require("crypto");
const { HASHSEPARATOR, ENDOFFILE } = require("./constants");

const socket = net.connect(
    8888,
    "192.168.8.105",
    () => {
        console.log("Connected to the server");
    }
);

let fileStream;
let receivedUuid;
let receivedHash;
let hash = crypto.createHash("sha256")
let alreadyExistFlag = false

const onData = (chunk) => {
    const textChunk = chunk.toString()
    if (textChunk.includes(HASHSEPARATOR)) {
        receivedUuid = textChunk.split(HASHSEPARATOR)[0]
        receivedHash = textChunk.split(HASHSEPARATOR)[1]
        if (fs.existsSync(receivedUuid)) {
            alreadyExistFlag = true
            console.log("FILE WITH THAT UUID ALREADY EXIST")
        } else
            alreadyExistFlag = false
    } else if (alreadyExistFlag) return;
    else {
        fileStream = fs.createWriteStream(receivedUuid, { flags: 'a' })
        const indexOfEnd = textChunk.indexOf(ENDOFFILE)
        if (indexOfEnd == -1) {
            fileStream.write(chunk);
            hash.update(chunk)
        } else {
            const leftOverContent = textChunk.replace(ENDOFFILE, "")
            fileStream.end(leftOverContent)
            fileStream.on("finish", ()=> console.log("FINISHEDDD"))
            hash.update(leftOverContent) 
            console.log("Receiver: File received successfully.");

            const computedHash = hash.digest("hex");
            hash = crypto.createHash("sha256")

            if (computedHash === receivedHash) {
                console.log("Receiver: Hash verification successful.");
            } else {
                console.error("Receiver: Hash verification failed. File integrity compromised.");
            }
        }
    }
}

socket.on("data", onData);

socket.on("error", (err) => {
    console.error("Socket error:", err.message);
});