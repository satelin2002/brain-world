import type { CrosswordData } from "@/data/crosswords";

let cachedData: CrosswordData | null = null;

const fallbackData: CrosswordData = {
  twoLetterWords: [
    {
      word: "UP",
      clues: ["Toward the sky", "In a higher position", "Opposite of down"],
    },
  ],
  threeLetterWords: [
    {
      word: "CAT",
      clues: ["Purring pet", "Feline friend", "Whiskers and paws"],
    },
  ],
  fourLetterWords: [
    {
      word: "BOOK",
      clues: ["Written stories", "Reading material", "Library item"],
    },
  ],
  fiveLetterWords: [
    {
      word: "HAPPY",
      clues: ["Feeling joy", "Not sad", "Positive emotion"],
    },
  ],
};

export async function loadCrosswordData(): Promise<CrosswordData> {
  if (cachedData) {
    return cachedData;
  }

  try {
    console.log("Fetching crossword data from API...");
    const response = await fetch("/api/crosswords");

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.details || `API request failed with status ${response.status}`
      );
    }

    const data = await response.json();

    // Validate the data structure
    if (
      !data.twoLetterWords ||
      !data.threeLetterWords ||
      !data.fourLetterWords ||
      !data.fiveLetterWords
    ) {
      throw new Error("Invalid data structure received from API");
    }

    console.log("Successfully fetched crossword data");
    cachedData = data;
    return data;
  } catch (error) {
    console.error("Error loading crossword data:", error);
    console.log("Using fallback data...");
    return fallbackData;
  }
}
