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
io.on("connection", (socket) => {
    console.log("a user connected");
    socket.on("disconnect", () => console.log("A user disconnected"));
    socket.on("download", async (data) => {
        let sanitizedUrl = (0, sanitize_html_1.default)(data.url);
        // string should be "youtube.com/watch?v=" or youtube.com/shorts/SHORT_ID for regex test
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
//# sourceMappingURL=index.js.map