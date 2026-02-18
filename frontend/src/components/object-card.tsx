"use client";

import Link from "next/link";
import { getImageUrl } from "@/lib/api";

interface ObjectCardProps {
  item: {
    _id: string;
    title: string;
    descripton?: string;
    imageUrl: string;
  };
}

export function ObjectCard({ item }: ObjectCardProps) {
  return (
    <Link href={`/objects/${item._id}`}>
      <div
        className="relative h-64 rounded-lg overflow-hidden cursor-pointer bg-cover bg-center"
        style={{ backgroundImage: `url(${getImageUrl(item.imageUrl)})` }}
      >
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <h3 className="text-white font-semibold text-lg">{item.title}</h3>
          {item.descripton && (
            <p className="text-white/80 text-sm truncate">{item.descripton}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
