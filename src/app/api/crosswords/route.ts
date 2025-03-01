import { NextResponse } from "next/server";
import { getCrosswordData } from "./data";

export const dynamic = "force-dynamic"; // Disable static optimization
export const runtime = "nodejs";

export async function GET() {
  try {
    console.log("Fetching crossword data...");
    const data = await getCrosswordData();
    console.log("Successfully fetched crossword data");
    return new NextResponse(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error in crosswords API:", error);
    return new NextResponse(
      JSON.stringify({
        error: "Failed to fetch crossword data",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
