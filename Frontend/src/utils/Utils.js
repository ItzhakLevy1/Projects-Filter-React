import { mapCategory } from "../components/CategoryMapping"; // Import mapCategory function

// Fetch video details using the YouTube Data API
export const fetchVideoDetails = async (url) => {
  try {
    const videoId = new URL(url).searchParams.get("v");
    if (!videoId) {
      console.error("Invalid YouTube URL. Could not extract video ID.");
      return;
    }

    const apiKey = process.env.REACT_APP_YOUTUBE_API_KEY;
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails&key=${apiKey}`;

    console.log("Fetching video details from API...");
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`Error fetching video details: ${response.statusText}`);
    }

    const data = await response.json();
    const video = data.items[0];

    console.log("API response - data:", data);
    console.log(
      "API response - channelTitle / Name :",
      video.snippet.channelTitle
    );
    console.log(
      "API response - Duration / Length :",
      video.contentDetails.duration
    );
    console.log("API response - Video's Name :", video.snippet.localized.title);
    console.log("Category Name :", mapCategory(video.snippet.categoryId));
    console.log("video :", video);

    if (data.items.length === 0) {
      console.log("No video found with the provided video ID.");
      return;
    }

    const videoDurationInHours = parseDuration(video.contentDetails.duration);

    // Determine difficulty based on totalHours
    let difficulty = "Intermediate";
    if (videoDurationInHours.hours <= 5) {
      difficulty = "Beginner";
    } else if (videoDurationInHours.hours > 10) {
      difficulty = "Advanced";
    }
    console.log("Difficulty level :", difficulty);

    return {
      videoName: video.snippet.title,
      youtubeChannel: video.snippet.channelTitle,
      duration: video.contentDetails.duration, // Ensure duration is extracted
      techStack: [], // You can populate this if needed
      difficulty: difficulty, // Set difficulty based on totalHours
      link: url,
    };
  } catch (error) {
    console.error("Error in fetchVideoDetails:", error);
  }
};

// Helper function to parse ISO 8601 duration to hours
export const parseDuration = (isoDuration) => {
  console.log("Parsing duration:", isoDuration); // Log the input duration

  // Validate input
  if (!isoDuration || typeof isoDuration !== "string") {
    console.error("Invalid duration:", isoDuration);
    return { hours: 0, minutes: 0 }; // Default to 0 if the input is invalid
  }

  // Match the ISO 8601 duration pattern
  const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) {
    console.error("Invalid ISO 8601 duration format:", isoDuration);
    return { hours: 0, minutes: 0 }; // Default to 0 if no match
  }

  // Parse hours, minutes, and seconds
  const hours = parseInt(match[1]?.replace("H", "") || "0", 10);
  const minutes = parseInt(match[2]?.replace("M", "") || "0", 10);
  const seconds = parseInt(match[3]?.replace("S", "") || "0", 10);

  // Calculate total hours and minutes
  const totalMinutes = hours * 60 + minutes + Math.round(seconds / 60);
  const resultHours = Math.floor(totalMinutes / 60);
  const resultMinutes = totalMinutes % 60;

  console.log(
    `Duration parsed: ${hours} hours, ${minutes} minutes, ${seconds} seconds (${resultHours} hours, ${resultMinutes} minutes)`
  );

  return { hours: resultHours, minutes: resultMinutes };
};

export const parseISO8601Duration = (duration) => {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  const hours = match[1] ? parseInt(match[1].replace("H", "")) : 0;
  const minutes = match[2] ? parseInt(match[2].replace("M", "")) : 0;
  const seconds = match[3] ? parseInt(match[3].replace("S", "")) : 0;
  return hours + minutes / 60 + seconds / 3600;
};

// Filtering function based on the filters state
export const filterItems = (initialItems, filters) => {
  return initialItems.filter((item) => {
    const techKeywords = filters.techStack
      .toLowerCase()
      .split(" ")
      .filter((word) => word.trim() !== "");
    const isWithinMaxHours =
      filters.maxHours === "" ||
      (filters.maxHours === "0-5 hours" && item.lengthInHours <= 5) ||
      (filters.maxHours === "5-10 hours" &&
        item.lengthInHours > 5 &&
        item.lengthInHours <= 10) ||
      (filters.maxHours === "Above 10 hours" && item.lengthInHours > 10);

    return (
      (filters.videoName === "" || item.videoName === filters.videoName) &&
      (filters.youtubeChannel === "" ||
        item.youtubeChannel === filters.youtubeChannel) &&
      item.lengthInHours >= filters.minHours &&
      isWithinMaxHours &&
      (techKeywords.length === 0 ||
        techKeywords.some((keyword) =>
          item.techStack.some((tech) => tech.toLowerCase().includes(keyword))
        )) &&
      (filters.difficulty === "" || item.difficulty === filters.difficulty)
    );
  });
};
