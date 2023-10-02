import ytdl from "ytdl-core";
import fs from "node:fs"; // more correct way

//http for downloading

/**
 * Validates a URL to check if it has the "https" protocol, a non-empty host, and a non-empty pathname.
 * @param {string} url - The URL to validate.
 * @returns {boolean} - True if the URL is valid; otherwise, false.
 */
function validateURL(url: string): boolean {
    try {
      const testURL = new URL(url);
  
      // Check the protocol, host, and pathname
      const isValid =
        testURL.protocol === "https:" &&
        testURL.host !== "" &&
        testURL.pathname !== "";
  
      return isValid;
    } catch (error) {
      console.error("Error while validating URL:", error);
      return false; // URL is not parseable
    }
  }

/**
 * Validates a URL to check if it is a valid YouTube video URL.
 * @param {string} url - The URL to validate.
 * @returns {boolean} - True if the URL is a valid YouTube video URL; otherwise, false.
 */
export const validateYouTubeURL = (url: string): boolean => {
    try {
      // todo add regex for YouTube shorts too
      const youtubeUrlPattern = /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=[\w-]+(&\S*)?$/;
      const isValid = youtubeUrlPattern.test(url);
  
      return isValid;
    } catch (error) {
      console.error("Error while validating YouTube URL:", error);
      return false; // URL is not parseable
    }
}

interface VideoInfo {
  title: string;
  duration: string;
  videoId: string;
  formats: Format[];
}

interface Format {
  mimeType: string | undefined;
  quality: string;
  size : number;
}

export const getVideoInfo = async (url: string): Promise<VideoInfo> => {
  const info = await ytdl.getInfo(url)
  const result: VideoInfo = {
    // Lots of empty spaces in YT videos, replace with dash
    title: info.videoDetails.title,  
    duration: info.videoDetails.lengthSeconds, 
    videoId: info.videoDetails.videoId,
    formats: info.formats.map((element) => ({
      mimeType: element.mimeType,
      quality:element.qualityLabel,
      size: parseInt(element.contentLength)
    }))

  } 
  return result;
}

// export const downloadAsAudio = async (url:string, title:string) => {
//   // let video = ytdl(url, {filter: "audioonly"});
//   ytdl(url, {filter: "audioonly"})
//     .pipe(fs.createWriteStream(`./${title}.m4a`))
//     .on("finish", () => console.log("Finished downloaded"))
//     .on("error", (err) => {
//       console.error(err);
//     })
// }

export const downloadFile = async (fileTypeToDownload:string, url:string, title:string) => {

  if (fileTypeToDownload === "audio-m4a") {
    ytdl(url, {filter: "audioonly"})
      .pipe(fs.createWriteStream(`./${title}.m4a`))
      .on("finish", () => console.log("Finished downloaded"))
      .on("error", (err) => {
        console.error(err);
      })
  }

  if (fileTypeToDownload === "360p") {
    ytdl.getInfo(url)
      .then((info) => {
        // const format = ytdl.chooseFormat(info.formats, {quality: "18"})
        const choosenFormat = info.formats.find(format => format.itag === 18);
        console.log(choosenFormat);
        const videoStream = ytdl(url, {
          format: choosenFormat
        });
        videoStream.pipe(fs.createWriteStream("./360p-video.mp4"));
      })
  }




}

getVideoInfo("https://www.youtube.com/watch?v=0mCVpUDCkEk&pp=ygUPd2Ugc3RpbGwgcm9sbGlu")
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
ytdl.getInfo("https://www.youtube.com/watch?v=0mCVpUDCkEk&pp=ygUPd2Ugc3RpbGwgcm9sbGlu")
    .then((info) => {
      const qualityOptions = ["135"];
      const format = ytdl.chooseFormat(info.formats,  {quality: "highest"});
    })
}

fetchVideos();

// const url = "https://www.youtube.com/watch?v=0mCVpUDCkEk&pp=ygUPd2Ugc3RpbGwgcm9sbGlu";
// ytdl(url).pipe(fs.createWriteStream("video.mp4"));