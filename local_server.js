const http = require("http");
const app = require("./main");

const port = 3000;
app.set("port", port);

const server = http.createServer(app);

server.listen(port, () => {
    console.log(`Server is running locally at http://localhost:${port}`);
});

// Safety Close While Manually Closing
process.on("SIGINT", function () {
    if (server) {
        server.close(() => console.log("Server closed cleanly"));
    }
    process.exit();
});

