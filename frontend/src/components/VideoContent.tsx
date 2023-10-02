import React, { useEffect } from "react";
import { socket } from "../socket";
import formatTime from "../utils/ConvertTime"

interface VideoContentProps {
  data: {
    img: string;
    title: string;
    duration: string;
  };
}

export default function VideoContent(props: VideoContentProps) {
  useEffect(() => {
    socket.emit("test", "world");
  });

  return (
    <div>
      {props.data.img && (
        <div className="flex-container-video">
          <div className="row">
            <img
              src={`https://img.youtube.com/vi/${props.data.img}/sddefault.jpg`}
              height={150}
              alt="Thumbnail for YouTube Video"
            />
          </div>
          <div className="row">{props.data.title}</div>
          {/* <div className="row"></div> */}
        </div>
      )}
    </div>
  );
}
