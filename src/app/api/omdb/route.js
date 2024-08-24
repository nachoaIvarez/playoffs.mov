import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  const apiKey = process.env.OMDB_API_KEY;

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter is required" },
      { status: 400 }
    );
  }

  try {
    const omdbResponse = await fetch(
      `https://www.omdbapi.com/?apikey=90d7bc7b&s=${encodeURIComponent(
        query
      )}&type=movie&r=json`
    );
    const data = await omdbResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching from OMDB:", error);
    return NextResponse.json(
      { error: "Failed to fetch data from OMDB" },
      { status: 500 }
    );
  }
}
