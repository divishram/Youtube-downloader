import http from "http";
import express from "express";
import dotenv from "dotenv";
import { logger } from "./logger";
import cors from "cors";
import { Server } from "socket.io";
import path, { dirname } from "path";
import bodyParser from "body-parser";
import sanitizeHtml from "sanitize-html";
import { validateYouTubeURL, getVideoInfo, downloadFile } from "./utils/validURL";
// todo add async to functions
import { spawn, fork, execFile as execFileCallback, execFile } from "node:child_process";
import {promisify} from "node:util";

dotenv.config();
const PORT = process.env.PORT ?? 4000;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {cors: {origin: "http://localhost:3000"}});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

const corsOptions = {
  origin: "http://localhost:3000",
  methods: ["GET", "POST"]
}

app.use(cors(corsOptions));
app.use(express.json());

app.set("view engine", "pug");
app.set("public", path.join(__dirname, "../public"));
app.use(express.static(path.join(__dirname, "../public")));

// app.get("/", (req, res) => {
//   logger.info("Info about server.");
//   res.render("index");
// });


io.on("connection", (socket) => {

  console.log("a user connected");
  socket.on("disconnect", () => console.log("A user disconnected"));

  socket.on("download", async (data) => {
    let sanitizedUrl = sanitizeHtml(data.url);
    // string should be "youtube.com/watch?v=" or youtube.com/shorts/SHORT_ID for regex test
    let isValidYouTubeURL = validateYouTubeURL(sanitizedUrl);
    
    if (isValidYouTubeURL) {
      let videoDetails =  await getVideoInfo(sanitizedUrl);
      socket.emit("video-info", videoDetails);
    }
  })

  socket.on("downloadFile", async (data) => {
    // sanitize inputs
    let cleanURL = sanitizeHtml(data.url);
    let cleanTitle = sanitizeHtml(data.title);
    let cleanFileTypeToDownload = sanitizeHtml(data.fileTypeToDownload);
    await downloadFile(cleanFileTypeToDownload, cleanURL, cleanTitle);
  })
});


server.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));
