"use client";

import { Share2 } from "lucide-react";

interface ShareButtonProps {
  title: string;
}

export default function ShareButton({ title }: ShareButtonProps) {
  const handleShare = async () => {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title,
          // text: `${title} — Motoelan`,
          // url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        alert("Link kopyalandı");
      }
    } catch (error) {
      // İstifadəçi paylaşma pəncərəsini bağlayıbsa
      if ((error as Error).name !== "AbortError") {
        console.error("Share error:", error);
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2"
    >
      <Share2 size={20} />
      Paylaş
    </button>
  );
}