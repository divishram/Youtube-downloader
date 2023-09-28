import React, { useEffect, useRef, useState } from "react";
import { socket } from "../socket";
import { io } from "socket.io-client";
// todo add debounce function to prevent too many re-renders

// type VideoInfo = {title: string, duration: string, videoId: string}

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

export default function MainPart() {
  // const inputRef = useRef();
  const [url, setUrl] = useState<string>("");
  // const urlRef = useRef<string>("");
  const [videoInfo, setVideoInfo] = useState<VideoInfo>();

  useEffect(() => {
    const socket = io("http://localhost:4000");
    socket.on("connect", () => {
      console.log("connected! from react");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (url) {
      socket.emit("download", { url });
    }
    return () => {
      socket.off("download");
    }
  }, [url]);

  // todo combine in 1st one
  useEffect(() => {
    socket.on("video-info", (data) => {
      console.log(data);
      setVideoInfo(data);
    })
    return () => {
      socket.off("video-info");
    }
  })
  console.log(videoInfo);
  // todo onclick clear input e => e.target.value = "";
  return (
    <main className="container">
      <div className="description">
        <h3>Download into Video or MP3 format</h3>
      </div>

      <form>
        <input
          // todo add focus
          type="url"
          className="url"
          placeholder="Enter YouTube URL"
          value={url}
          onClick={() => setUrl("")}
          onChange={(e) => {
            setUrl(e.target.value);
            console.log(e.target.value);
          }}
        />

      </form>

      {videoInfo && <VideoFormats formats={videoInfo.formats} />}


      <p>{videoInfo?.title}</p>
      <p>{videoInfo?.duration} seconds</p>
      <img src={`https://img.youtube.com/vi/${videoInfo?.videoId}/sddefault.jpg`} height={150} alt="" />
    </main>
  );
}



function VideoFormats(props: {formats: Format[]}) {
  return (
  <ul>

    {
      props.formats.map((format) => 
      <>
        <li>{format.mimeType}</li>
        <li>{format.quality}</li>
        <li>{format.size} Bytes</li>
      </>
      )
    }
  </ul>
  )
}

// todo share interface for both backend and frontend

/*

Steps: 
1. User enters URL, onchange event 
2. Socket sends info to server
3. Socket on server get info
4. Uses API to download mp3/mp4 etc.
5. Send data back to front end
6. Show loading on frontend
7. Show options form to select video quality/audio format
*/
