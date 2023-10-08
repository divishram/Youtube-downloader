
# YouTube Downloader

An example of a YT Downloader site built with Node.js, Express, React.js Socket.io. This site focuses on a mobile-first design approach.


## Demo
![](demo.gif)

## How It Works

The YTDL library can download audio files in m4a format, videos (without audio) or videos with audio. Downloading videos in 360p format will have audio and video merged, but if the user wants to download formats in higher resolutions, audio and video must be downloaded separately and combined.

&nbsp; 1. Use YTDL to download the audio and video separately.  

&nbsp;  2. Use fluent-ffmpeg to combine the files and create 1 file. You do not   need to create a child process using this library.

## Run Locally

Clone the project

```bash
  git clone https://github.com/divishram/Youtube-downloader.git
```

Go into directory, install dependencies in Node.js and Start Server

```bash
  cd Youtube-downloader/backend && npm install && npm run start
```

Open a new terminal, install dependencies in React.js and start server

```bash
  cd ../frontend && npm install && npm run build && npm start
```

## Roadmap

- Debounce function to improve performance
- Unit Testing
- Add CSS media queries for tablet and desktop view
- 4K videos
- Download an entire playlist
- Rename video before downloading (So many music videos have extra space, credits etc.)

## Authors

- [Divish Ram](https://stackoverflow.com/users/13335147/dram95)


## License

[MIT](https://choosealicense.com/licenses/mit/)

## Acknowledgements

 - [YouTube Video (Copyright free)](https://www.youtube.com/watch?v=W6Wzk7VuC00)
 - [How to write a Good readme](https://bulldogjob.com/news/449-how-to-write-a-good-readme-for-your-github-project)
