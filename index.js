const express = require("express");
const app = express();
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static").path;
const ytdl = require("ytdl-core");
const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const request = require("request");
ffmpeg.setFfmpegPath(ffmpegPath);

app.use(express.static("public"));

// Set up EJS as the view engine
app.set("view engine", "ejs");
app.use('/images', express.static('views/images'));

//======================================= Header Routes =======================================
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/youtubetomp3", (req, res) => {
  res.render("youtubetomp3");
});

app.get("/linkedindownload", (req, res) => {
  res.render("linkedin");
});

//======================================= Footer Routes =======================================

app.get("/privacy", (req, res) => {
  res.render("privacy");
});
app.get("/termsofservice", (req, res) => {
  res.render("termsofservice");
});

app.get("/dmca", (req, res) => {
  res.render("dmca");
});

app.get("/contact", (req, res) => {
  res.render("contact");
});

//======================================= Robots.txt Route =======================================

app.get("/robots.txt", (req, res) => {
  res.render("robots");
});

//======================================= Sitemap.xml Route =======================================

app.get("/sitemap.xml", (req, res) => {
  res.render("sitemap");
});

//======================================= Youtube Video Download =======================================
app.get("/Videoviews", async (req, res) => {
  try {
    const { videoUrl } = req.query;
    if (!videoUrl) {
      return res.render("/", { videoUrl: null });
    }

    function getVideoIdFromUrl(url) {
      const pattern1 = /(?:\?|&)v=([a-zA-Z0-9_-]+)/; // For "https://www.youtube.com/watch?v=VIDEO_ID"
      const pattern2 = /youtu\.be\/([a-zA-Z0-9_-]+)/; // For "https://youtu.be/VIDEO_ID"
      const pattern3 = /embed\/([a-zA-Z0-9_-]+)/; // For "https://www.youtube.com/embed/VIDEO_ID"
      const pattern4 = /shorts\/([a-zA-Z0-9_-]+)/; // For "https://www.youtube.com/shorts/VIDEO_ID"

      const match1 = url.match(pattern1);
      const match2 = url.match(pattern2);
      const match3 = url.match(pattern3);
      const match4 = url.match(pattern4);

      if (match1) {
        const videoId = match1[1];
        return `https://www.youtube.com/embed/${videoId}`;
      } else if (match2) {
        const videoId = match2[1];
        return `https://www.youtube.com/embed/${videoId}`;
      } else if (match3) {
        const videoId = match3[1];
        return `https://www.youtube.com/embed/${videoId}`;
      } else if (match4) {
        const videoId = match4[1];
        return `https://www.youtube.com/embed/${videoId}`;
      } else {
        const urlParams = new URLSearchParams(new URL(url).search);
        const videoId = urlParams.get("v");
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      }

      return null;
    }
    const embedUrl = getVideoIdFromUrl(videoUrl);

    const response = await axios.get(videoUrl);
    const $ = cheerio.load(response.data);
    const scriptContent = $('script[type="application/ld+json"]').html();

    res.render("videodownloader", { videoUrl: embedUrl, url: videoUrl });
  } catch (error) {
    console.error("Error:", error);
    res.render("/", { videoUrl: null });
  }
});
function sanitize(filename) {
  return filename.replace(/[^a-z0-9]/gi, "_");
}
app.get("/downloadVideo", async (req, res) => {
  try {
    const { videoUrl } = req.query;
    if (!videoUrl) {
      return res.render("/", { videoUrl: null });
    }

    const info = await ytdl.getInfo(videoUrl);

    const format = ytdl.chooseFormat(info.formats, {
      quality: "highest",
      filter: "videoandaudio",
    });

    if (format) {
      const sanitizedFilename = sanitize(info.videoDetails.title);
      res.header(
        "Content-Disposition",
        `attachment; filename="${sanitizedFilename}.mp4"`
      );
      ytdl(videoUrl, { format: format }).pipe(res);
    } else {
      res.render("videodownloader", { videoUrl: null });
    }
  } catch (error) {
    console.error("Error:", error);
    res.render("videodownloader", { videoUrl: null });
  } finally {
  }
});

