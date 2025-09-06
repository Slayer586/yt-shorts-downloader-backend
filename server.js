import express from "express";
import cors from "cors";
import ytdl from "@distube/ytdl-core";

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  res.send("YouTube Shorts Downloader Backend with @distube/ytdl-core 🚀");
});

app.get("/download", async (req, res) => {
  try {
    let videoURL = req.query.url;
    if (!videoURL) {
      return res.status(400).json({ error: "No URL provided" });
    }

    // Normalize Shorts URL
    if (videoURL.includes("?")) {
      videoURL = videoURL.split("?")[0];
    }
    if (videoURL.includes("youtube.com/shorts/")) {
      const videoId = videoURL.split("/shorts/")[1];
      videoURL = `https://www.youtube.com/watch?v=${videoId}`;
    }

    console.log("Normalized URL:", videoURL);

    if (!ytdl.validateURL(videoURL)) {
      return res.status(400).json({ error: "Invalid YouTube URL" });
    }

    const info = await ytdl.getInfo(videoURL);
    const title = info.videoDetails.title.replace(/[^\w\s]/gi, "_");

    res.header("Content-Disposition", `attachment; filename="${title}.mp4"`);
    res.header("Content-Type", "video/mp4");

    ytdl(videoURL, { quality: "highestvideo", filter: "audioandvideo" }).pipe(res);
  } catch (err) {
    console.error("Download error:", err.message);
    res.status(500).json({ error: "Error downloading video", details: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
