import http from "http";
import express from "express";
import dotenv from "dotenv";
import { logger } from "./logger";
import cors from "cors";
import { Server } from "socket.io";
import path from "path";
import bodyParser from "body-parser";
import sanitizeHtml from "sanitize-html";
import { validateYouTubeURL, getVideoInfo, downloadAsAudio } from "./utils/validURL";
import ytdl from "ytdl-core";
// todo add async to functions

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

  console.log("a user connected changed");
  socket.on("disconnect", () => console.log("A user disconnected"));

  socket.on("download", async (data) => {
    let sanitizedUrl = sanitizeHtml(data.url);
    // string should be "youtube.com/watch?v=" regex. youtube.com should be false bc homepage not video
    let isValidYouTubeURL = validateYouTubeURL(sanitizedUrl);
    
    if (isValidYouTubeURL) {
      let videoDetails =  await getVideoInfo(sanitizedUrl);
      socket.emit("video-info", videoDetails);
     
    }
  })

  socket.on("test", (info) => {
    console.log(`Received ${info}`);
  })

  socket.on("downloadAudio", async (data) => {
    console.log(data.title);
    let cleanURL = sanitizeHtml(data.url);
    console.log(cleanURL);
    await downloadAsAudio(cleanURL, data.title);
  })



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
