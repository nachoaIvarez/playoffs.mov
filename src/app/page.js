"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Custom Input component to prevent zoom on mobile
const CustomInput = React.forwardRef((props, ref) => {
  return (
    <Input
      {...props}
      ref={ref}
      className={`text-base md:text-sm ${props.className || ""}`}
      style={{
        ...props.style,
        WebkitTextSizeAdjust: "100%",
        touchAction: "manipulation",
      }}
    />
  );
});
CustomInput.displayName = "CustomInput";

// Custom debounce function
function debounce(func, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default function Home() {
  const [slots, setSlots] = useState(Array(2).fill({ movie: null }));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSlotIndex, setActiveSlotIndex] = useState(null);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addClickCount, setAddClickCount] = useState(0);

  // Add this effect to update localStorage whenever slots change
  useEffect(() => {
    const selectedMovies = slots
      .filter((slot) => slot.movie)
      .map((slot) => slot.movie);
    localStorage.setItem("selectedMovies", JSON.stringify(selectedMovies));
  }, [slots]);

  const searchMovie = useCallback(async (query) => {
    if (query && query.length >= 3) {
      setIsLoading(true);
      try {
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=90d7bc7b&s=${encodeURIComponent(
            query
          )}&type=movie&r=json`
        );
        const data = await res.json();
        if (data.Search) {
          // Sort results by relevance and popularity
          const sortedResults = data.Search.sort((a, b) => {
            // Prioritize exact matches
            if (a.Title.toLowerCase() === query.toLowerCase()) return -1;
            if (b.Title.toLowerCase() === query.toLowerCase()) return 1;

            // Then prioritize titles starting with the query
            if (a.Title.toLowerCase().startsWith(query.toLowerCase()))
              return -1;
            if (b.Title.toLowerCase().startsWith(query.toLowerCase())) return 1;

            // Then sort by year (assuming more recent movies are more relevant)
            return parseInt(b.Year) - parseInt(a.Year);
          }).slice(0, 5);
          setSearchResults(sortedResults);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error("Error fetching movies:", error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setSearchResults([]);
    }
  }, []);

  const debouncedSearchMovie = useCallback(debounce(searchMovie, 300), [
    searchMovie,
  ]);

  const handleSearchChange = useCallback(
    (value) => {
      setSearch(value);
      debouncedSearchMovie(value);
    },
    [debouncedSearchMovie]
  );

  const handleSelectMovie = useCallback(
    (movie) => {
      if (activeSlotIndex !== null) {
        setSlots((prevSlots) => {
          const newSlots = [...prevSlots];
          newSlots[activeSlotIndex] = { movie };
          return newSlots;
        });
        setIsModalOpen(false);
        setActiveSlotIndex(null);
        setSearch("");
        setSearchResults([]);
      }
    },
    [activeSlotIndex]
  );

  const openModal = useCallback((index) => {
    setActiveSlotIndex(index);
    setIsModalOpen(true);
  }, []);

  const addMoreSlots = useCallback(() => {
    const newClickCount = addClickCount + 1;
    const newSlotsCount = Math.pow(2, newClickCount + 1);
    setSlots((prevSlots) => {
      const additionalSlots = Array(newSlotsCount - prevSlots.length).fill({
        movie: null,
      });
      return [...prevSlots, ...additionalSlots];
    });
    setAddClickCount(newClickCount);
  }, [addClickCount]);

  const pickMovie = useCallback((index) => {
    setActiveSlotIndex(index);
    setIsModalOpen(true);
  }, []);

  const removeMovie = useCallback((index) => {
    setSlots((prevSlots) => {
      const newSlots = [...prevSlots];
      newSlots[index] = { movie: null };
      return newSlots;
    });
  }, []);

  return (
    <div
      className="flex flex-col items-stretch bg-background text-foreground"
      style={{
        minHeight: "100vh",
        minHeight: "calc(var(--vh, 1vh) * 100)",
      }}
    >
      <div className="flex-grow px-4 sm:px-6 md:px-8 max-w-7xl mx-auto w-full py-8 overflow-y-auto pb-32">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-8 sm:mb-12 text-center">
          Pick Your Movies
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-12">
          {slots.map((slot, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="p-4">
                <CardTitle className="text-lg">Slot {index + 1}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {slot.movie ? (
                  <div className="flex flex-col items-center">
                    <div className="relative w-full aspect-[2/3] mb-2">
                      <Image
                        src={
                          slot.movie.Poster !== "N/A"
                            ? slot.movie.Poster
                            : "/placeholder-image.jpg"
                        }
                        alt={slot.movie.Title}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                    <p className="font-semibold text-sm text-center line-clamp-2 mb-1">
                      {slot.movie.Title}
                    </p>
                    <p className="text-xs text-gray-500 mb-2">
                      {slot.movie.Year}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => removeMovie(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="w-full bg-gray-800 hover:bg-gray-700 text-gray-200"
                    onClick={() => pickMovie(index)}
                  >
                    Click to Pick Movie
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 safe-area-bottom">
        <div className="flex justify-center space-x-4 max-w-7xl mx-auto">
          <Button
            onClick={addMoreSlots}
            variant="outline"
            className="w-[calc(50%-0.5rem)]"
          >
            Add More Slots
          </Button>
          <Link href="/playoffs" passHref className="w-[calc(50%-0.5rem)]">
            <Button
              disabled={slots.filter((slot) => slot.movie).length < 2}
              className="w-full"
            >
              Start Playoffs
            </Button>
          </Link>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px] top-[20%] translate-y-0 max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select a Movie</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <CustomInput
              type="text"
              placeholder="Search for a movie..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="mb-4"
            />
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((movie) => (
                <Button
                  key={movie.imdbID}
                  onClick={() => handleSelectMovie(movie)}
                  variant="ghost"
                  className="w-full justify-start text-left mb-2"
                >
                  {movie.Title} ({movie.Year})
                </Button>
              ))
            ) : search.length >= 3 ? (
              <p className="text-center text-gray-500">No results found</p>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
