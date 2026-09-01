import { Globe, Landmark, MapPin, MessageCircle, Newspaper, Send, AlertCircle } from "lucide-react";
import type { PropagationNode } from "@/lib/types";

export function PlatformIcon({
  platform,
  className,
}: {
  platform: PropagationNode["platform"];
  className?: string;
}) {
  switch (platform) {
    case "telegram":
      return <Send className={className} />;
    case "facebook":
      return <Globe className={className} />;
    case "whatsapp":
      return <MessageCircle className={className} />;
    case "x":
      return <XGlyph className={className} />;
    case "news":
      return <Newspaper className={className} />;
    case "public-record":
      return <Landmark className={className} />;
    case "origin":
      return <MapPin className={className} />;
    default:
      return <AlertCircle className={className} />;
  }
}

function XGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M18.244 2H21.5l-7.51 8.59L22.75 22H16.1l-5.2-6.79L4.9 22H1.64l8.03-9.18L1.25 2H8.08l4.7 6.2L18.24 2Zm-1.14 18.17h1.8L7.02 3.73H5.1l12 16.44Z" />
    </svg>
  );
}
