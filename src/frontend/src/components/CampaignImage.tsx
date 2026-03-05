import { useImageBlob } from "@/hooks/useQueries";
import { useState } from "react";

interface Props {
  imageId?: string;
  fallbackSrc?: string;
  alt?: string;
  className?: string;
}

export default function CampaignImage({
  imageId,
  fallbackSrc,
  alt = "",
  className = "",
}: Props) {
  const { data: blobUrl, isLoading } = useImageBlob(imageId);
  const [imgError, setImgError] = useState(false);

  const src = !imgError && blobUrl ? blobUrl : fallbackSrc;

  if (isLoading && imageId && !fallbackSrc) {
    return <div className={`${className} bg-muted animate-pulse`} />;
  }

  if (!src) {
    return (
      <div
        className={`${className} bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center`}
      >
        <span className="text-orange-300 text-4xl">💝</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setImgError(true)}
      loading="lazy"
    />
  );
}
