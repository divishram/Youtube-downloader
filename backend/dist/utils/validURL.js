"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadFile = exports.getVideoInfo = exports.validateYouTubeURL = void 0;
const ytdl_core_1 = __importDefault(require("ytdl-core"));
const node_fs_1 = __importDefault(require("node:fs")); // more correct way
//http for downloading
/**
 * Validates a URL to check if it has the "https" protocol, a non-empty host, and a non-empty pathname.
 * @param {string} url - The URL to validate.
 * @returns {boolean} - True if the URL is valid; otherwise, false.
 */
function validateURL(url) {
    try {
        const testURL = new URL(url);
        // Check the protocol, host, and pathname
        const isValid = testURL.protocol === "https:" &&
            testURL.host !== "" &&
            testURL.pathname !== "";
        return isValid;
    }
    catch (error) {
        console.error("Error while validating URL:", error);
        return false; // URL is not parseable
    }
}
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
            size: parseInt(element.contentLength)
        }))
    };
    return result;
};
exports.getVideoInfo = getVideoInfo;
// export const downloadAsAudio = async (url:string, title:string) => {
//   // let video = ytdl(url, {filter: "audioonly"});
//   ytdl(url, {filter: "audioonly"})
//     .pipe(fs.createWriteStream(`./${title}.m4a`))
//     .on("finish", () => console.log("Finished downloaded"))
//     .on("error", (err) => {
//       console.error(err);
//     })
// }
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
        ytdl_core_1.default.getInfo(url)
            .then((info) => {
            // const format = ytdl.chooseFormat(info.formats, {quality: "18"})
            const choosenFormat = info.formats.find(format => format.itag === 18);
            console.log(choosenFormat);
            const videoStream = (0, ytdl_core_1.default)(url, {
                format: choosenFormat
            });
            videoStream.pipe(node_fs_1.default.createWriteStream("./360p-video.mp4"));
        });
    }
};
exports.downloadFile = downloadFile;
(0, exports.getVideoInfo)("https://www.youtube.com/watch?v=0mCVpUDCkEk&pp=ygUPd2Ugc3RpbGwgcm9sbGlu")
    .then((videoInfo) => {
    console.log(videoInfo);
})
    .catch((error) => {
    console.error("Error:", error);
});
// async function download (url: string): Promise{
//   const info = await ytdl.getInfo(url)
//   console.log(info);
// }
const fetchVideos = async () => {
    // const info = await ytdl.getInfo("https://www.youtube.com/watch?v=z5uEMhZJCqo&list=RDz5uEMhZJCqo&start_radio=1")
    // const videoFormats = ytdl.filterFormats(info.formats, "videoonly");
    // console.log(videoFormats);
    ytdl_core_1.default.getInfo("https://www.youtube.com/watch?v=0mCVpUDCkEk&pp=ygUPd2Ugc3RpbGwgcm9sbGlu")
        .then((info) => {
        const qualityOptions = ["135"];
        const format = ytdl_core_1.default.chooseFormat(info.formats, { quality: "highest" });
    });
};
fetchVideos();
// const url = "https://www.youtube.com/watch?v=0mCVpUDCkEk&pp=ygUPd2Ugc3RpbGwgcm9sbGlu";
// ytdl(url).pipe(fs.createWriteStream("video.mp4"));
//# sourceMappingURL=validURL.js.map