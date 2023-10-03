"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const socket_io_1 = require("socket.io");
const path_1 = __importDefault(require("path"));
const body_parser_1 = __importDefault(require("body-parser"));
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const validURL_1 = require("./utils/validURL");
dotenv_1.default.config();
const PORT = process.env.PORT ?? 4000;
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, { cors: { origin: "http://localhost:3000" } });
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: false }));
const corsOptions = {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.set("view engine", "pug");
app.set("public", path_1.default.join(__dirname, "../public"));
app.use(express_1.default.static(path_1.default.join(__dirname, "../public")));
// app.get("/", (req, res) => {
//   logger.info("Info about server.");
//   res.render("index");
// });
// const ls = spawn("ls", ["-lh"]);
// ls.stdout.on("data", (data) => {
//   console.log(`stdout: ${data}`)
// })
// ls.stderr.on("data", (data) => {
//   console.error(`stderr: ${data}`);
// })
// ls.on("close", (code) => {
//   console.log(`Child process exited with code ${code}` );
// })
// const child = fork(`${__dirname}/child.js`);
// child.on("message", (msg: any) => {
//   console.log(`Message from child: ${msg.counter}`);
// });
// child.send({hello: "world"});
// const childProcess = fork(`${__dirname}/cpuBound.js`);
// childProcess.on("message", (msg) => {
//   console.log(`Calculated value: ${msg}`);
// })
// const jsKeywords = ["let", "const", "for"];
// console.log("The following are JavaScript Reserved keywords: ");
// for (const keyword of jsKeywords) {
//   console.log(keyword);
// }
io.on("connection", (socket) => {
    console.log("a user connected changed");
    socket.on("disconnect", () => console.log("A user disconnected"));
    socket.on("download", async (data) => {
        let sanitizedUrl = (0, sanitize_html_1.default)(data.url);
        // string should be "youtube.com/watch?v=" regex. youtube.com should be false bc homepage not video
        let isValidYouTubeURL = (0, validURL_1.validateYouTubeURL)(sanitizedUrl);
        if (isValidYouTubeURL) {
            let videoDetails = await (0, validURL_1.getVideoInfo)(sanitizedUrl);
            socket.emit("video-info", videoDetails);
        }
    });
    socket.on("downloadFile", async (data) => {
        // sanitize inputs
        let cleanURL = (0, sanitize_html_1.default)(data.url);
        let cleanTitle = (0, sanitize_html_1.default)(data.title);
        let cleanFileTypeToDownload = (0, sanitize_html_1.default)(data.fileTypeToDownload);
        await (0, validURL_1.downloadFile)(cleanFileTypeToDownload, cleanURL, cleanTitle);
    });
});
server.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));
/*
ASYNC EXAMLPE
app.get('/crypto', async (req, res) => {
  try {
    const response = await axios.get(
      'https://api2.binance.com/api/v3/ticker/24hr'
    );

    const tickerPrice = response.data;

    res.json(tickerPrice);
  } catch (err) {
    logger.error(err);
    res.status(500).send('Internal server error');
  }
});

app.listen('4000', () => {
  console.log('Server is running on port 4000');
});
*/
//# sourceMappingURL=index.js.map