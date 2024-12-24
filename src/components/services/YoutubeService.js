const videoCache = new Map();

async function fetchVideoDetails(url) {
  const videoId = extractVideoId(url);

  if (!videoId) {
    throw new Error("Invalid YouTube URL");
  }

  if (videoCache.has(videoId)) {
    console.log("Cache hit for video:", videoId);
    return videoCache.get(videoId);
  }

  console.log("Cache miss for video:", videoId);

  const videoDetails = await fetchFromYouTubeAPI(videoId);
  videoCache.set(videoId, videoDetails);

  return videoDetails;
}

function extractVideoId(url) {
  const match =
    url.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/.*v=([a-zA-Z0-9_-]+)/) ||
    url.match(/(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

async function fetchFromYouTubeAPI(videoId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: videoId,
        title: `Sample Video Title for ${videoId}`,
        description: "This is a mock description",
      });
    }, 1000);
  });
}

export { fetchVideoDetails };
