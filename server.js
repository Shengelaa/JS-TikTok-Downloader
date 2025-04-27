const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors()); // Enable CORS for all origins

// Endpoint to fetch TikTok video details
app.get("/api/tiktok", async (req, res) => {
  const videoUrl = req.query.url; // Get the TikTok video URL from the query parameter
  if (!videoUrl) {
    return res.status(400).json({ error: "URL parameter is required" });
  }

  console.log(`Fetching details for URL: ${videoUrl}`);

  try {
    // Step 1: Use axios to get the final redirected URL (follow the redirection)
    const response = await axios.get(videoUrl, {
      maxRedirects: 5, // Allow redirects if it's a shortened URL
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    const fullUrl = response.request.res.responseUrl; // This should be the final redirected URL
    console.log(`Redirected to full URL: ${fullUrl}`);

    // Step 2: Make a call to the third-party TikTok downloader API to get the video and music URLs
    const videoResponse = await axios.get(
      "https://api.tiktokdownloader.net/api/download",
      {
        params: { url: fullUrl },
      }
    );

    console.log(
      "Received data from TikTok downloader API:",
      videoResponse.data
    );

    // Step 3: Return the video and music URLs in the response
    res.json({
      videoUrl: videoResponse.data.data.video,
      musicUrl: videoResponse.data.data.music,
    });
  } catch (error) {
    console.error("Error fetching TikTok video:", error.message);
    console.error("Full error stack:", error.stack);
    res.status(500).json({ error: "Failed to fetch TikTok video" });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server is running on http://localhost:${PORT}`);
});
