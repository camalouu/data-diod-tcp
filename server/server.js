const net = require("net");

let transmitter, receiver

const bindStreamEvents = (stream, name) => {
    console.log(`${name} connected`)
    stream.on("end", () => {
        console.log(`${name} ended`);
        transmitter = null
    });

    stream.on("error", err => {
        console.error(`${name} error:`, err.message);
    });

    stream.on("close", () => {
        console.log(`${name} closed`);
    });
}

const tcpServer = net.createServer(connection => {
    if (!receiver) {
        receiver = connection;
        bindStreamEvents(receiver, "receiver")
    }
    else if (!transmitter) {
        transmitter = connection;
        transmitter.on("data", data => {
            receiver.write(data, err => {
                if (err) {
                    console.error("Error writing to receiver:", err.message);
                } else {
                    console.log("Data sent to the receiver");
                }
            });
        });

        bindStreamEvents(transmitter, "Transmitter")

    }
    else {
        console.error("Both sockets are already connected")
        return null
    }
});

tcpServer.listen({
    host: "192.168.8.105",
    port: 8888,
}, () => {
    console.log("TCP server is listening on port 8888");
});

tcpServer.on("error", err => {
    console.error("Server error:", err.message);
});
