
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


app.use(express.static('public'));


// Set up EJS as the view engine
app.set("view engine", "ejs");

// Define route for rendering the index page
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/contact", (req, res) => {
  res.render("contact");
});

app.get("/privacy", (req, res) => {
  res.render("privacy");
});

app.get("/termsofservice", (req, res) => {
  res.render("termsofservice");
});


app.get("/dmca", (req, res) => {
  res.render("dmca");
});

app.get("/youtubetomp3", (req, res) => {
  res.render("youtubetomp3");
});
app.get('/robots.txt', (req, res) => {
  res.render('robots');
});
app.get('/sitemap.xml', (req, res) => {
  res.render('sitemap');
});

app.get('/https://toursession.com', (req, res) => {
  res.redirect("https://toursession.com/")
})

function convertToMP3(url) {
  const video = ytdl(url, { quality: "highestaudio" });
  video
    .pipe(
      ffmpeg()
        .inputFormat("webm")
        .outputOptions(["-f mp3", "-vn"])
        .format("mp3")
    )
    .pipe(process.stdout);
}

app.get("/mp3", async (req, res) => {

  var Url;
  if (req.query.url.includes("=")) {
    Url = req.query.url.split("=")[1]
  }
  else {
    Url = req.query.url
  }


  const options = {
    method: 'get',
    url: 'https://youtube-mp36.p.rapidapi.com/dl',
    params: { id: Url },
    headers: {
      'X-RapidAPI-Key': 'b4c99f7d15msha19e50d9a13dd92p142d66jsn7b1f9c9951df',
      'X-RapidAPI-Host': 'youtube-mp36.p.rapidapi.com'
    }
  };
  const response = await axios.request(options);
  const data = response.data.link
  return res.send(JSON.stringify(data))

});

app.get("/linkedindownload", (req, res) => {
  res.render("linkedin");
});

app.get('/videodownload', (req, res) => {
  console.log(req.query, "videoId")
  const videoId = req.query; // Replace 'VIDEO_ID' with the actual video ID.
  res.render('videodownloader', { videoId });
});

// youtube to mp3
app.get("/view", async (req, res) => {
  console.log(" req.query.url", req.query.url)
  const videoURL = req.query.url;
  console.log("videoURL", videoURL);
  res.render("downloadmp3", videoURL);
});

app.get("/videoInfo", async (req, res) => {
  const videoURL = req.query.url;
  try {
    const info = await ytdl.getInfo(videoURL);
    res.json(info);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch video info" });
  }
});

app.get("/downloadmp3", async (req, res) => {
  const videoURL = req.query.url;
  console.log(" req.query.url2", req.query.url)
  try {
    const info = await ytdl.getInfo(videoURL);
    const title = info.videoDetails.title.replace(/[^\w\s]/gi, "");
    const audioFormat = ytdl.chooseFormat(info.formats, {
      filter: "audioonly",
    });
    res.header("Content-Disposition", `attachment; filename="${title}.mp3"`);
    ytdl(videoURL, { format: audioFormat }).pipe(res);
  } catch (err) {
    res.status(500).send("Error occurred during download");
  }
});

// Linkedin
function getLinkedInPostId(url) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const postId = pathname.match(/\/([^/]+)\/?$/);
    if (postId && postId.length > 1) {
      return postId[1];
    } else {
      return null; // If the URL format is not recognized or doesn't contain a post ID
    }
  } catch (error) {
    console.error("Error:", error);
    return null; // If the URL is invalid or any other error occurs
  }
}

app.get("/views", async (req, res) => {
  try {
    const { videoUrl } = req.query;
    if (!videoUrl) {
      return res.render("linkedin", { videoUrl: null });
    }

    const response = await axios.get(videoUrl);
    const $ = cheerio.load(response.data);
    const scriptContent = $('script[type="application/ld+json"]').html();
    const jsonLdObject = JSON.parse(scriptContent);

    console.log(jsonLdObject.sharedContent)
    // Extract the video URL and other relevant data
    const videoData = jsonLdObject.sharedContent.url;
    res.render("downloadlinkedin", { videoUrl: videoData, url: videoUrl });
  } catch (error) {
    console.error("Error:", error);
    res.render("linkedin", { videoUrl: null });
  }
});

