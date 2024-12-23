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
    const totalHours = parseDuration(data.items[0].contentDetails.duration);
    const categoryId = data.items[0].snippet.categoryId;
    const categoryName = mapCategory(categoryId);
    const channelTitle = data.items[0].snippet.channelTitle;
    const videoName = data.items[0].snippet.localized.title;
    const video = data.items[0];

    console.log("API response - data:", data);
    console.log("API response - channelTitle / Name :", channelTitle);
    console.log("API response - Duration / Length :", totalHours);
    console.log("API response - Video's Name :", videoName);
    console.log("Category Name :", categoryName);
    console.log("video :", video);

    if (data.items.length === 0) {
      console.log("No video found with the provided video ID.");
      return;
    }

    const videoDurationInHours = parseDuration(
      data.items[0].contentDetails.duration
    );

    // Determine difficulty based on totalHours
    let difficulty = "Intermediate";
    if (totalHours <= 5) {
      difficulty = "Beginner";
    } else if (totalHours > 10) {
      difficulty = "Advanced";
    }
    console.log("Difficulty level :", difficulty);

    return {
      videoName: video.snippet.title,
      youtubeChannel: video.snippet.channelTitle,
      videoDurationInHours: parseISO8601Duration(
        data.items[0].contentDetails.duration
      ),
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
  const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  const hours = parseInt(match[1]?.replace("H", "") || "0", 10);
  const minutes = parseInt(match[2]?.replace("M", "") || "0", 10);
  const seconds = parseInt(match[3]?.replace("S", "") || "0", 10);

  const totalHours = hours + minutes / 60 + seconds / 3600;
  console.log(
    `Duration parsed: ${hours} hours, ${minutes} minutes, ${seconds} seconds (${totalHours.toFixed(
      2
    )} hours)`
  );
  // console.log("totalHours", totalHours);
  return totalHours;
};

const parseISO8601Duration = (duration) => {
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
