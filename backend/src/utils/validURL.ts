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
    // todo add regex for YouTube shorts too
    const youtubeUrlPattern =
      /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=[\w-]+(&\S*)?$/;
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

export const downloadFile = async (fileTypeToDownload: string, url: string, title: string) => {
  if (fileTypeToDownload === "audio-m4a") {
    ytdl(url, { filter: "audioonly" })
      .pipe(fs.createWriteStream(`./${title}.m4a`))
      .on("finish", () => console.log("Finished downloaded"))
      .on("error", (err) => {
        console.error(err);
      });
  }

  if (fileTypeToDownload === "360p") {
    ytdl.getInfo(url).then((info) => {
      const choosenFormat = info.formats.find((format) => format.itag === 137);
      console.log(choosenFormat);
      const videoStream = ytdl(url, {
        format: choosenFormat,
      });
      videoStream.pipe(fs.createWriteStream("./360p-video.mp4"));
    });
  }

  if (fileTypeToDownload === "720p") {
    console.log("720p clicked!");
    saveVideoInDirectory(url, title, 136);
  }

  if (fileTypeToDownload === "1080p") {
    // await saveVideoInDirectory(url, title, 137);
    // await saveAudioInDirectory(url, title);
    await combineAudioVideo(title);
  }
};

export const saveVideoInDirectory = async (url: string, title: string, itag: number) => {
  ytdl
    .getInfo(url)
    .then((info) => {
      const choosenFormat = info.formats.find((format) => format.itag === itag);
      const videoStream = ytdl(url, { format: choosenFormat });
      videoStream
        .pipe(fs.createWriteStream(`./downloads/${title}-video.mp4`))
        .on("error", (err) => console.error(err));
    })
    .catch((err) => console.error(err));
};

export const saveAudioInDirectory = async (url: string, title: string) => {
  ytdl(url, { filter: "audioonly" })
    .pipe(fs.createWriteStream(`./downloads/${title}.m4a`))
    .on("error", (err) => console.error(err));
};

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
  ytdl
    .getInfo(
      "https://www.youtube.com/watch?v=0mCVpUDCkEk&pp=ygUPd2Ugc3RpbGwgcm9sbGlu"
    )
    .then((info) => {
      const qualityOptions = ["135"];
      const format = ytdl.chooseFormat(info.formats, { quality: "highest" });
    });
};

// fetchVideos();

// const url = "https://www.youtube.com/watch?v=0mCVpUDCkEk&pp=ygUPd2Ugc3RpbGwgcm9sbGlu";
// ytdl(url).pipe(fs.createWriteStream("video.mp4"));
// Do not need create child process if using fluent-ffmpeg
export const combineAudioVideo = async (title: string) => {
  const audioFile = `./downloads/${title}.m4a`;
  const videoFile = `./downloads/${title}-video.mp4`;
  const outputVideoFile = `./downloads/${title}-combined.mp4`;

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

// combineVideos();
console.log("Non-blocking code should run here....");
