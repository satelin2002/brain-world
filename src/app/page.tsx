import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 w-full">
        <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-black">Word Games</h1>
            <p className="text-xl text-muted-foreground">
              Challenge your mind with our collection of word games
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/wordle" className="block">
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>Wordle</CardTitle>
                  <CardDescription>
                    Guess the hidden word in 6 tries
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Each guess must be a valid 5-letter word. The color of the
                    tiles will change to show how close your guess was.
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/mini-crossword" className="block">
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>Mini Crossword</CardTitle>
                  <CardDescription>
                    Solve a compact 5x5 crossword puzzle
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Fill in the grid with answers to clues. Perfect for a quick
                    mental challenge during your break.
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/pattern-recall" className="block">
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>Pattern Recall</CardTitle>
                  <CardDescription>
                    Test your memory with growing patterns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Remember and recreate patterns of increasing complexity.
                    Start with a 4x4 grid and progress up to 10x10 as you
                    advance through levels.
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
