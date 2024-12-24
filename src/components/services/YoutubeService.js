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
    if (data.items && data.items.length > 0) {
      const videoDetails = {
        id: videoId,
        title: data.items[0].snippet.title,
        description: data.items[0].snippet.description,
        videoName: data.items[0].snippet.title,
        youtubeChannel: data.items[0].snippet.channelTitle,
        videoDurationInHours: parseISO8601Duration(
          data.items[0].contentDetails.duration
        ),
        techStack: [], // Placeholder for tech stack (can be extracted if available)
        difficulty: "Intermediate", // Default difficulty (adjust as needed)
        link: url, // Original YouTube URL
      };
      console.log("Fetched from API:", videoDetails);
      return videoDetails;
    } else {
      throw new Error("Video not found");
    }
  } catch (error) {
    console.error("Error fetching from YouTube API:", error);
    throw error;
  }
}

// Helper function to convert ISO 8601 duration to hours
const parseISO8601Duration = (duration) => {
  // Match the ISO 8601 duration format (e.g., "PT1H30M45S")
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  // Extract hours, minutes, and seconds, defaulting to 0 if not present
  const hours = match[1] ? parseInt(match[1].replace("H", "")) : 0;
  const minutes = match[2] ? parseInt(match[2].replace("M", "")) : 0;
  const seconds = match[3] ? parseInt(match[3].replace("S", "")) : 0;
  // Convert total time to hours (fractional hours for minutes and seconds)
  return hours + minutes / 60 + seconds / 3600;
};

export { fetchVideoDetails, extractVideoId, videoCache };
