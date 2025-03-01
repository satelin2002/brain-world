import type { WordEntry } from "@/data/crosswords";
import { loadCrosswordData } from "@/lib/client/crosswordData";

export type ClueEntry = {
  number: number;
  clue: string;
  answer: string;
  row: number;
  col: number;
  length: number;
};

export type PuzzleData = {
  gridSize: number;
  blackCells: number[][];
  clues: {
    across: ClueEntry[];
    down: ClueEntry[];
  };
};

// Get a pool of random words and clues from our database
async function getWordPool(
  minLength: number,
  maxLength: number,
  count: number
): Promise<Array<{ word: string; clue: string }>> {
  const data = await loadCrosswordData();
  const pool: Array<{ word: string; clue: string }> = [];
  const usedWords = new Set<string>();

  // Create pools for each word length
  const wordsByLength: { [key: number]: WordEntry[] } = {};
  for (let len = minLength; len <= maxLength; len++) {
    wordsByLength[len] = [];
    switch (len) {
      case 2:
        wordsByLength[len] = [...data.twoLetterWords];
        break;
      case 3:
        wordsByLength[len] = [...data.threeLetterWords];
        break;
      case 4:
        wordsByLength[len] = [...data.fourLetterWords];
        break;
      case 5:
        wordsByLength[len] = [...data.fiveLetterWords];
        break;
    }
    // Shuffle each length pool
    for (let i = wordsByLength[len].length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [wordsByLength[len][i], wordsByLength[len][j]] = [
        wordsByLength[len][j],
        wordsByLength[len][i],
      ];
    }
  }

  // Get a mix of words of different lengths
  const lengthDistribution = {
    5: 0.4, // 40% five-letter words
    4: 0.3, // 30% four-letter words
    3: 0.2, // 20% three-letter words
    2: 0.1, // 10% two-letter words
  };

  for (let len = maxLength; len >= minLength; len--) {
    const targetCount = Math.floor(
      count * lengthDistribution[len as keyof typeof lengthDistribution]
    );
    const words = wordsByLength[len];
    let added = 0;

    for (const entry of words) {
      if (added >= targetCount || pool.length >= count) break;
      if (!usedWords.has(entry.word)) {
        const randomClueIndex = Math.floor(Math.random() * entry.clues.length);
        pool.push({
          word: entry.word,
          clue: entry.clues[randomClueIndex],
        });
        usedWords.add(entry.word);
        added++;
      }
    }
  }

  return pool;
}

class CrosswordGenerator {
  private grid: string[][];
  private puzzle: PuzzleData;
  private clueNumber: number = 1;
  private usedWords: Set<string> = new Set();

  constructor(private size: number) {
    this.grid = Array(size)
      .fill(null)
      .map(() => Array(size).fill(""));
    this.puzzle = {
      gridSize: size,
      blackCells: [],
      clues: {
        across: [],
        down: [],
      },
    };
  }

  private canPlaceWord(
    word: string,
    row: number,
    col: number,
    isAcross: boolean
  ): boolean {
    // Check bounds
    if (isAcross && col + word.length > this.size) return false;
    if (!isAcross && row + word.length > this.size) return false;

    let hasIntersection = false;

    // Check each position along the word
    for (let i = 0; i < word.length; i++) {
      const currentRow = isAcross ? row : row + i;
      const currentCol = isAcross ? col + i : col;
      const cell = this.grid[currentRow][currentCol];

      // Check if the current cell is compatible
      if (cell !== "") {
        if (cell !== word[i]) return false;
        hasIntersection = true;
      }

      // Check perpendicular cells
      if (isAcross) {
        // For across words, check cells above and below
        if (currentRow > 0 && this.grid[currentRow - 1][currentCol] !== "") {
          // Allow intersection only if it forms a valid word
          if (!this.isValidIntersection(word, i, row, col, isAcross))
            return false;
        }
        if (
          currentRow < this.size - 1 &&
          this.grid[currentRow + 1][currentCol] !== ""
        ) {
          if (!this.isValidIntersection(word, i, row, col, isAcross))
            return false;
        }
      } else {
        // For down words, check cells to left and right
        if (currentCol > 0 && this.grid[currentRow][currentCol - 1] !== "") {
          if (!this.isValidIntersection(word, i, row, col, isAcross))
            return false;
        }
        if (
          currentCol < this.size - 1 &&
          this.grid[currentRow][currentCol + 1] !== ""
        ) {
          if (!this.isValidIntersection(word, i, row, col, isAcross))
            return false;
        }
      }
    }

    // First word can be placed anywhere
    if (
      this.puzzle.clues.across.length === 0 &&
      this.puzzle.clues.down.length === 0
    ) {
      return true;
    }

    // Subsequent words must have at least one intersection
    return hasIntersection;
  }

  private isValidIntersection(
    word: string,
    pos: number,
    row: number,
    col: number,
    isAcross: boolean
  ): boolean {
    // This is a simplified check - we're just making sure we don't create invalid letter combinations
    return true;
  }

