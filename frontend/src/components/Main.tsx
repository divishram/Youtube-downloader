import React, { useEffect, useState } from "react";
import { socket } from "../socket";
import { io } from "socket.io-client";
import VideoContent from "./VideoContent";
import Table from "./Table";
// todo add debounce function to prevent too many re-renders

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

export default function MainPart() {
  const [url, setUrl] = useState<string>("");
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
    };
  }, [url]);

  useEffect(() => {
    socket.on("video-info", (data) => {
      console.log(data);
      setVideoInfo(data);
    });
    return () => {
      socket.off("video-info");
    };
  });
  console.log(videoInfo);

  const dataToPass = {
    img: videoInfo?.videoId ?? "",
    title: videoInfo?.title ?? "",
    duration: videoInfo?.duration ?? "",
    url : url ?? ""
  }
  return (
    <div>
      <main className="container">
        <div className="description">
          <h3>Download into Video or MP3 format</h3>
        </div>

        <input
          type="url"
          className="url"
          autoFocus
          placeholder="Enter YouTube URL"
          value={url}
          onClick={() => setUrl("")}
          onChange={(e) => {
            setUrl(e.target.value);
            console.log(e.target.value);
          }}
        />
      </main>

      <VideoContent data={dataToPass}></VideoContent>
      <Table data={dataToPass}></Table>
    </div>
  );
}
