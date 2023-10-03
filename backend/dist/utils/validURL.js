"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.combineAudioVideo = exports.saveAudioInDirectory = exports.saveVideoInDirectory = exports.downloadFile = exports.getVideoInfo = exports.validateYouTubeURL = void 0;
const ytdl_core_1 = __importDefault(require("ytdl-core"));
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const node_fs_1 = __importDefault(require("node:fs"));
/**
 * Validates a URL to check if it is a valid YouTube video URL.
 * @param {string} url - The URL to validate.
 * @returns {boolean} - True if the URL is a valid YouTube video URL; otherwise, false.
 */
const validateYouTubeURL = (url) => {
    try {
        // todo add regex for YouTube shorts too
        const youtubeUrlPattern = /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=[\w-]+(&\S*)?$/;
        const isValid = youtubeUrlPattern.test(url);
        return isValid;
    }
    catch (error) {
        console.error("Error while validating YouTube URL:", error);
        return false; // URL is not parseable
    }
};
exports.validateYouTubeURL = validateYouTubeURL;
const getVideoInfo = async (url) => {
    const info = await ytdl_core_1.default.getInfo(url);
    const result = {
        // Lots of empty spaces in YT videos, replace with dash
        title: info.videoDetails.title,
        duration: info.videoDetails.lengthSeconds,
        videoId: info.videoDetails.videoId,
        formats: info.formats.map((element) => ({
            mimeType: element.mimeType,
            quality: element.qualityLabel,
            size: parseInt(element.contentLength),
        })),
    };
    return result;
};
exports.getVideoInfo = getVideoInfo;
const downloadFile = async (fileTypeToDownload, url, title) => {
    if (fileTypeToDownload === "audio-m4a") {
        (0, ytdl_core_1.default)(url, { filter: "audioonly" })
            .pipe(node_fs_1.default.createWriteStream(`./${title}.m4a`))
            .on("finish", () => console.log("Finished downloaded"))
            .on("error", (err) => {
            console.error(err);
        });
    }
    if (fileTypeToDownload === "360p") {
        ytdl_core_1.default.getInfo(url).then((info) => {
            // const format = ytdl.chooseFormat(info.formats, {quality: "18"})
            // todo itag 137 is h.264 codec, 248 is vp9 codec
            // https://imagekit.io/blog/vp9-vs-h264/   (site says vp9 better vodec)
            // maybe use ffmpeg setttings to convert to vp9 codec
            // use h.264 codec because more widespread support
            // research and compare to av1
            const choosenFormat = info.formats.find((format) => format.itag === 137);
            console.log(choosenFormat);
            const videoStream = (0, ytdl_core_1.default)(url, {
                format: choosenFormat,
            });
            videoStream.pipe(node_fs_1.default.createWriteStream("./360p-video.mp4"));
        });
    }
    if (fileTypeToDownload === "720p") {
        console.log("720p clicked!");
        (0, exports.saveVideoInDirectory)(url, title, 136);
    }
    if (fileTypeToDownload === "1080p") {
        // await saveVideoInDirectory(url, title, 137);
        // await saveAudioInDirectory(url, title);
        await (0, exports.combineAudioVideo)(title);
    }
};
exports.downloadFile = downloadFile;
const saveVideoInDirectory = async (url, title, itag) => {
    ytdl_core_1.default
        .getInfo(url)
        .then((info) => {
        const choosenFormat = info.formats.find((format) => format.itag === itag);
        const videoStream = (0, ytdl_core_1.default)(url, { format: choosenFormat });
        videoStream
            .pipe(node_fs_1.default.createWriteStream(`./downloads/${title}-video.mp4`))
            .on("error", (err) => console.error(err));
    })
        .catch((err) => console.error(err));
};
exports.saveVideoInDirectory = saveVideoInDirectory;
const saveAudioInDirectory = async (url, title) => {
    (0, ytdl_core_1.default)(url, { filter: "audioonly" })
        .pipe(node_fs_1.default.createWriteStream(`./downloads/${title}.m4a`))
        .on("error", (err) => console.error(err));
};
exports.saveAudioInDirectory = saveAudioInDirectory;
// getVideoInfo("https://www.youtube.com/watch?v=0mCVpUDCkEk&pp=ygUPd2Ugc3RpbGwgcm9sbGlu")
//   .then((videoInfo) => {
//     console.log(videoInfo);
//   })
//   .catch((error) => {
//     console.error("Error:", error);
//   });
// async function download (url: string): Promise{
//   const info = await ytdl.getInfo(url)
//   console.log(info);
// }
const fetchVideos = async () => {
    // const info = await ytdl.getInfo("https://www.youtube.com/watch?v=z5uEMhZJCqo&list=RDz5uEMhZJCqo&start_radio=1")
    // const videoFormats = ytdl.filterFormats(info.formats, "videoonly");
    // console.log(videoFormats);
    ytdl_core_1.default
        .getInfo("https://www.youtube.com/watch?v=0mCVpUDCkEk&pp=ygUPd2Ugc3RpbGwgcm9sbGlu")
        .then((info) => {
        const qualityOptions = ["135"];
        const format = ytdl_core_1.default.chooseFormat(info.formats, { quality: "highest" });
    });
};
// fetchVideos();
// const url = "https://www.youtube.com/watch?v=0mCVpUDCkEk&pp=ygUPd2Ugc3RpbGwgcm9sbGlu";
// ytdl(url).pipe(fs.createWriteStream("video.mp4"));
// Do not need create child process if using fluent-ffmpeg
const combineAudioVideo = async (title) => {
    const audioFile = `./downloads/${title}.m4a`;
    const videoFile = `./downloads/${title}-video.mp4`;
    const outputVideoFile = `./downloads/${title}-combined.mp4`;
    const command = (0, fluent_ffmpeg_1.default)();
    command.input(videoFile);
    command.input(audioFile);
    command
        .output(outputVideoFile)
        .on("end", () => console.log("Audio and video have been combined"))
        .on("error", (err) => console.error(`Erroring combining audio/video: ${err}`));
    command.run();
};
exports.combineAudioVideo = combineAudioVideo;
// combineVideos();
console.log("Non-blocking code should run here....");
//# sourceMappingURL=validURL.js.map