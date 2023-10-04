import ytdl from "ytdl-core";
import ffmpeg from "fluent-ffmpeg";
import fs from "node:fs";

/**
 * Validates a URL to check if it is a valid YouTube video URL.
 * @param {string} url - The URL to validate.
 * @returns {boolean} - True if the URL is a valid YouTube video URL; otherwise, false.
 */
export const validateYouTubeURL = (url: string): boolean => {
  try {
    const youtubeUrlPattern =
      /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)[\w-]+(&\S*)*$/;

    const isValid = youtubeUrlPattern.test(url);

    return isValid;
  } catch (error) {
    console.error("Error while validating YouTube URL:", error);
    return false; // URL is not parseable
  }
};

interface VideoInfo {
  title: string;
  duration: string;
  videoId: string;
  formats: Format[];
}

interface Format {
  mimeType: string | undefined;
  quality: string;
  size: number;
}

export const getVideoInfo = async (url: string): Promise<VideoInfo> => {
  const info = await ytdl.getInfo(url);
  const result: VideoInfo = {
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

/**
 * Downloads and processes media files based the button clicked in React.js 
 *
 * @param fileTypeToDownload - The type of media to download (e.g., "audio-m4a", "360p", "720p", "1080p").
 * @param url - The URL of the media resource to download.
 * @param title - The title used for saving the downloaded media.
 * @throws {Error} If an unsupported file type is provided or an error occurs during the download or processing.
 */
export const downloadFile = async (
  fileTypeToDownload: string,
  url: string,
  title: string
) => {
  try {
    // Only download audio
    if (fileTypeToDownload === "audio-m4a") {
      await saveAudioInDirectory(url, title);
    }

    // 360p videos have audio and video combined, so only need to download video
    else if (fileTypeToDownload === "360p") {
      await saveVideoInDirectory(url, title, 137);
    }

    // Higher resolutions need to download audio/video and merge them
    else if (fileTypeToDownload === "720p") {
      await saveVideoInDirectory(url, title, 136); // 136 is itag for 720p in ytdl
      await saveAudioInDirectory(url, title);
      await combineAudioVideo(title);
    } else if (fileTypeToDownload === "1080p") {
      await saveVideoInDirectory(url, title, 137); // 137 is itag for 1080p for ytdl
      await saveAudioInDirectory(url, title);
      await combineAudioVideo(title);
    } else {
      throw new Error("Unsupported file type to download");
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Do not need create child process if using fluent-ffmpeg
/**
 * Combines audio and video files into a single video file.
 *
 * @param title - The title used for identifying and naming the combined video file.
 * @returns {Promise<void>} A Promise that resolves when the audio and video have been successfully combined.
 * @throws {Error} If an error occurs during the combination process.
 */
export const combineAudioVideo = async (title: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const audioFile = `./downloads/input_audio/${title}.m4a`;
    const videoFile = `./downloads/input_video/${title}.mp4`;
    const outputVideoFile = `./downloads/output/${title}.mp4`;

    const command = ffmpeg();
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
export const saveAudioInDirectory = async (
  url: string,
  title: string
): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      ytdl(url, { filter: "audioonly" })
        .pipe(fs.createWriteStream(`./downloads/input_audio/${title}.m4a`))
        .on("error", (err) => console.error(err))
        .on("finish", () => resolve()); // Resolve promise
    } catch (err) {
      console.error(err);
      reject(err); // Reject the promise on any error
    }
  });
};

/**
 * Downloads a video from a given URL and saves it to a specified directory.
 *
 * @param url - The URL of the video resource to download.
 * @param title - The title used for identifying and naming the downloaded video file.
 * @param itag - The specific ITAG value representing the desired video format. (See the ytdl docs for list of itags)
 * @returns {Promise<void>} A Promise that resolves when the video has been successfully downloaded and saved.
 * @throws {Error} If an error occurs during the download or saving process.
 */
export const saveVideoInDirectory = async (
  url: string,
  title: string,
  itag: number
): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      const info = await ytdl.getInfo(url);
      const choosenFormat = info.formats.find((format) => format.itag === itag);
      const videoStream = ytdl(url, { format: choosenFormat });
      const writeStream = fs.createWriteStream(
        `./downloads/input_video/${title}.mp4`
      );

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
    } catch (err) {
      console.error(err);
      reject(err); // Reject the promise on any error
    }
  });
};
