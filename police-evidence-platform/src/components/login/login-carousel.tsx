"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const SLIDES = [
  "/images/PhotoVideoGallery-GalleryItems-003-01-hf-7ebcfce2da4147e589811c33203f7894.jpg",
  "/images/PhotoVideoGallery-GalleryItems-003-01-hf-646b10d871f240d7b3a49be52f5cb166.jpg",
];

const SLIDE_DURATION_MS = 5000;

export function LoginCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % SLIDES.length);
    }, SLIDE_DURATION_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 h-[60vh] overflow-hidden bg-black">
      {SLIDES.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          priority={i === 0}
          sizes="100vw"
          className="object-cover transition-opacity duration-1000 ease-in-out"
          style={{ opacity: i === index ? 1 : 0 }}
        />
      ))}
    </div>
  );
}
