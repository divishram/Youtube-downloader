"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveVideoInDirectory = exports.saveAudioInDirectory = exports.combineAudioVideo = exports.downloadFile = exports.getVideoInfo = exports.validateYouTubeURL = void 0;
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
/**
 * Retrieves information about a YouTube video based on its URL.
 * @param {string} url - The URL of the YouTube video.
 * @returns {Promise<VideoInfo>} - A Promise that resolves to an object containing video information.
 */
const getVideoInfo = async (url) => {
    const info = await ytdl_core_1.default.getInfo(url);
    const result = {
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
/**
 * Downloads and processes media files based the button clicked in React.js
 *
 * @param fileTypeToDownload - The type of media to download (e.g., "audio-m4a", "360p", "720p", "1080p").
 * @param url - The URL of the media resource to download.
 * @param title - The title used for saving the downloaded media.
 * @throws {Error} If an unsupported file type is provided or an error occurs during the download or processing.
 */
const downloadFile = async (fileTypeToDownload, url, title) => {
    try {
        // Only download audio
        if (fileTypeToDownload === "audio-m4a") {
            await (0, exports.saveAudioInDirectory)(url, title);
        }
        // 360p videos have audio and video combined, so only need to download video
        else if (fileTypeToDownload === "360p") {
            await (0, exports.saveVideoInDirectory)(url, title, 18);
        }
        // Higher resolutions need to download audio/video and merge them
        else if (fileTypeToDownload === "720p") {
            await (0, exports.saveVideoInDirectory)(url, title, 136); // 136 is itag for 720p in ytdl
            await (0, exports.saveAudioInDirectory)(url, title);
            await (0, exports.combineAudioVideo)(title);
        }
        else if (fileTypeToDownload === "1080p") {
            await (0, exports.saveVideoInDirectory)(url, title, 137); // 137 is itag for 1080p for ytdl
            await (0, exports.saveAudioInDirectory)(url, title);
            await (0, exports.combineAudioVideo)(title);
        }
        else {
            throw new Error("Unsupported file type to download");
        }
    }
    catch (error) {
        console.error(error);
        throw error;
    }
};
exports.downloadFile = downloadFile;
// Do not need create child process if using fluent-ffmpeg
/**
 * Combines audio and video files into a single video file.
 *
 * @param title - The title used for identifying and naming the combined video file.
 * @returns {Promise<void>} A Promise that resolves when the audio and video have been successfully combined.
 * @throws {Error} If an error occurs during the combination process.
 */
const combineAudioVideo = async (title) => {
    return new Promise((resolve, reject) => {
        const filePath = `./downloads/output/${title}.mp4`;
        if (node_fs_1.default.existsSync(filePath)) {
            console.log(`File already exists. (Skipping audio/video merging)`);
            resolve();
            return;
        }
        const audioFile = `./downloads/input_audio/${title}.m4a`;
        const videoFile = `./downloads/input_video/${title}.mp4`;
        const outputVideoFile = `./downloads/output/${title}.mp4`;
        const command = (0, fluent_ffmpeg_1.default)();
        command.input(videoFile);
        command.input(audioFile);
        command
            .output(outputVideoFile)
            .on("end", () => {
            console.log("Audio and video have been combined");
            resolve();
        })
            .on("error", (err) => {
            console.error(`Error combining audio/video: ${err}`);
            reject(err);
        });
        command.run();
    });
};
exports.combineAudioVideo = combineAudioVideo;
// combineVideos();
console.log("Non-blocking code should run here....");
/**
 * Downloads audio from a given URL and saves it to a specified directory.
 *
 * @param url - The URL of the media resource to download.
 * @param title - The title used for identifying and naming the downloaded audio file.
 * @returns {Promise<void>} A Promise that resolves when the audio has been successfully downloaded and saved.
 * @throws {Error} If an error occurs during the download or saving process.
 */
const saveAudioInDirectory = async (url, title) => {
    return new Promise(async (resolve, reject) => {
        try {
            const filePath = `./downloads/input_audio/${title}.m4a`;
            if (node_fs_1.default.existsSync(filePath)) {
                console.log(`File already exists skipping audio download`);
                resolve();
                return;
            }
            (0, ytdl_core_1.default)(url, { filter: "audioonly" })
                .pipe(node_fs_1.default.createWriteStream(filePath))
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
/**
 * Downloads a video from a given URL and saves it to a specified directory.
 *
 * @param url - The URL of the video resource to download.
 * @param title - The title used for identifying and naming the downloaded video file.
 * @param itag - The specific ITAG value representing the desired video format. (See the ytdl docs for list of itags)
 * @returns {Promise<void>} A Promise that resolves when the video has been successfully downloaded and saved.
 * @throws {Error} If an error occurs during the download or saving process.
 */
const saveVideoInDirectory = async (url, title, itag) => {
    return new Promise(async (resolve, reject) => {
        try {
            const filePath = `./downloads/input_video/${title}.mp4`;
            if (node_fs_1.default.existsSync(filePath)) {
                console.log(`File already exists, skipping video download`);
                resolve();
                return;
            }
            const info = await ytdl_core_1.default.getInfo(url);
            const choosenFormat = info.formats.find((format) => format.itag === itag);
            const videoStream = (0, ytdl_core_1.default)(url, { format: choosenFormat });
            const writeStream = node_fs_1.default.createWriteStream(filePath);
            videoStream
                .pipe(writeStream)
                .on("error", (err) => {
                console.error(err);
                reject(err); // Reject the promise on error
            })
                .on("finish", () => {
                console.log("Download finished!");
                /*
                Sometimes FFMPEG would throw error and says file does not exist after download
                So adding settimeout for 2secs ensures it finished loading and it can be combined
                with the audio file
                */
                setTimeout(() => {
                    resolve(); // Resolve promise when download is finished
                }, 2000);
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