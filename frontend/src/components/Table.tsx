import React from "react";
import { socket } from "../socket";
import formatTime from "../utils/ConvertTime";
import DownloadBtn from "./DownloadBtn.svg";

interface VideoContentProps {
  data: {
    img: string;
    title: string;
    duration: string;
    url: string;
  };
}
// todo data should be sent from server here, then object or array should be iterated to populate table
export default function Table(props: VideoContentProps) {
  const download = (e: any) => {
    console.log("downloading!");
    let fileTypeToDownload = e.target.parentElement.className;
    console.log(fileTypeToDownload);
    if (props.data.url && props.data.title) {
      let title = props.data.title;
      let url = props.data.url;
      socket.emit("downloadFile", { url, title, fileTypeToDownload });
    }
  };

  return (
    <div className="table-responsive">
      {props.data.duration && (
        <table>
          <thead>
            <tr>
              <th>Format</th>
              <th>Quality</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>.m4a</td>
              <td>Audio</td>
              {/* File format is in td because some issues occured when placed inside SVG file
                  using data-* attribute. Maybe change to img or CSS?
              */}
              <td className="audio-m4a">
                <img
                  className="download-btn"
                  src={DownloadBtn}
                  alt="Download Button"
                  onClick={download}
                />
              </td>
            </tr>

            <tr>
              <td>.mp4</td>
              <td>360p</td>
              <td className="360p">
                <img className="download-btn" src={DownloadBtn} alt="Download Button" onClick={download} />
              </td>
            </tr>

            <tr>
              <td>.mp4</td>
              <td>720p</td>
              <td className="720p">
                <img className="download-btn" src={DownloadBtn} alt="Download Button" onClick={download} />
              </td>
            </tr>

            <tr>
              <td>.mp4</td>
              <td>1080p</td>
              <td className="1080p">
                <img className="download-btn" src={DownloadBtn} alt="Download Button" onClick={download} />
              </td>
            </tr>


          </tbody>
        </table>
      )}
    </div>
  );
}
