const net = require("net");
const fs = require("fs");
const crypto = require("crypto");
const { ENDOFFILE, HASHSEPARATOR } = require("./constants");

const socket = net.connect(
    8888,
    "192.168.8.105",
    () => {
        console.log("Connected to the server");
    }
);
const filePath = __dirname + "/api_logs.json"

const fileStreamForHashing = fs.createReadStream(filePath);
const fileStremForSending = fs.createReadStream(filePath);

const hash = crypto.createHash("sha256");

fileStreamForHashing.on("data", (chunk) => {
    hash.update(chunk);
});

fileStreamForHashing.on("end", () => {
    const fileHash = hash.digest("hex");

    const uuid = crypto.randomUUID()

    socket.write(uuid + HASHSEPARATOR + fileHash);

    fileStremForSending.on("data", data => {
        socket.write(data)
    })

    fileStremForSending.on("end", _ => {
        socket.end(ENDOFFILE)
        console.log("Transmitter: File transmission completed.");
    })
});

socket.on("error", (err) => {
    console.error("Socket error:", err.message);
});

fileStreamForHashing.on("error", (err) => {
    console.error("File stream error:", err.message);
});