  private placeWord(
    word: string,
    clue: string,
    row: number,
    col: number,
    isAcross: boolean
  ): void {
    // Place the word
    for (let i = 0; i < word.length; i++) {
      const currentRow = isAcross ? row : row + i;
      const currentCol = isAcross ? col + i : col;
      this.grid[currentRow][currentCol] = word[i];
    }

    // Add the clue
    const clueEntry: ClueEntry = {
      number: this.clueNumber++,
      clue,
      answer: word,
      row,
      col,
      length: word.length,
    };

    if (isAcross) {
      this.puzzle.clues.across.push(clueEntry);
    } else {
      this.puzzle.clues.down.push(clueEntry);
    }

    this.usedWords.add(word);
    console.log(`Placed ${isAcross ? "across" : "down"} word: ${word}`);
  }

  private findBestPlacement(
    word: string
  ): { row: number; col: number; isAcross: boolean } | null {
    const placements = [];

    // Try both across and down placements
    for (const isAcross of [true, false]) {
      for (let row = 0; row < this.size; row++) {
        for (let col = 0; col < this.size; col++) {
          if (this.canPlaceWord(word, row, col, isAcross)) {
            // Calculate a score for this placement
            const score = this.calculatePlacementScore(
              word,
              row,
              col,
              isAcross
            );
            placements.push({ row, col, isAcross, score });
          }
        }
      }
    }

    // Sort by score and return the best placement
    if (placements.length > 0) {
      placements.sort((a, b) => b.score - a.score);
      return placements[0];
    }
    return null;
  }

  private calculatePlacementScore(
    word: string,
    row: number,
    col: number,
    isAcross: boolean
  ): number {
    let score = 0;

    // Prefer placements that create more intersections
    for (let i = 0; i < word.length; i++) {
      const currentRow = isAcross ? row : row + i;
      const currentCol = isAcross ? col + i : col;

      if (this.grid[currentRow][currentCol] !== "") {
        score += 2; // Intersection points
      }

      // Check perpendicular cells for potential future intersections
      if (isAcross) {
        if (currentRow > 0 && this.grid[currentRow - 1][currentCol] === "")
          score += 0.5;
        if (
          currentRow < this.size - 1 &&
          this.grid[currentRow + 1][currentCol] === ""
        )
          score += 0.5;
      } else {
        if (currentCol > 0 && this.grid[currentRow][currentCol - 1] === "")
          score += 0.5;
        if (
          currentCol < this.size - 1 &&
          this.grid[currentRow][currentCol + 1] === ""
        )
          score += 0.5;
      }
    }

    return score;
  }

  async generate(
    words: Array<{ word: string; clue: string }>
  ): Promise<PuzzleData> {
    // Sort words by length (prefer longer words first)
    words.sort((a, b) => b.word.length - a.word.length);

    // Place first word in the middle
    const firstWord = words[0];
    const middleRow = Math.floor(this.size / 2);
    const startCol = Math.floor((this.size - firstWord.word.length) / 2);
    this.placeWord(firstWord.word, firstWord.clue, middleRow, startCol, true);

    let attempts = 0;
    const maxAttempts = 2000; // Increased max attempts

    while (
      this.puzzle.clues.across.length + this.puzzle.clues.down.length < 8 &&
      attempts < maxAttempts
    ) {
      attempts++;

      // Try each remaining word
      for (let i = 1; i < words.length; i++) {
        const { word, clue } = words[i];
        if (this.usedWords.has(word)) continue;

        const placement = this.findBestPlacement(word);
        if (placement) {
          this.placeWord(
            word,
            clue,
            placement.row,
            placement.col,
            placement.isAcross
          );

          if (
            this.puzzle.clues.across.length + this.puzzle.clues.down.length >=
            8
          ) {
            break;
          }
        }
      }

      // If we haven't placed any new words in this attempt, shuffle the remaining words
      if (attempts % 100 === 0) {
        words = words.filter((w) => !this.usedWords.has(w.word));
        for (let i = words.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [words[i], words[j]] = [words[j], words[i]];
        }
      }
    }

    if (this.puzzle.clues.across.length + this.puzzle.clues.down.length < 8) {
      throw new Error("Could not place enough words");
    }

    // Fill in black cells
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        if (this.grid[row][col] === "") {
          this.puzzle.blackCells.push([row, col]);
        }
      }
    }

    return this.puzzle;
  }
}

export async function generatePuzzle(size: number = 5): Promise<PuzzleData> {
  // Get a larger initial word pool
  const wordPool = await getWordPool(2, 5, 2000); // Increased pool size

  // Try multiple attempts
  const maxAttempts = 10; // Increased max attempts

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`Attempt ${attempt} of ${maxAttempts}`);
      const generator = new CrosswordGenerator(size);
      const shuffledPool = [...wordPool];
      // Shuffle the pool
      for (let i = shuffledPool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledPool[i], shuffledPool[j]] = [shuffledPool[j], shuffledPool[i]];
      }
      return await generator.generate(shuffledPool);
    } catch (error) {
      console.log(`Failed attempt ${attempt}: ${error}`);
      if (attempt === maxAttempts) {
        throw new Error("Could not generate valid puzzle after all attempts");
      }
    }
  }

  throw new Error("Could not generate puzzle");
}

function generateClue(word: string): string {
  // Add your clue generation logic here
  return `Definition for ${word}`;
}
