import axios from "axios";
import { parseISO8601Duration } from "../../utils/Utils";
import keywords from "../../keywords.json"; // Import keywords

const videoCache = new Map();

async function fetchVideoDetails(url) {
  const videoId = extractVideoId(url);

  if (!videoId) {
    throw new Error("Invalid YouTube URL");
  }

  if (videoCache.has(videoId)) {
    console.log("Cache hit for video:", videoId);
    return videoCache.get(videoId); // Return cached data
  }

  console.log("Cache miss for video:", videoId);

  // Fetch data from YouTube API
  const videoDetails = await fetchFromYouTubeAPI(videoId, url);

  // Store fetched data in cache
  videoCache.set(videoId, videoDetails);

  return videoDetails;
}

function extractVideoId(url) {
  const match =
    url.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/.*v=([a-zA-Z0-9_-]+)/) ||
    url.match(/(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

async function fetchFromYouTubeAPI(videoId, url) {
  try {
    const apiKey = process.env.REACT_APP_YOUTUBE_API_KEY;
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails&key=${apiKey}`
    );
    const data = await response.json();
    // Look for a match in the video description with the keywords
    if (data.items && data.items.length > 0) {
      const description = data.items[0].snippet.description;
      const matchedKeywords = keywords.keywords.filter((keyword) =>
        description.toLowerCase().includes(keyword.toLowerCase())
      );

      console.log("Matched keywords:", matchedKeywords);

      const videoDetails = {
        id: videoId,
        title: data.items[0].snippet.title,
        // description: description,
        videoName: data.items[0].snippet.title,
        youtubeChannel: data.items[0].snippet.channelTitle, // Ensure youtubeChannel is extracted
        videoDurationInHours: parseISO8601Duration(
          data.items[0].contentDetails.duration
        ),
        techStack: matchedKeywords, // Use matched keywords as tech stack
        difficulty: "Intermediate", // Default difficulty (adjust as needed)
        link: url, // Original YouTube URL
      };
      console.log("Fetched from API:", videoDetails);

      // Send video details to backend
      await sendVideoDetailsToBackend(videoDetails);

      return videoDetails;
    } else {
      throw new Error("Video not found");
    }
  } catch (error) {
    console.error("Error fetching from YouTube API:", error);
    throw error;
  }
}

// Helper function to send video details to backend
async function sendVideoDetailsToBackend(videoDetails) {
  try {
    const response = await axios.post(
      "http://localhost:5000/api/items",
      videoDetails
    );
    console.log("Video details sent to backend:", response.data);
  } catch (error) {
    console.error("Error sending video details to backend:", error);
  }
}

export { fetchVideoDetails, extractVideoId, videoCache };
