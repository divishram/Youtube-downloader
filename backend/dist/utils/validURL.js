"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveVideoInDirectory = exports.saveAudioInDirectory = exports.combineAudioVideo = exports.saveAudioInDirectory_OLD = exports.saveVideoInDirectoryOLD_ = exports.downloadFile = exports.getVideoInfo = exports.validateYouTubeURL = void 0;
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
        const youtubeUrlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)[\w-]+(&\S*)*$/;
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
        await (0, exports.saveAudioInDirectory)(url, title);
    }
    // 360p videos have audio and video combined, so only need to download video
    if (fileTypeToDownload === "360p") {
        await (0, exports.saveVideoInDirectory)(url, title, 137);
    }
    // Higher resolutions need to download audio/video and merge them
    if (fileTypeToDownload === "720p") {
        await (0, exports.saveVideoInDirectory)(url, title, 136);
        await (0, exports.saveAudioInDirectory)(url, title);
        await (0, exports.combineAudioVideo)(title);
    }
    if (fileTypeToDownload === "1080p") {
        await (0, exports.saveVideoInDirectory)(url, title, 137);
        await (0, exports.saveAudioInDirectory)(url, title);
        await (0, exports.combineAudioVideo)(title);
    }
};
exports.downloadFile = downloadFile;
const saveVideoInDirectoryOLD_ = async (url, title, itag) => {
    ytdl_core_1.default
        .getInfo(url)
        .then((info) => {
        const choosenFormat = info.formats.find((format) => format.itag === itag);
        const videoStream = (0, ytdl_core_1.default)(url, { format: choosenFormat });
        videoStream
            .pipe(node_fs_1.default.createWriteStream(`./downloads/${title}-video.mp4`))
            .on("error", (err) => console.error(err))
            .on("finish", () => console.log("finished!"));
    })
        .finally(() => console.log("finished"))
        .catch((err) => console.error(err));
};
exports.saveVideoInDirectoryOLD_ = saveVideoInDirectoryOLD_;
const saveAudioInDirectory_OLD = async (url, title) => {
    (0, ytdl_core_1.default)(url, { filter: "audioonly" })
        .pipe(node_fs_1.default.createWriteStream(`./downloads/${title}.m4a`))
        .on("error", (err) => console.error(err));
};
exports.saveAudioInDirectory_OLD = saveAudioInDirectory_OLD;
// Do not need create child process if using fluent-ffmpeg
const combineAudioVideo = async (title) => {
    const audioFile = `./downloads/input_audio/${title}.m4a`;
    const videoFile = `./downloads/input_video/${title}.mp4`;
    const outputVideoFile = `./downloads/output/${title}.mp4`;
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
// combineAudioVideo("video");
// combineVideos();
console.log("Non-blocking code should run here....");
const saveAudioInDirectory = async (url, title) => {
    return new Promise(async (resolve, reject) => {
        try {
            (0, ytdl_core_1.default)(url, { filter: "audioonly" })
                .pipe(node_fs_1.default.createWriteStream(`./downloads/input_audio/${title}.m4a`))
                .on("error", (err) => console.error(err))
                .on("finish", () => resolve()); // Resolve promise
        }
        catch (err) {
            console.error(err);
            reject(err); // Reject the promise on any error
        }
    });
};
exports.saveAudioInDirectory = saveAudioInDirectory;
const saveVideoInDirectory = async (url, title, itag) => {
    return new Promise(async (resolve, reject) => {
        try {
            const info = await ytdl_core_1.default.getInfo(url);
            const choosenFormat = info.formats.find((format) => format.itag === itag);
            const videoStream = (0, ytdl_core_1.default)(url, { format: choosenFormat });
            const writeStream = node_fs_1.default.createWriteStream(`./downloads/input_video/${title}.mp4`);
            videoStream
                .pipe(writeStream)
                .on("error", (err) => {
                console.error(err);
                reject(err); // Reject the promise on error
            })
                .on("finish", () => {
                console.log("Download finished!");
                setTimeout(() => {
                    resolve();
                }, 2000); // Resolve the promise when download is finished
            });
        }
        catch (err) {
            console.error(err);
            reject(err); // Reject the promise on any error
        }
    });
};
exports.saveVideoInDirectory = saveVideoInDirectory;
//# sourceMappingURL=validURL.js.map