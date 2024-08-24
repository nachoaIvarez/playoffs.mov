"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import styles from "./Playoffs.module.css";
import { formatDuration } from "@/lib/utils";

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export default function Playoffs() {
  const [bracket, setBracket] = useState([]);
  const [currentMatchup, setCurrentMatchup] = useState(null);
  const [stage, setStage] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [winnerMovie, setWinnerMovie] = useState(null);

  useEffect(() => {
    const updateVH = () => {
      let vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    updateVH();
    window.addEventListener("resize", updateVH);

    const storedMovies = JSON.parse(
      localStorage.getItem("selectedMovies") || "[]"
    );
    if (storedMovies.length < 2) {
      return;
    }
    const shuffledMovies = shuffleArray([...storedMovies]);
    setBracket(shuffledMovies);
    setCurrentMatchup([shuffledMovies[0], shuffledMovies[1]]);
    setStage(getStage(shuffledMovies.length));

    return () => window.removeEventListener("resize", updateVH);
  }, []);

  const getStage = (moviesCount) => {
    if (moviesCount > 8) return "Round of 16";
    if (moviesCount > 4) return "Quarter-finals";
    if (moviesCount > 2) return "Semi-finals";
    return "Final";
  };

  const handleWinner = (winner) => {
    setWinnerMovie(winner);
    setTimeout(() => {
      setWinnerMovie(null);
      setBracket((prevBracket) => {
        const newBracket = prevBracket.filter(
          (movie) =>
            movie.imdbID !== currentMatchup[0].imdbID &&
            movie.imdbID !== currentMatchup[1].imdbID
        );
        newBracket.push(winner);

        if (newBracket.length === 1) {
          setGameOver(true);
          localStorage.removeItem("selectedMovies"); // Clear localStorage when game is over
        } else {
          setCurrentMatchup([newBracket[0], newBracket[1]]);
          setStage(getStage(newBracket.length));
        }

        return newBracket;
      });
    }, 1000); // Delay to allow the animation to complete
  };

  if (bracket.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center h-screen p-4"
        style={{ height: "calc(var(--vh, 1vh) * 100)" }}
      >
        <h1 className="text-2xl font-bold mb-4">Not Enough Movies</h1>
        <p className="mb-8 text-center">
          Please select at least 2 movies to start the playoffs.
        </p>
        <Link href="/" passHref>
          <Button>Back to Selection</Button>
        </Link>
      </div>
    );
  }

  if (gameOver) {
    const winner = bracket[0];
    return (
      <div
        className="flex flex-col items-center justify-between h-screen p-4 safe-area-bottom"
        style={{ height: "calc(var(--vh, 1vh) * 100)" }}
      >
        <h1 className={`text-2xl font-bold ${styles.winnerTitle}`}>Winner</h1>
        <Card className={`w-full max-w-xs ${styles.winnerCard}`}>
          <CardContent className="flex flex-col items-center p-2">
            <div className="relative w-full aspect-[2/3] mb-2">
              <Image
                src={
                  winner.Poster !== "N/A"
                    ? winner.Poster
                    : "/placeholder-image.jpg"
                }
                alt={winner.Title}
                fill
                className="object-cover rounded-md"
              />
            </div>
            <p className="font-semibold text-sm text-center line-clamp-1">
              {winner.Title}
            </p>
            <p className="text-xs text-gray-500">({winner.Year})</p>
          </CardContent>
        </Card>
        <Link href="/" passHref>
          <Button className="mt-4">Back to Selection</Button>
        </Link>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center justify-between h-screen p-4"
      style={{ height: "calc(var(--vh, 1vh) * 100)" }}
    >
      <h1 className="text-xl font-bold mb-2">Movie Playoffs - {stage}</h1>
      <div className="w-full max-w-sm space-y-2 flex-grow flex flex-col justify-center">
        {currentMatchup &&
          currentMatchup.map((movie) => (
            <Card
              key={movie.imdbID}
              className={`w-full cursor-pointer ${
                winnerMovie?.imdbID === movie.imdbID ? styles.winnerEffect : ""
              }`}
              onClick={() => handleWinner(movie)}
            >
              <CardContent className="flex items-center p-2">
                <div className="relative w-24 h-36 flex-shrink-0">
                  <Image
                    src={
                      movie.Poster !== "N/A"
                        ? movie.Poster
                        : "/placeholder-image.jpg"
                    }
                    alt={movie.Title}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
                <div className="flex-grow ml-3 flex flex-col justify-center">
                  <p className="font-semibold text-sm line-clamp-1">
                    {movie.Title}{" "}
                    <span className="font-normal text-gray-500">
                      ({movie.Year})
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDuration(movie.Runtime)}
                  </p>
                  <p className="text-xs text-gray-500 line-clamp-5 mt-1">
                    {movie.Plot}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
      <p className="mt-2 text-sm text-gray-500 safe-area-bottom">
        {bracket.length - 1} movies remaining
      </p>
    </div>
  );
}
