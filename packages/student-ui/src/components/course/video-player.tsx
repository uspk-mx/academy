import { Slider } from "@academy/user-ui/components/ui/slider"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@academy/user-ui/components/ui/tooltip"
import { cn } from "@academy/user-ui/lib/utils"
import { pickLocale } from "@academy/user-ui/lib/lang"
import {
  IconAlertTriangle,
  IconMaximize,
  IconMinimize,
  IconPictureInPicture,
  IconPlayerPause,
  IconPlayerPlay,
  IconPlayerSkipBack,
  IconPlayerSkipForward,
  IconSettings,
  IconVolume,
  IconVolume2,
  IconVolume3,
} from "@tabler/icons-react"
import { useCallback, useEffect, useRef, useState } from "react"

const SKIP_SECONDS = 10
const CONTROLS_HIDE_DELAY = 2000
const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2]

export interface VideoPlayerLabels {
  play: string
  pause: string
  back10: string
  forward10: string
  mute: string
  unmute: string
  volume: string
  speed: string
  pictureInPicture: string
  fullscreen: string
  exitFullscreen: string
  loadError: string
}

export const defaultVideoPlayerLabels: VideoPlayerLabels = {
  play: "Reproducir",
  pause: "Pausar",
  back10: "Retroceder 10 s",
  forward10: "Avanzar 10 s",
  mute: "Silenciar",
  unmute: "Activar sonido",
  volume: "Volumen",
  speed: "Velocidad",
  pictureInPicture: "Picture in picture",
  fullscreen: "Pantalla completa",
  exitFullscreen: "Salir de pantalla completa",
  loadError:
    "No pudimos cargar el video. Recarga la página o inténtalo más tarde.",
}

export const videoPlayerLabels: Record<"es" | "en", VideoPlayerLabels> = {
  es: defaultVideoPlayerLabels,
  en: {
    play: "Play",
    pause: "Pause",
    back10: "Back 10 s",
    forward10: "Forward 10 s",
    mute: "Mute",
    unmute: "Unmute",
    volume: "Volume",
    speed: "Speed",
    pictureInPicture: "Picture in picture",
    fullscreen: "Fullscreen",
    exitFullscreen: "Exit fullscreen",
    loadError:
      "We couldn't load the video. Reload the page or try again later.",
  },
}

