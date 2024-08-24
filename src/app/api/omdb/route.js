import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  const id = searchParams.get("id");
  const apiKey = "90d7bc7b";

  try {
    let url;
    if (id) {
      url = `http://www.omdbapi.com/?i=${id}&apikey=${apiKey}`;
    } else if (query) {
      url = `http://www.omdbapi.com/?s=${query}&apikey=${apiKey}`;
    } else {
      return NextResponse.json(
        { error: "Missing query or id parameter" },
        { status: 400 }
      );
    }

    const response = await fetch(url);
    const data = await response.json();

    if (response.ok) {
      return NextResponse.json(data);
    } else {
      throw new Error("Failed to fetch from OMDB API");
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching data from OMDB API" },
      { status: 500 }
    );
  }
}