//======================================= Youtube To Mp3 Download =======================================
app.get("/videotomp3", async (req, res) => {
  try {
    const { videoUrl } = req.query;
    if (!videoUrl) {
      return res.render("youtubetomp3", { videoUrl: null });
    }

    function getVideoIdFromUrl(url) {
      const pattern1 = /(?:\?|&)v=([a-zA-Z0-9_-]+)/; // For "https://www.youtube.com/watch?v=VIDEO_ID"
      const pattern2 = /youtu\.be\/([a-zA-Z0-9_-]+)/; // For "https://youtu.be/VIDEO_ID"
      const pattern3 = /embed\/([a-zA-Z0-9_-]+)/; // For "https://www.youtube.com/embed/VIDEO_ID"
      const pattern4 = /shorts\/([a-zA-Z0-9_-]+)/; // For "https://www.youtube.com/shorts/VIDEO_ID"

      const match1 = url.match(pattern1);
      const match2 = url.match(pattern2);
      const match3 = url.match(pattern3);
      const match4 = url.match(pattern4);

      if (match1) {
        const videoId = match1[1];
        return `https://www.youtube.com/embed/${videoId}`;
      } else if (match2) {
        const videoId = match2[1];
        return `https://www.youtube.com/embed/${videoId}`;
      } else if (match3) {
        const videoId = match3[1];
        return `https://www.youtube.com/embed/${videoId}`;
      } else if (match4) {
        const videoId = match4[1];
        return `https://www.youtube.com/embed/${videoId}`;
      } else {
        const urlParams = new URLSearchParams(new URL(url).search);
        const videoId = urlParams.get("v");
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      }

      return null;
    }

    const embedUrl = getVideoIdFromUrl(videoUrl);

    const response = await axios.get(videoUrl);
    const $ = cheerio.load(response.data);
    const scriptContent = $('script[type="application/ld+json"]').html();

    res.render("downloadmp3", { videoUrl: embedUrl, url: videoUrl });
  } catch (error) {
    console.error("Error:", error);
    res.render("youtubetomp3", { videoUrl: null });
  }
});

app.get("/mp3", async (req, res) => {
  var Url;
  if (req?.query?.url?.includes("=")) {
    Url = req?.query?.url?.split("=")[1];
  } else {
    Url = req?.query?.url;
  }

  const options = {
    method: "get",
    url: "https://youtube-mp36.p.rapidapi.com/dl",
    params: { id: Url },
    headers: {
      "X-RapidAPI-Key": "b4c99f7d15msha19e50d9a13dd92p142d66jsn7b1f9c9951df",
      "X-RapidAPI-Host": "youtube-mp36.p.rapidapi.com",
    },
  };
  const response = await axios.request(options);
  const data = response.data.link;
  return res.send(JSON.stringify(data));
});

//======================================= Linkedin Video Download =======================================

app.get("/views", async (req, res) => {
  try {
    const { videoUrl } = req.query;
    if (!videoUrl) {
      return res.render("linkedin", {
        videoUrl: null,
      });
    }

    const response = await axios.get(videoUrl);
    const htmlContent = response.data;

    const scriptContent = htmlContent.match(
      /<script type="application\/ld\+json">(.*?)<\/script>/s
    );

    if (scriptContent && scriptContent.length > 1) {
      const jsonLdObject = JSON.parse(scriptContent[1]);
      const videoData = jsonLdObject?.sharedContent?.url;
      res.render("downloadlinkedin", { videoUrl: videoData, url: videoUrl });
    } else {
      res.render("linkedin", {
        message: "No JSON-LD script found on the page.",
      });
    }
  } catch (error) {
    console.error("Error:", error);
    res.render("linkedin", { message: "An error occurred." });
  }
});

function getLinkedInPostId(url) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const postId = pathname.match(/\/([^/]+)\/?$/);
    if (postId && postId.length > 1) {
      return postId[1];
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

app.get("/downloadlinkedin", async (req, res) => {
  try {
    const { videoUrl } = req.query;
    if (!videoUrl) {
      return res.render("linkedin", { videoUrl: null });
    }

    const response = await axios.get(videoUrl);
    const scriptContent = response.data.match(
      /<script type="application\/ld\+json">([^<]+)<\/script>/
    );

    if (scriptContent && scriptContent.length > 1) {
      const jsonLdObject = JSON.parse(scriptContent[1]);
      const videoData = jsonLdObject.sharedContent;
      const filePath = `${getLinkedInPostId(videoUrl)}.mp4`;

      const videoStream = request.get(videoData);
      const fileStream = fs.createWriteStream(filePath);

      videoStream.pipe(fileStream);

      fileStream.on("finish", () => {
        res.download(filePath, filePath, (err) => {
          if (err) {
            console.error("Error:", err);
            res.render("linkedin", { videoUrl: null });
          }

          fs.unlink(filePath, (err) => {
            if (err) console.error("Error:", err);
          });
        });
      });
    } else {
      res.render("linkedin", { videoUrl: null });
    }
  } catch (error) {
    console.error("Error:", error);
    res.render("linkedin", { videoUrl: null });
  }
});

//=======================================Start the server =======================================
const port = 3001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