export interface VideoPlayerProps {
  src: string
  /** Container format from the API ("mp4"), used for the <source> type. */
  format?: string
  /** Known duration from the API, shown before metadata loads. */
  duration?: number
  subtitlesSrc?: string
  poster?: string
  labels?: VideoPlayerLabels
  lang?: string
  className?: string
  /** Fires once the video reaches the end — the route decides what that means. */
  onEnded?: () => void
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00"
  const total = Math.floor(seconds)
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const secs = total % 60
  const pad = (value: number) => value.toString().padStart(2, "0")
  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(secs)}`
    : `${pad(minutes)}:${pad(secs)}`
}

/**
 * Lesson video player with custom controls.
 *
 * Ported from the old academy-web player, with the controls restyled and four
 * behaviours corrected:
 *
 *  - keyboard shortcuts are scoped to the player (they were on `window`, so
 *    typing "f" or "m" in any input elsewhere toggled fullscreen/mute), and
 *    they read live state instead of the values captured on first render —
 *    arrow-key seeking used to clamp against a duration of 0 and jump to the
 *    start;
 *  - the quality menu is gone. It set state and nothing else: there is no
 *    HLS/DASH source to switch between, so it promised something it could not
 *    do. Playback speed, which does work, stays;
 *  - the buffering spinner condition was inverted and never rendered;
 *  - metadata listeners were attached twice, once per effect.
 */
export function VideoPlayer({
  src,
  format = "mp4",
  duration: knownDuration,
  subtitlesSrc,
  poster,
  lang,
  labels = pickLocale(lang, videoPlayerLabels),
  className,
  onEnded,
}: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const hideControlsRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const bufferingRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(knownDuration ?? 0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isBuffering, setIsBuffering] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [rate, setRate] = useState(1)
  const [showSpeed, setShowSpeed] = useState(false)

  // A new lesson reuses this component; reset so the previous video's position
  // and error state don't bleed into it.
  useEffect(() => {
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(knownDuration ?? 0)
    setHasError(false)
    setShowControls(true)
    videoRef.current?.load()
  }, [src, knownDuration])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onLoadedMetadata = () => {
      if (Number.isFinite(video.duration)) setDuration(video.duration)
      video.volume = volume
    }
    const onWaiting = () => {
      // Only call it buffering if it lasts; otherwise every seek flashes a spinner.
      bufferingRef.current = setTimeout(() => setIsBuffering(true), 500)
    }
    const onPlayable = () => {
      clearTimeout(bufferingRef.current)
      setIsBuffering(false)
    }
    const onVideoError = () => {
      setHasError(true)
      setIsBuffering(false)
    }

    video.addEventListener("loadedmetadata", onLoadedMetadata)
    video.addEventListener("durationchange", onLoadedMetadata)
    video.addEventListener("waiting", onWaiting)
    video.addEventListener("canplay", onPlayable)
    video.addEventListener("playing", onPlayable)
    video.addEventListener("error", onVideoError)

    return () => {
      video.removeEventListener("loadedmetadata", onLoadedMetadata)
      video.removeEventListener("durationchange", onLoadedMetadata)
      video.removeEventListener("waiting", onWaiting)
      video.removeEventListener("canplay", onPlayable)
      video.removeEventListener("playing", onPlayable)
      video.removeEventListener("error", onVideoError)
      clearTimeout(bufferingRef.current)
    }
    // `volume` is applied on load only; live changes go through handleVolume.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src])

  useEffect(() => {
    const onFullscreenChange = () =>
      setIsFullscreen(document.fullscreenElement === containerRef.current)
    document.addEventListener("fullscreenchange", onFullscreenChange)
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange)
  }, [])

  const togglePlay = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) void video.play()
    else video.pause()
  }, [])

  const skip = useCallback((seconds: number) => {
    const video = videoRef.current
    if (!video) return
    const max = Number.isFinite(video.duration) ? video.duration : Infinity
    video.currentTime = Math.max(0, Math.min(video.currentTime + seconds, max))
  }, [])

  const toggleMute = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setIsMuted(video.muted)
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen()
    else void containerRef.current?.requestFullscreen()
  }, [])

  const togglePictureInPicture = useCallback(async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture()
      } else {
        await videoRef.current?.requestPictureInPicture()
      }
    } catch {
      // Blocked by the browser or unsupported; the button simply does nothing.
    }
  }, [])

  /**
   * Shortcuts are bound to the container, not the window, so they only fire
   * when the player has focus — and never while typing in a field elsewhere.
   */
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const key = event.key.toLowerCase()
    const handled: Record<string, () => void> = {
      " ": togglePlay,
      k: togglePlay,
      arrowleft: () => skip(-SKIP_SECONDS),
      arrowright: () => skip(SKIP_SECONDS),
      m: toggleMute,
      f: toggleFullscreen,
    }
    const action = handled[key]
    if (!action) return
    event.preventDefault()
    action()
  }

  const revealControls = () => {
    setShowControls(true)
    clearTimeout(hideControlsRef.current)
    if (isPlaying) {
      hideControlsRef.current = setTimeout(
        () => setShowControls(false),
        CONTROLS_HIDE_DELAY
      )
    }
  }

  const handleSeek = (percent: number) => {
    const video = videoRef.current
    if (!video || duration <= 0) return
    const time = (percent * duration) / 100
    video.currentTime = time
    setCurrentTime(time)
  }

  const handleVolume = (percent: number) => {
    const video = videoRef.current
    if (!video) return
    const next = percent / 100
    video.volume = next
    video.muted = next === 0
    setVolume(next)
    setIsMuted(next === 0)
  }

  const VolumeIcon =
    isMuted || volume === 0
      ? IconVolume3
      : volume < 0.5
        ? IconVolume2
        : IconVolume

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    // biome-ignore lint/a11y/noNoninteractiveTabindex: the player is a focusable widget for its shortcuts
    <div
      ref={containerRef}
      tabIndex={0}
      role="region"
      aria-label={labels.play}
      onKeyDown={onKeyDown}
      onMouseMove={revealControls}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className={cn(
        "group relative w-full overflow-hidden rounded-card border-2 border-border-strong bg-academy-ink shadow-hard-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue",
        isFullscreen && "h-screen rounded-none border-0",
        className
      )}
    >
      <div className={cn("relative", !isFullscreen && "aspect-video")}>
        {hasError ? (
          <div className="flex size-full flex-col items-center justify-center gap-3 p-6 text-center text-content-inverse">
            <IconAlertTriangle aria-hidden className="size-10" />
            <p className="max-w-sm text-sm font-bold">{labels.loadError}</p>
          </div>
        ) : (
          <video
            ref={videoRef}
            poster={poster}
            playsInline
            // Only needed to read a cross-origin subtitle track. Setting it
            // unconditionally would make any host that doesn't send CORS
            // headers fail to load at all, for no benefit.
            crossOrigin={subtitlesSrc ? "anonymous" : undefined}
            className="size-full object-contain"
            onClick={togglePlay}
            onTimeUpdate={(event) =>
              setCurrentTime(event.currentTarget.currentTime)
            }
            onPlay={() => setIsPlaying(true)}
            onPause={() => {
              setIsPlaying(false)
              setShowControls(true)
            }}
            onEnded={() => {
              setIsPlaying(false)
              setShowControls(true)
              onEnded?.()
            }}
          >
            {src && <source src={src} type={`video/${format}`} />}
            {subtitlesSrc && (
              <track
                kind="subtitles"
                src={subtitlesSrc}
                srcLang="es"
                label="Español"
                default
              />
            )}
          </video>
        )}

        {isBuffering && !hasError && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="size-12 animate-spin rounded-pill border-4 border-white/30 border-t-white" />
          </div>
        )}

        {/* Big centre tap target: the main way to play on touch devices. */}
        {!isPlaying && !hasError && (
          <button
            type="button"
            onClick={togglePlay}
            aria-label={labels.play}
            className="absolute inset-0 flex items-center justify-center"
          >
            <span className="flex size-16 items-center justify-center rounded-pill border-2 border-border-strong bg-academy-yellow shadow-hard-sm transition-transform duration-150 ease-academy hover:scale-105">
              <IconPlayerPlay aria-hidden className="size-8" />
            </span>
          </button>
        )}

        {!hasError && (
          <div
            className={cn(
              "absolute inset-x-0 bottom-0 flex flex-col gap-2 bg-gradient-to-t from-black/85 to-transparent p-3 transition-opacity duration-200",
              showControls ? "opacity-100" : "pointer-events-none opacity-0"
            )}
          >
            <Slider
              aria-label={labels.play}
              value={[progress]}
              max={100}
              step={0.1}
              onValueChange={(value) =>
                handleSeek(Array.isArray(value) ? value[0] : Number(value))
              }
              className="w-full cursor-pointer"
            />

            <div className="flex items-center gap-1 text-white">
              <ControlButton
                label={labels.back10}
                onClick={() => skip(-SKIP_SECONDS)}
              >
                <IconPlayerSkipBack aria-hidden className="size-5" />
              </ControlButton>
              <ControlButton
                label={isPlaying ? labels.pause : labels.play}
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <IconPlayerPause aria-hidden className="size-6" />
                ) : (
                  <IconPlayerPlay aria-hidden className="size-6" />
                )}
              </ControlButton>
              <ControlButton
                label={labels.forward10}
                onClick={() => skip(SKIP_SECONDS)}
              >
                <IconPlayerSkipForward aria-hidden className="size-5" />
              </ControlButton>

              <span className="ml-1 text-xs font-bold tabular-nums">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>

              <div className="ml-auto flex items-center gap-1">
                <div className="hidden items-center gap-2 sm:flex">
                  <ControlButton
                    label={isMuted ? labels.unmute : labels.mute}
                    onClick={toggleMute}
                  >
                    <VolumeIcon aria-hidden className="size-5" />
                  </ControlButton>
                  <Slider
                    aria-label={labels.volume}
                    value={[isMuted ? 0 : volume * 100]}
                    max={100}
                    onValueChange={(value) =>
                      handleVolume(
                        Array.isArray(value) ? value[0] : Number(value)
                      )
                    }
                    className="w-20"
                  />
                </div>

                <div className="relative">
                  <ControlButton
                    label={labels.speed}
                    onClick={() => setShowSpeed((open) => !open)}
                  >
                    <span className="flex items-center gap-1">
                      <IconSettings aria-hidden className="size-5" />
                      {rate !== 1 && (
                        <span className="text-xs font-bold">{rate}x</span>
                      )}
                    </span>
                  </ControlButton>
                  {showSpeed && (
                    <ul className="absolute right-0 bottom-full z-10 mb-2 w-24 overflow-hidden rounded-button border-2 border-border-strong bg-surface-card text-content-primary shadow-hard-sm">
                      {PLAYBACK_RATES.map((value) => (
                        <li key={value}>
                          <button
                            type="button"
                            onClick={() => {
                              if (videoRef.current) {
                                videoRef.current.playbackRate = value
                              }
                              setRate(value)
                              setShowSpeed(false)
                            }}
                            className={cn(
                              "block w-full px-3 py-1.5 text-left text-sm font-bold hover:bg-academy-yellow",
                              value === rate && "bg-academy-yellow"
                            )}
                          >
                            {value}x
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <ControlButton
                  label={labels.pictureInPicture}
                  onClick={togglePictureInPicture}
                  className="hidden sm:inline-flex"
                >
                  <IconPictureInPicture aria-hidden className="size-5" />
                </ControlButton>

                <ControlButton
                  label={
                    isFullscreen ? labels.exitFullscreen : labels.fullscreen
                  }
                  onClick={toggleFullscreen}
                >
                  {isFullscreen ? (
                    <IconMinimize aria-hidden className="size-5" />
                  ) : (
                    <IconMaximize aria-hidden className="size-5" />
                  )}
                </ControlButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/** Overlay control: white on the video surface, tooltip-labelled. */
function ControlButton({
  label,
  onClick,
  className,
  children,
}: {
  label: string
  onClick: () => void
  className?: string
  children: React.ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            aria-label={label}
            onClick={onClick}
            className={cn(
              "inline-flex items-center justify-center rounded-button p-2 transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
              className
            )}
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
