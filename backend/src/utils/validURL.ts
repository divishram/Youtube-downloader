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

export const downloadFile = async (
  fileTypeToDownload: string,
  url: string,
  title: string
) => {
  if (fileTypeToDownload === "audio-m4a") {
    await saveAudioInDirectory(url, title);
  }

  // 360p videos have audio and video combined, so only need to download video
  if (fileTypeToDownload === "360p") {
    await saveVideoInDirectory(url, title, 137);
  }

  // Higher resolutions need to download audio/video and merge them
  if (fileTypeToDownload === "720p") {
    await saveVideoInDirectory(url, title, 136);
    await saveAudioInDirectory(url, title);
    await combineAudioVideo(title);
  }

  if (fileTypeToDownload === "1080p") {
    await saveVideoInDirectory(url, title, 137);
    await saveAudioInDirectory(url, title);
    await combineAudioVideo(title);
  }
};

export const saveVideoInDirectoryOLD_ = async (
  url: string,
  title: string,
  itag: number
) => {
  ytdl
    .getInfo(url)
    .then((info) => {
      const choosenFormat = info.formats.find((format) => format.itag === itag);
      const videoStream = ytdl(url, { format: choosenFormat });
      videoStream
        .pipe(fs.createWriteStream(`./downloads/${title}-video.mp4`))
        .on("error", (err) => console.error(err))
        .on("finish", () => console.log("finished!"));
    })
    .finally(() => console.log("finished"))
    .catch((err) => console.error(err));
};

export const saveAudioInDirectory_OLD = async (url: string, title: string) => {
  ytdl(url, { filter: "audioonly" })
    .pipe(fs.createWriteStream(`./downloads/${title}.m4a`))
    .on("error", (err) => console.error(err));
};

// Do not need create child process if using fluent-ffmpeg
export const combineAudioVideo = async (title: string) => {
  const audioFile = `./downloads/input_audio/${title}.m4a`;
  const videoFile = `./downloads/input_video/${title}.mp4`;
  const outputVideoFile = `./downloads/output/${title}.mp4`;

  const command = ffmpeg();
  command.input(videoFile);
  command.input(audioFile);

  command
    .output(outputVideoFile)
    .on("end", () => console.log("Audio and video have been combined"))
    .on("error", (err) =>
      console.error(`Erroring combining audio/video: ${err}`)
    );
  command.run();
};
// combineAudioVideo("video");
// combineVideos();
console.log("Non-blocking code should run here....");

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
          setTimeout(() => {
            resolve();
          }, 2000); // Resolve the promise when download is finished
        });
    } catch (err) {
      console.error(err);
      reject(err); // Reject the promise on any error
    }
  });
};
