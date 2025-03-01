import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function Footer() {
  const games = [
    { href: "/wordle", label: "Wordle", description: "Word Guessing Game" },
    {
      href: "/mini-crossword",
      label: "Mini Crossword",
      description: "Daily Puzzle",
    },
    {
      href: "/pattern-recall",
      label: "Pattern Recall",
      description: "Memory Challenge",
    },
  ];

  return (
    <footer className="w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Games Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold tracking-tight">Games</h3>
            <nav className="flex flex-col space-y-2">
              {games.map((game) => (
                <Link
                  key={game.href}
                  href={game.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {game.label} - {game.description}
                </Link>
              ))}
            </nav>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold tracking-tight">
              Quick Links
            </h3>
            <nav className="flex flex-col space-y-2">
              <Link
                href="/"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Home
              </Link>
              {games.map((game) => (
                <Link
                  key={game.href}
                  href={game.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Play {game.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* About Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold tracking-tight">About</h3>
            <p className="text-sm text-muted-foreground">
              Challenge your mind with our collection of engaging games. From
              word puzzles to memory challenges, we offer a variety of ways to
              test and improve your skills.
            </p>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Word Games. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {games.map((game) => (
              <Button key={game.href} variant="ghost" size="sm" asChild>
                <Link href={game.href}>Play {game.label}</Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
