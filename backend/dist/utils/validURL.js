"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVideoInfo = exports.validateYouTubeURL = void 0;
const ytdl_core_1 = __importDefault(require("ytdl-core"));
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
(0, exports.getVideoInfo)("https://www.youtube.com/watch?v=z5uEMhZJCqo&list=RDz5uEMhZJCqo&start_radio=1")
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
/*
step 1. get options
2 send that back to the user
form and show radio buttons
*/ 
//# sourceMappingURL=validURL.js.map