app.get("/downloadlinkedin", async (req, res) => {
  try {
    const { videoUrl } = req.query;
    if (!videoUrl) {
      return res.render("linkedin", { videoUrl: null });
    }

    const response = await axios.get(videoUrl);
    const $ = cheerio.load(response.data);
    const scriptContent = $('script[type="application/ld+json"]').html();

    const jsonLdObject = JSON.parse(scriptContent);

    // Extract the video URL and other relevant data
    const videoData = jsonLdObject.sharedContent.url;

    // Set the path where the video will be saved
    const filePath = `${getLinkedInPostId(videoUrl)}.mp4`;

    // Download the video file using the 'request' module
    const videoStream = request.get(videoData);
    const fileStream = fs.createWriteStream(filePath);

    videoStream.pipe(fileStream);

    fileStream.on("finish", () => {
      res.download(filePath, filePath, (err) => {
        if (err) {
          console.error("Error:", err);
          res.render("index", { videoUrl: null });
        }

        // Remove the temporary file after download is complete
        fs.unlink(filePath, (err) => {
          if (err) console.error("Error:", err);
        });
      });
    });
  } catch (error) {
    console.error("Error:", error);
    res.render("index", { videoUrl: null });
  }
});

//Youtube video downloader ---------------------------------------------------------------------------------------------------------------------------------------------------
app.get("/Videoviews", async (req, res) => {
  try {
    const { videoUrl } = req.query;
    if (!videoUrl) {
      return res.render("/", { videoUrl: null });
    }

    function getVideoIdFromUrl(url) {
      const pattern1 = /(?:\?|&)v=([a-zA-Z0-9_-]+)/; // For "https://www.youtube.com/watch?v=VIDEO_ID"
      const pattern2 = /youtu\.be\/([a-zA-Z0-9_-]+)/; // For "https://youtu.be/VIDEO_ID"
      const pattern3 = /embed\/([a-zA-Z0-9_-]+)/;   // For "https://www.youtube.com/embed/VIDEO_ID"
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
      }
      else if (match4) {
        const videoId = match4[1];
        return `https://www.youtube.com/embed/${videoId}`;
      } else {
        const urlParams = new URLSearchParams(new URL(url).search);
        const videoId = urlParams.get("v");
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      }
      
      // If the URL format is not recognized, return null or handle it as needed.
      return null;
    }
    // Usage
    const embedUrl = getVideoIdFromUrl(videoUrl);

    const response = await axios.get(videoUrl);
    const $ = cheerio.load(response.data);
    const scriptContent = $('script[type="application/ld+json"]').html();

    // Extract the video URL and other relevant data
    res.render("videodownloader", { videoUrl: embedUrl, url: videoUrl });
  } catch (error) {
    console.error("Error:", error);
    res.render("/", { videoUrl: null });
  }
});
function sanitize(filename) {
  return filename.replace(/[^a-z0-9]/gi, '_');
}
app.get("/downloadVideo", async (req, res) => {

  try {
    const { videoUrl } = req.query;
    if (!videoUrl) {
      return res.render("/", { videoUrl: null });
    }

    const info = await ytdl.getInfo(videoUrl);

    // You can choose the format you want to download, for example:
    const format = ytdl.chooseFormat(info.formats, { quality: "highest" });

    if (format) {
      const sanitizedFilename = sanitize(info.videoDetails.title);
      res.header("Content-Disposition", `attachment; filename="${sanitizedFilename}.mp4"`);
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


// ---------------------------------------------------------------------------------------------------------------------------------------------------
app.get("/download", async (req, res) => {
  const url = req.query.url;
  // Validate the URL
  if (ytdl(url)) {
    try {
      // Get video information
      const info = await ytdl.getInfo(url);
      const title = info.videoDetails.title;

      // Set the appropriate headers for the download
      res.header("Content-Disposition", `attachment; filename="${title}.mp4"`);
      ytdl(url, { quality: "highest" }).pipe(res);
    } catch (err) {
      console.error("Error:", err);
      res.render("index", { error: "Failed to download the video" });
    }
  } else {
    res.render("index", { error: "Invalid URL" });
  }
});

// Start the server
const port = 3001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
