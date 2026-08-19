import { useCallback, useEffect, useRef, useState } from "react";
import { VideoPlayerRef } from "../components/media/playerTypes";

function cloudinaryVideoSrc(cloudName: string, publicId: string) {
  return `https://res.cloudinary.com/${cloudName}/video/upload/${encodeURI(publicId)}`;
}

function bindHtmlVideo(
  video: HTMLVideoElement,
  setPlaybackRate: (rate: number) => void
): VideoPlayerRef {
  return {
    getCurrentTime: () => video.currentTime,
    seekTo: (time: number) => {
      video.currentTime = time;
    },
    getDuration: () => video.duration || 0,
    play: () => {
      void video.play();
    },
    pause: () => video.pause(),
    setPlaybackRate: (rate: number) => {
      video.playbackRate = rate;
      setPlaybackRate(rate);
    },
    getPlaybackRate: () => video.playbackRate,
  };
}

export default function useCloudinaryPlayer(
  publicId: string | undefined | null
) {
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isReady, setIsReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<VideoPlayerRef | null>(null);
  const [duration, setDuration] = useState(0);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!publicId || !video) return;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
      console.error("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set");
      setHasError(true);
      return;
    }

    setHasError(false);
    setIsReady(false);

    // Direct Cloudinary delivery URL — same path the download button uses.
    // The Cloudinary Video Player widget was marking playable files as errors.
    video.src = cloudinaryVideoSrc(cloudName, publicId);
    playerRef.current = bindHtmlVideo(video, setPlaybackRate);

    const onLoaded = () => {
      setIsReady(true);
      setDuration(Math.floor(video.duration || 0));
      playerRef.current = bindHtmlVideo(video, setPlaybackRate);
    };
    const onError = () => {
      setHasError(true);
    };

    video.addEventListener("loadedmetadata", onLoaded);
    video.addEventListener("error", onError);

    return () => {
      video.removeEventListener("loadedmetadata", onLoaded);
      video.removeEventListener("error", onError);
      video.removeAttribute("src");
      video.load();
      playerRef.current = null;
      setIsReady(false);
    };
  }, [publicId]);

  const seekTo = useCallback((time: number) => {
    playerRef.current?.seekTo(time);
  }, []);

  const handleSpeedChange = useCallback((rate: number) => {
    const video = videoRef.current;
    if (video) {
      video.playbackRate = rate;
      setPlaybackRate(rate);
    }
  }, []);

  return {
    playerRef,
    playbackRate,
    handleSpeedChange,
    isReady,
    seekTo,
    duration,
    hasError,
    videoRef,
  };
}
