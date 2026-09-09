"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Camera,
  Captions,
  Eye,
  EyeOff,
  Languages,
  Loader2,
  ExternalLink,
  FileText,
  HelpCircle,
  Mic,
  ScanFace,
  Search,
  ShieldAlert,
  ShieldCheck,
  Siren,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AudioAnalyser } from "@/components/investigation/audio-analyser";
import { SpliceDetectionPanel, type CachedSpliceDetectionResult } from "@/components/investigation/splice-detection-panel";
import { FaceDetailDialog, type FaceAnnotationData } from "@/components/investigation/face-detail-dialog";
import {
  MediaPlayer,
  MediaProvider,
  useActiveTextCues,
  useActiveTextTrack,
  type MediaPlayerInstance,
  type VideoMimeType,
  type AudioMimeType,
} from "@vidstack/react";
import { defaultLayoutIcons, DefaultVideoLayout, DefaultAudioLayout } from "@vidstack/react/player/layouts/default";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";
import "@vidstack/react/player/styles/default/layouts/audio.css";

interface FrameScore {
  timestampSeconds: number;
  probability: number;
  faceDetected: boolean;
}

function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

export interface CachedTranscript {
  language: string;
  segments: TranscriptSegment[];
  truncated: boolean;
  // Null until an investigator explicitly runs "Validate speech" — a real
  // Silero VAD check, independent of Whisper's own output (see
  // speech_validator.py). Never auto-populated: a non-empty transcript
  // alone doesn't prove the clip actually contains speech, since Whisper's
  // best-known failure mode is hallucinating plausible text over silence/
  // music/noise.
  hasSpeech: boolean | null;
  speechRatio: number | null;
  // Real Gemini judgment of whether the transcript's actual content
  // contains a threat — null until an investigator explicitly runs
  // "Detect threat" (never automatic, same rule as hasSpeech above).
  threatAssessment: {
    containsThreat: boolean;
    severity: "low" | "medium" | "high" | null;
    reasoning: string | null;
    quote: string | null;
  } | null;
  // Real, live Google Search-grounded verdict on whether real sources
  // confirm/debunk the transcript's actual content — null until an
  // investigator explicitly runs "Verify claim".
  claimVerification: {
    verdict: "confirmed" | "debunked" | "unclear";
    summary: string;
    citations: { title: string; url: string; domain: string }[];
  } | null;
  translations: { targetLang: string; segments: TranscriptSegment[] }[];
}

// Mirrors translator.py's SUPPORTED_LANGUAGES allowlist — kept as a small
// UI-side duplicate rather than fetched from the ml-service at render time,
// same tradeoff as the mock's hardcoded playback-rate options: this list
// changes rarely enough that a static duplicate is simpler than adding a
// new "list supported languages" round trip.
const TRANSLATION_LANGUAGES: { code: string; label: string }[] = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "pa", label: "Punjabi" },
  { code: "ur", label: "Urdu" },
  { code: "bn", label: "Bengali" },
  { code: "ta", label: "Tamil" },
  { code: "te", label: "Telugu" },
  { code: "mr", label: "Marathi" },
  { code: "gu", label: "Gujarati" },
  { code: "ar", label: "Arabic" },
  { code: "fr", label: "French" },
  { code: "es", label: "Spanish" },
];

function languageLabel(code: string): string {
  return TRANSLATION_LANGUAGES.find((l) => l.code === code)?.label ?? code.toUpperCase();
}

/** Builds a WebVTT string from Whisper's {start,end,text} segments (seconds)
 * — Vidstack's TextTrack `content` accepts a real VTT string directly, so
 * this is the only format conversion needed to hand a transcript to the
 * player's own native caption renderer. */
function segmentsToVtt(segments: TranscriptSegment[]): string {
  const toVttTime = (seconds: number) => {
    const s = Math.max(0, seconds);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${sec.toFixed(3).padStart(6, "0")}`;
  };
  const cues = segments
    .map((seg, i) => `${i + 1}\n${toVttTime(seg.start)} --> ${toVttTime(seg.end)}\n${seg.text}`)
    .join("\n\n");
  return `WEBVTT\n\n${cues}`;
}

/**
 * Renders no DOM of its own — a bridge that must live inside <MediaPlayer>
 * (Vidstack's active-track/active-cue hooks read React context that only
 * exists there) purely to lift the currently-showing caption line out to
 * the parent's own state. Needed instead of Vidstack's own <Captions>
 * overlay component because that one is CSS-absolute-positioned above the
 * audio control bar (`bottom: calc(100% + offset)`), which gets clipped by
 * this viewer's `overflow-hidden` container — this renders the caption
 * text in normal document flow instead, wherever the parent puts it
 * (specifically: above the waveform visualizer, at direct request), with
 * zero positioning/clipping risk. Stays in sync with whichever track the
 * user actually has selected from the player's own native CC menu, not a
 * separately-tracked selection.
 */
function ActiveCaptionBridge({ onChange }: { onChange: (text: string) => void }) {
  const track = useActiveTextTrack("captions");
  const cues = useActiveTextCues(track);
  const text = cues.map((c) => c.text).join(" ");
  useEffect(() => {
    onChange(text);
  }, [text, onChange]);
  return null;
}

type OverlayMode = "none" | "heatmap" | "negative" | "edge";

/** Same two CSS filters as the old mock's "ELA"/"Edge Det." tiles
 * (`getFilterStyle`) — plain visual filters for manual inspection, not a
 * forensic ML technique (real "Error Level Analysis" is a JPEG-recompression
 * artifact comparison, not a color invert). Restored at direct user
 * request after an earlier pass deliberately left them out; kept honestly
 * labeled rather than presented as equivalent to the real Grad-CAM heatmap. */
function getFilterStyle(mode: OverlayMode): React.CSSProperties {
  switch (mode) {
    case "negative":
      return { filter: "invert(1) contrast(1.2)" };
    case "edge":
      return { filter: "contrast(200%) invert(1) grayscale(100%)" };
    default:
      return {};
  }
}

/**
 * Real media viewer for a real case's evidence — actual uploaded file,
 * actual Grad-CAM heatmap when detection has run, and now a real face
 * detection box + crop (MTCNN's actual output, not the old mock's
 * hardcoded `left-[34%] top-[18%]` box with a fabricated "98.4%" label).
 *
 * NCII/minor-sensitivity evidence blurs by default and requires an
 * explicit reveal action (PS4_MVP_BUILD_PLAN.md §2) — this is the first
 * place real media actually renders for a real case, so this is where that
 * rule has to be enforced, not an afterthought.
 */
export function RealEvidenceViewer({
  caseId,
  evidenceId,
  mimeType,
  sensitivityLevel,
  hasCustodyContent,
  hasHeatmap,
  hasFrameHeatmaps,
  faceBoxes,
  faceCropCount,
  faceAnnotations,
  frameScores,
  cachedTranscript,
  cachedSpliceDetection,
}: {
  caseId: string;
  evidenceId: string;
  mimeType: string;
  sensitivityLevel: string;
  /** Whether the "Custody & legal" tab has anything to show for this
   * exhibit — overrides/declarant/custody-transfers/forensic-expert are all
   * manual actions an investigator may never have taken, and a tab that's
   * always empty is worse than no tab. */
  hasCustodyContent: boolean;
  hasHeatmap: boolean;
  hasFrameHeatmaps: boolean;
  faceBoxes: [number, number, number, number][];
  faceCropCount: number;
  faceAnnotations: Map<number, FaceAnnotationData>;
  frameScores: FrameScore[] | null;
  cachedTranscript: CachedTranscript | null;
  cachedSpliceDetection: CachedSpliceDetectionResult | null;
}) {
  const router = useRouter();
  const isSensitive = sensitivityLevel !== "standard";
  const [revealed, setRevealed] = useState(!isSensitive);
  const [revealing, setRevealing] = useState(false);
  const [revealError, setRevealError] = useState("");
  // Single-select overlay mode — matches the old mock's "Live Forensic
  // Feeds" tile grid exactly: Original / Heatmap / ELA / Edge Detection,
  // all 4, restored at direct user request. Heatmap is a real Grad-CAM
  // output; ELA/Edge Detection are the same plain CSS filters as the mock
  // (no real signal-processing technique behind them) — kept, but not
  // mislabeled as ML output. Face-box detection is a separate real toggle
  // below, independent of this grid (it isn't one of the mock's 4 tiles).
  const [overlayMode, setOverlayMode] = useState<OverlayMode>("none");
  const showHeatmap = overlayMode === "heatmap";
  const [showFaceBox, setShowFaceBox] = useState(false);
  const [selectedFaceIndex, setSelectedFaceIndex] = useState<number | null>(null);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [extractStatus, setExtractStatus] = useState<"idle" | "extracting" | "error">("idle");
  const [extractError, setExtractError] = useState("");
  const [transcript, setTranscript] = useState<CachedTranscript | null>(cachedTranscript);
  const [transcriptStatus, setTranscriptStatus] = useState<"idle" | "loading" | "error">("idle");
  const [transcriptError, setTranscriptError] = useState("");
  // Picks up captions generated by the "Investigate" button's follow-on
  // chain (evidence-card.tsx), which calls the transcript route directly
  // rather than this component's own handleGenerateCaptions — that call
  // updates the DB and the page refreshes with a new cachedTranscript prop,
  // but plain useState(cachedTranscript) only reads the initial value once.
  // React's own "adjusting state when a prop changes" pattern (setState
  // during render, gated on a prop-identity comparison) rather than an
  // effect — only fires while transcript is still null, so it can never
  // clobber a translation/threat-assessment/claim-verification the
  // investigator already added locally through this panel's own buttons.
  const [prevCachedTranscript, setPrevCachedTranscript] = useState(cachedTranscript);
  if (cachedTranscript !== prevCachedTranscript) {
    setPrevCachedTranscript(cachedTranscript);
    if (!transcript && cachedTranscript) setTranscript(cachedTranscript);
  }
  const [translateTarget, setTranslateTarget] = useState(
    () => TRANSLATION_LANGUAGES.find((l) => l.code !== cachedTranscript?.language)?.code ?? "en"
  );
  // If the selected target ever collides with the transcript's own detected
  // language (e.g. transcript loads/changes after this state's initial
  // value was picked), the option is filtered out of the <select> below but
  // the controlled `value` still holds the stale code, so the browser falls
  // back to displaying its first rendered option ("English") without ever
  // firing onChange — translateTarget silently stays wrong and a translate
  // click sends a no-op source===target request. Keep it in sync instead.
  // Same "adjusting state during render, gated on identity comparison"
  // pattern as prevCachedTranscript above, not a useEffect — setState
  // directly inside an effect body triggers an extra cascading render
  // React's own lint rules flag for exactly this reason.
  const [prevTranscriptLanguage, setPrevTranscriptLanguage] = useState(transcript?.language ?? null);
  if ((transcript?.language ?? null) !== prevTranscriptLanguage) {
    setPrevTranscriptLanguage(transcript?.language ?? null);
    if (transcript && translateTarget === transcript.language) {
      setTranslateTarget(TRANSLATION_LANGUAGES.find((l) => l.code !== transcript.language)?.code ?? "en");
    }
  }
  const [translatingLang, setTranslatingLang] = useState<string | null>(null);
  const [translateError, setTranslateError] = useState("");
  const [validatingSpeech, setValidatingSpeech] = useState(false);
  const [validateSpeechError, setValidateSpeechError] = useState("");
  const [detectingThreat, setDetectingThreat] = useState(false);
  const [detectThreatError, setDetectThreatError] = useState("");
  const [verifyingClaim, setVerifyingClaim] = useState(false);
  const [verifyClaimError, setVerifyClaimError] = useState("");
  // Full-transcript reading view, separate from the player's own live
  // caption overlay — lets an investigator read the whole thing at once
  // instead of only whatever line is showing at the current playback
  // position. null = the original-language transcript.
  const [showScript, setShowScript] = useState(false);
  const [scriptLang, setScriptLang] = useState<string | null>(null);
  // Which sampled frame's own heatmap to show instead of the single
  // worst-scoring frame's — null means "the default worst-frame heatmap."
  const [selectedFrameIndex, setSelectedFrameIndex] = useState<number | null>(null);
  // Which languages already have a live TextTrack attached to the player —
  // a ref, not state, since it's write-once-per-language bookkeeping that
  // shouldn't itself trigger a re-render. Vidstack allows only one
  // TextTrack per element instance; re-adding the same language on a
  // second render (e.g. after an unrelated state update) would otherwise
  // silently duplicate entries in the player's own caption menu.
  const addedCaptionTracksRef = useRef<Set<string>>(new Set());
  // Current caption line for the audio player's caption-text box above the
  // waveform — lifted out of Vidstack's own reactive state via
  // ActiveCaptionBridge. Video doesn't need this: Vidstack's <Captions>
  // overlay already renders directly inside the video frame via
  // DefaultVideoLayout.
  const [activeCaptionText, setActiveCaptionText] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  // Seeking/reading currentTime goes through this (Vidstack's own real
  // player API), not the raw <video> element below — see the frame-step
  // buttons' comment for why. mediaElRef is still needed for the parts
  // that genuinely require the actual DOM element: natural-size reading
  // and feeding the real Web Audio analyser (createMediaElementSource
  // needs the literal HTMLMediaElement, not a wrapper).
  const playerRef = useRef<MediaPlayerInstance>(null);
  // State, not a ref — AudioAnalyser's effect needs to actually re-run once
  // this becomes available. For video, this is only set later inside
  // `onProviderChange` (Vidstack attaches its provider asynchronously,
  // after this component's own first render/effect pass), so a plain ref
  // left AudioAnalyser's mount effect reading `.current === null` and
  // bailing out for good — the waveform/spectrogram silently never
  // animated even during real playback. Found live, not by inspection:
  // reported as "the graphs aren't moving."
  const [mediaEl, setMediaEl] = useState<HTMLVideoElement | HTMLAudioElement | null>(null);
  // Live-synced tile previews (matches the old mock's `relayVideoRefs`) —
  // each "Live Forensic Feeds" video tile is a separate, real <video> with
  // the same src, kept in lockstep with the main player via native events
  // on `mediaEl` rather than each tile driving its own playback.
  const relayVideoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  useEffect(() => {
    if (!mediaEl || !(mediaEl instanceof HTMLVideoElement)) return;
    const video = mediaEl;
    const handlePlay = () => relayVideoRefs.current.forEach((v) => v?.play().catch(() => {}));
    const handlePause = () => relayVideoRefs.current.forEach((v) => v?.pause());
    const handleTimeUpdate = () => {
      const time = video.currentTime;
      relayVideoRefs.current.forEach((v) => {
        if (v && Math.abs(v.currentTime - time) > 0.5) v.currentTime = time;
      });
    };
    const handleSeeked = () => {
      const time = video.currentTime;
      relayVideoRefs.current.forEach((v) => {
        if (v) v.currentTime = time;
      });
    };
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("seeked", handleSeeked);
    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("seeked", handleSeeked);
    };
  }, [mediaEl]);

  // Pushes the transcript (and any translations already fetched) into
  // Vidstack's own TextTrackList as real "captions" tracks — its default
  // layout already renders a CC button + track-picker menu once any track
  // exists, so this is the entire caption UI; no custom overlay component.
  // Runs whenever `transcript` changes AND whenever `mediaEl` newly becomes
  // available (Vidstack attaches its provider asynchronously — see the
  // comment on `mediaEl`'s declaration above — so a transcript that arrived
  // before the provider was ready needs a second pass once it is).
  useEffect(() => {
    const player = playerRef.current;
    if (!player || !transcript) return;
    const addTrack = (lang: string, label: string, segments: TranscriptSegment[], isDefault: boolean) => {
      if (addedCaptionTracksRef.current.has(lang) || segments.length === 0) return;
      addedCaptionTracksRef.current.add(lang);
      player.textTracks.add({
        kind: "captions",
        label,
        language: lang,
        type: "vtt",
        content: segmentsToVtt(segments),
        default: isDefault,
      });
    };
    addTrack(transcript.language, `${languageLabel(transcript.language)} (original)`, transcript.segments, true);
    for (const t of transcript.translations) {
      addTrack(t.targetLang, `${languageLabel(t.targetLang)} (translated)`, t.segments, false);
    }
  }, [transcript, mediaEl]);

  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const CONTAINER_HEIGHT = 280; // matches the fixed h-[280px] on the media element below

  // Guards against an infinite render loop: the ref callback below runs on
  // every render (inline function = new identity each time), so it must
  // never call setState with a genuinely new object when the values are
  // unchanged -- returning the same `prev` reference makes React bail out
  // of that particular update instead of re-rendering forever. Found live
  // via "Maximum update depth exceeded" after the first version of this
  // fix, which called setNaturalSize unconditionally.
  const setNaturalSizeIfChanged = (w: number, h: number) => {
    setNaturalSize((prev) => (prev && prev.w === w && prev.h === h ? prev : { w, h }));
  };

  // Tracks the container's actual rendered width (it's w-full, so this
  // varies with layout) via ResizeObserver, kept in state rather than read
  // from the ref during render -- reading ref.current in the render body
  // isn't safe/reactive in React.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      setContainerWidth(entries[0]?.contentRect.width ?? null);
    });
    observer.observe(el);
    setContainerWidth(el.clientWidth);
    return () => observer.disconnect();
  }, []);

  const fileUrl = `/api/cases/${caseId}/evidence/${evidenceId}/file`;
  const heatmapUrl =
    hasFrameHeatmaps && selectedFrameIndex !== null
      ? `/api/cases/${caseId}/evidence/${evidenceId}/heatmap?frame=${selectedFrameIndex}`
      : `/api/cases/${caseId}/evidence/${evidenceId}/heatmap`;
  const faceCropUrl = `/api/cases/${caseId}/evidence/${evidenceId}/face-crop`;

  async function handleReveal() {
    setRevealing(true);
    setRevealError("");
    const response = await fetch(`/api/cases/${caseId}/evidence/${evidenceId}/reveal`, { method: "POST" }).catch(
      () => null,
    );
    setRevealing(false);
    // Revealing without a confirmed audit entry would defeat the whole
    // point of gating sensitive content behind a logged action — only
    // un-blur once the server confirms the AuditLogEntry was written.
    if (!response || !response.ok) {
      setRevealError("Could not log this access — content stays hidden. Check your connection and try again.");
      return;
    }
    setRevealed(true);
  }

  async function handleExtractFrame() {
    const timestampSeconds = playerRef.current?.currentTime ?? 0;
    setExtractStatus("extracting");
    setExtractError("");
    const response = await fetch(`/api/cases/${caseId}/evidence/${evidenceId}/extract-frame`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ timestampSeconds }),
    }).catch(() => null);
    if (!response || !response.ok) {
      const body = await response?.json().catch(() => null);
      setExtractStatus("error");
      setExtractError(body?.error ?? "Could not extract this frame — check your connection and try again.");
      return;
    }
    setExtractStatus("idle");
    router.refresh();
  }

  async function handleGenerateCaptions() {
    setTranscriptStatus("loading");
    setTranscriptError("");
    const response = await fetch(`/api/cases/${caseId}/evidence/${evidenceId}/transcript`, {
      method: "POST",
    }).catch(() => null);
    if (!response || !response.ok) {
      const body = await response?.json().catch(() => null);
      setTranscriptStatus("error");
      setTranscriptError(body?.error ?? "Could not generate captions — check the ML service is running and try again.");
      return;
    }
    const data: CachedTranscript = await response.json();
    setTranscript(data);
    setTranscriptStatus("idle");
  }

  async function handleTranslate() {
    setTranslatingLang(translateTarget);
    setTranslateError("");
    const response = await fetch(`/api/cases/${caseId}/evidence/${evidenceId}/transcript/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetLang: translateTarget }),
    }).catch(() => null);
    setTranslatingLang(null);
    if (!response || !response.ok) {
      const body = await response?.json().catch(() => null);
      setTranslateError(body?.error ?? "Translation failed — check the ML service is running and try again.");
      return;
    }
    const data: { targetLang: string; segments: TranscriptSegment[] } = await response.json();
    setTranscript((prev) => {
      if (!prev) return prev;
      const withoutTarget = prev.translations.filter((t) => t.targetLang !== data.targetLang);
      return { ...prev, translations: [...withoutTarget, { targetLang: data.targetLang, segments: data.segments }] };
    });
  }

  async function handleValidateSpeech() {
    setValidatingSpeech(true);
    setValidateSpeechError("");
    const response = await fetch(`/api/cases/${caseId}/evidence/${evidenceId}/transcript/validate-speech`, {
      method: "POST",
    }).catch(() => null);
    setValidatingSpeech(false);
    if (!response || !response.ok) {
      const body = await response?.json().catch(() => null);
      setValidateSpeechError(body?.error ?? "Speech validation failed — check the ML service is running and try again.");
      return;
    }
    const data: { hasSpeech: boolean; speechRatio: number } = await response.json();
    setTranscript((prev) => (prev ? { ...prev, hasSpeech: data.hasSpeech, speechRatio: data.speechRatio } : prev));
  }

  async function handleDetectThreat() {
    setDetectingThreat(true);
    setDetectThreatError("");
    const response = await fetch(`/api/cases/${caseId}/evidence/${evidenceId}/threat-detection`, {
      method: "POST",
    }).catch(() => null);
    setDetectingThreat(false);
    if (!response || !response.ok) {
      const body = await response?.json().catch(() => null);
      setDetectThreatError(body?.error ?? "Threat detection failed — check the credentials are configured and try again.");
      return;
    }
    const data: CachedTranscript["threatAssessment"] = await response.json();
    setTranscript((prev) => (prev ? { ...prev, threatAssessment: data } : prev));
  }

  async function handleVerifyClaim() {
    setVerifyingClaim(true);
    setVerifyClaimError("");
    const response = await fetch(`/api/cases/${caseId}/evidence/${evidenceId}/verify-claim`, {
      method: "POST",
    }).catch(() => null);
    setVerifyingClaim(false);
    if (!response || !response.ok) {
      const body = await response?.json().catch(() => null);
      setVerifyClaimError(body?.error ?? "Claim verification failed — check the credentials are configured and try again.");
      return;
    }
    const data: CachedTranscript["claimVerification"] = await response.json();
    setTranscript((prev) => (prev ? { ...prev, claimVerification: data } : prev));
  }

  const isImage = mimeType.startsWith("image/");
  const isVideo = mimeType.startsWith("video/");
  const isAudio = mimeType.startsWith("audio/");
  const isPdf = mimeType === "application/pdf";
  const isText = mimeType === "text/plain";

  if (!isImage && !isVideo && !isAudio && !isPdf && !isText) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-border-subtle bg-surface-sunken text-xs text-text-tertiary">
        No inline preview for this file type — download from the evidence record.
      </div>
    );
  }

  // Real object-contain math: the media element fills the fixed-height
  // container while preserving aspect ratio, which usually means
  // letterboxing on one axis. A face box positioned with raw percentages
  // of the container would be wrong whenever that happens — this computes
  // the actual displayed content rect from the element's natural size vs
  // the container's, so every box lands exactly where MTCNN found that
  // face, not just "roughly in the container." One box per detected face,
  // not just the one the classifier happened to score.
  // The actual displayed content rect of the base (object-contain) image
  // within its fixed-size container — shared by face boxes below and the
  // heatmap overlay. Needed because the heatmap PNG the ML service returns
  // is always a fixed square (detector.py resizes to INPUT_SIZE x
  // INPUT_SIZE before scoring, regardless of the source image's real
  // aspect ratio) — sizing it with its own object-contain would letterbox
  // it independently of the base image, visibly shrinking it to a centered
  // square instead of covering the same region the classifier actually
  // scored. Stretching it to this exact rect is the correct inverse of
  // that same resize, not an approximation.
  const contentRect = (() => {
    if (!naturalSize || !containerWidth) return null;
    const cw = containerWidth;
    const ch = CONTAINER_HEIGHT;
    const scale = Math.min(cw / naturalSize.w, ch / naturalSize.h);
    const dw = naturalSize.w * scale;
    const dh = naturalSize.h * scale;
    return { dw, dh, offsetX: (cw - dw) / 2, offsetY: (ch - dh) / 2 };
  })();

  const boxStyles = (() => {
    if (!showFaceBox || faceBoxes.length === 0 || !contentRect) return [];
    const { dw, dh, offsetX, offsetY } = contentRect;
    return faceBoxes.map(([x1, y1, x2, y2]) => ({
      left: offsetX + x1 * dw,
      top: offsetY + y1 * dh,
      width: (x2 - x1) * dw,
      height: (y2 - y1) * dh,
    }));
  })();

  return (
    <div id={`ev-${evidenceId}-media`} className="flex scroll-mt-14 flex-col gap-2">
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-lg border border-border-subtle bg-surface-sunken"
      >
        {!revealed ? (
          <div className="flex h-[280px] flex-col items-center justify-center gap-3 bg-black/90 text-center">
            <EyeOff className="size-6 text-status-warning" />
            <p className="max-w-xs text-xs text-text-secondary">
              This evidence is flagged {sensitivityLevel === "ncii" ? "NCII" : "minor-sensitivity"}. Viewing it is
              logged to the audit trail.
            </p>
            <button
              type="button"
              onClick={handleReveal}
              disabled={revealing}
              className={cn(buttonVariants({ size: "sm" }), "bg-status-warning text-black hover:bg-status-warning/90")}
            >
              <Eye className="size-4" />
              {revealing ? "Logging access…" : "View sensitive content"}
            </button>
            {revealError && <p className="max-w-xs text-xs text-status-critical">{revealError}</p>}
          </div>
        ) : (
          <>
            {isImage && (
              // Served from an auth-gated API route, not a static asset next/image's optimizer can address.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={fileUrl}
                alt="Evidence"
                className="h-[280px] w-full bg-black object-contain"
                style={getFilterStyle(overlayMode)}
                // A ref callback fires on mount even if the image is
                // already `complete` (served from cache) by then — onLoad
                // alone misses that case, since the load event has already
                // fired before React attaches the listener. Found live: the
                // face box silently never appeared because naturalSize
                // stayed null whenever the image loaded from cache.
                ref={(el) => {
                  if (el && el.complete && el.naturalWidth > 0) {
                    setNaturalSizeIfChanged(el.naturalWidth, el.naturalHeight);
                  }
                }}
                onLoad={(e) => setNaturalSizeIfChanged(e.currentTarget.naturalWidth, e.currentTarget.naturalHeight)}
              />
            )}
            {isPdf && (
              // Same auth-gated file route as everything else here — it
              // already serves `Content-Disposition: inline`, so the
              // browser's own native PDF viewer renders it directly, no
              // separate PDF-rendering library needed.
              <iframe src={fileUrl} title="Evidence document" className="h-[280px] w-full bg-white" />
            )}
            {isText && (
              // Same auth-gated file route, serving the real
              // `text/plain` bytes with the right Content-Type — the
              // browser's own plain-text rendering shows the raw chat
              // export exactly as exported, not a paraphrase. The
              // structured participant/message-count/date-range summary
              // lives in ChatDetails (evidence-card.tsx) alongside this.
              <iframe src={fileUrl} title="Evidence text" className="h-[280px] w-full bg-white" />
            )}
            {isVideo && (
              // Real video player (Vidstack, not a bare native <video>) for
              // richer real controls — settings menu with playback speed,
              // proper fullscreen/PiP, keyboard shortcuts, buffering
              // indicator — on top of the exact same real file stream this
              // viewer always served. We still reach through to the actual
              // native <video> element it renders internally (via
              // `player.el`) for everything that needs direct element
              // access: frame-step, frame extraction, natural-size/duration
              // tracking, and feeding the real Web Audio analyser.
              <MediaPlayer
                ref={playerRef}
                // Explicit { src, type } rather than a bare URL string —
                // our file route (/api/.../file) has no extension for
                // Vidstack to infer a MIME type from, which without this
                // makes it fall back to a slower "fetch response headers
                // to sniff the type" path on every load (a real, visible
                // console warning caught live, not by inspection). We
                // already know the real type from the DB, so just pass it.
                src={{ src: fileUrl, type: mimeType as VideoMimeType }}
                playsInline
                loop
                // Unmuted by default so the investigator hears the actual
                // evidence audio without an extra click. Browsers block
                // autoplay-with-sound without a prior user gesture, so this
                // will just start paused (not silently muted-playing) until
                // the investigator presses play — Vidstack does not fall
                // back to a muted autoplay on its own.
                autoPlay
                className="h-[280px] w-full bg-black"
                style={getFilterStyle(overlayMode) as React.ComponentProps<typeof MediaPlayer>["style"]}
                onProviderChange={() => {
                  const el = playerRef.current?.el?.querySelector("video") as HTMLVideoElement | null;
                  if (!el) return;
                  setMediaEl(el);
                  const updateFromEl = () => {
                    if (el.videoWidth > 0) {
                      setNaturalSizeIfChanged(el.videoWidth, el.videoHeight);
                      setVideoDuration(el.duration);
                    }
                  };
                  // Same "already loaded before the listener attached" case
                  // documented below the image ref above — a native
                  // loadedmetadata listener attached after the fact misses
                  // an already-available video, which left videoDuration
                  // stuck at null and the frame timeline permanently
                  // hidden. Found live via a real screenshot, not by
                  // inspection.
                  if (el.readyState >= 1) updateFromEl();
                  el.addEventListener("loadedmetadata", updateFromEl);
                }}
              >
                <MediaProvider />
                <DefaultVideoLayout icons={defaultLayoutIcons} />
              </MediaPlayer>
            )}
            {isAudio && (
              // Same Vidstack player as the video branch above, not a bare
              // native <audio> — real scrubbing, volume/speed menu, and
              // keyboard shortcuts instead of the browser's minimal default
              // controls. Still exposes the underlying native <audio>
              // element via onProviderChange for the real Web Audio
              // analyser below, same pattern as the video branch.
              <MediaPlayer
                ref={playerRef}
                src={{ src: fileUrl, type: mimeType as AudioMimeType }}
                className="w-full bg-black"
                onProviderChange={() => {
                  const el = playerRef.current?.el?.querySelector("audio") as HTMLAudioElement | null;
                  if (el) setMediaEl(el);
                }}
              >
                <MediaProvider />
                <DefaultAudioLayout icons={defaultLayoutIcons} />
                <ActiveCaptionBridge onChange={setActiveCaptionText} />
              </MediaPlayer>
            )}
            {showHeatmap && (isImage || isVideo) && contentRect && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={heatmapUrl}
                alt="Manipulation heatmap"
                className="pointer-events-none absolute opacity-80 mix-blend-hard-light"
                style={{
                  left: contentRect.offsetX,
                  top: contentRect.offsetY,
                  width: contentRect.dw,
                  height: contentRect.dh,
                }}
              />
            )}
            {boxStyles.map((style, i) => (
              <div
                key={i}
                className="pointer-events-none absolute rounded border-2 border-status-critical shadow-[0_0_15px_rgba(255,0,0,0.5)]"
                style={style}
              >
                <span className="absolute -top-6 left-0 whitespace-nowrap rounded bg-status-critical px-1.5 py-0.5 font-mono text-[10px] font-medium text-white shadow-sm">
                  {i === 0 ? "Face 1 (scored)" : `Face ${i + 1}`}
                </span>
              </div>
            ))}
          </>
        )}
      </div>

      {revealed && isVideo && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-mono text-text-tertiary">Frame controls</span>
          <button
            type="button"
            onClick={() => {
              // Set on the player instance itself, not the raw DOM element
              // — Vidstack owns the media element and syncs its internal
              // state store from real events; writing straight to
              // `<video>.currentTime` behind its back didn't reliably
              // stick (found live: currentTime read back as unchanged
              // after the write). `player.currentTime` is Vidstack's own
              // real seek API and behaves correctly.
              const p = playerRef.current;
              if (p) p.currentTime = Math.max(0, p.currentTime - 1 / 30);
            }}
            className={buttonVariants({ variant: "outline", size: "xs" })}
          >
            −1 frame
          </button>
          <button
            type="button"
            onClick={() => {
              const p = playerRef.current;
              if (p) p.currentTime = p.currentTime + 1 / 30;
            }}
            className={buttonVariants({ variant: "outline", size: "xs" })}
          >
            +1 frame
          </button>
          <span className="text-text-tertiary">(playback speed is in the player&apos;s own settings menu)</span>
          <button
            type="button"
            onClick={handleExtractFrame}
            disabled={extractStatus === "extracting"}
            className={buttonVariants({ variant: "outline", size: "xs" })}
          >
            {extractStatus === "extracting" ? <Loader2 className="size-3.5 animate-spin" /> : <Camera className="size-3.5" />}
            Extract current frame as evidence
          </button>
          {extractStatus === "error" && (
            <span role="alert" className="flex items-center gap-1 text-status-critical">
              <AlertTriangle className="size-3.5 shrink-0" />
              {extractError}
            </span>
          )}
        </div>
      )}

      {revealed && isVideo && frameScores && frameScores.length > 0 && videoDuration && (
        <div className="flex flex-col gap-1">
          <p className="text-[10px] text-text-tertiary">
            Sampled frames analyzed ({frameScores.length}) — click to jump the player to that frame
            {hasFrameHeatmaps ? " and view its own heatmap" : ""}
          </p>
          <div className="relative h-8 rounded-md border border-border-subtle bg-surface-sunken">
            {frameScores.map((fs, i) => {
              const leftPct = videoDuration ? (fs.timestampSeconds / videoDuration) * 100 : 0;
              const isWorst = fs.probability === Math.max(...frameScores.map((f) => f.probability));
              const isSelected = hasFrameHeatmaps && selectedFrameIndex === i;
              return (
                <button
                  key={i}
                  type="button"
                  title={`${formatTimestamp(fs.timestampSeconds)} — ${fs.probability.toFixed(1)}% manipulation probability${fs.faceDetected ? "" : " (no face detected)"}${hasFrameHeatmaps ? " — click to view this frame's heatmap" : ""}`}
                  onClick={() => {
                    if (playerRef.current) playerRef.current.currentTime = fs.timestampSeconds;
                    if (hasFrameHeatmaps) {
                      setSelectedFrameIndex(i);
                      setOverlayMode("heatmap");
                    }
                  }}
                  className={cn(
                    "absolute top-0.5 flex w-3 -translate-x-1/2 flex-col items-center gap-0.5",
                    (isWorst || isSelected) && "z-10",
                  )}
                  style={{ left: `${leftPct}%` }}
                >
                  <span
                    className={cn(
                      "block w-1.5 rounded-full",
                      isWorst ? "bg-status-critical" : fs.probability >= 50 ? "bg-status-warning" : "bg-status-safe",
                      isSelected && "ring-2 ring-accent-primary",
                    )}
                    style={{ height: `${6 + (fs.probability / 100) * 20}px` }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

      <TabsList variant="line">
        <TabsTrigger value="media">Media</TabsTrigger>
        <TabsTrigger value="forensics">Forensics</TabsTrigger>
        <TabsTrigger value="analysis">Analysis</TabsTrigger>
        {hasCustodyContent && <TabsTrigger value="custody">Custody &amp; legal</TabsTrigger>}
      </TabsList>

      <TabsContent value="media" className="flex flex-col gap-2">
      {revealed && (isVideo || isAudio) && (
        <div id={`ev-${evidenceId}-captions`} className="flex scroll-mt-14 flex-wrap items-center gap-2 text-xs">
          <span className="flex items-center gap-1 font-mono text-text-tertiary">
            <Captions className="size-3.5" />
            Captions
          </span>
          {!transcript ? (
            <button
              type="button"
              onClick={handleGenerateCaptions}
              disabled={transcriptStatus === "loading"}
              className={buttonVariants({ variant: "outline", size: "xs" })}
            >
              {transcriptStatus === "loading" ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Captions className="size-3.5" />
              )}
              {transcriptStatus === "loading" ? "Transcribing…" : "Generate captions"}
            </button>
          ) : (
            <>
              <span className="text-text-tertiary">
                {languageLabel(transcript.language)} auto-detected
                {transcript.truncated ? " (long file — captions cover the first 10 min only)" : ""}
              </span>
              <button
                type="button"
                onClick={() => setShowScript((s) => !s)}
                className={buttonVariants({ variant: "outline", size: "xs" })}
              >
                <FileText className="size-3.5" />
                {showScript ? "Hide script" : "View script"}
              </button>
              <Languages className="size-3.5 text-text-tertiary" />
              <select
                value={translateTarget}
                onChange={(e) => setTranslateTarget(e.target.value)}
                className="rounded-md border border-border-subtle bg-surface px-1.5 py-1 text-text-primary"
              >
                {TRANSLATION_LANGUAGES.filter((l) => l.code !== transcript.language).map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleTranslate}
                disabled={translatingLang !== null}
                className={buttonVariants({ variant: "outline", size: "xs" })}
              >
                {translatingLang ? <Loader2 className="size-3.5 animate-spin" /> : null}
                {translatingLang
                  ? `Translating to ${languageLabel(translatingLang)}…`
                  : transcript.translations.some((t) => t.targetLang === translateTarget)
                    ? "Re-translate"
                    : "Translate captions"}
              </button>
              <span className="text-text-tertiary">
                (switch tracks from the player&apos;s own CC menu)
              </span>
              {transcript.hasSpeech === null ? (
                <button
                  type="button"
                  onClick={handleValidateSpeech}
                  disabled={validatingSpeech}
                  className={buttonVariants({ variant: "outline", size: "xs" })}
                >
                  {validatingSpeech ? <Loader2 className="size-3.5 animate-spin" /> : <Mic className="size-3.5" />}
                  {validatingSpeech ? "Checking for speech…" : "Validate speech"}
                </button>
              ) : transcript.hasSpeech ? (
                <span className="flex items-center gap-1 text-status-safe" title="Confirms the clip contains an audible voice — says nothing about whether what's said is true.">
                  <ShieldCheck className="size-3.5 shrink-0" />
                  Audio contains speech ({Math.round((transcript.speechRatio ?? 0) * 100)}% of clip) — captions
                  aren&apos;t a hallucination over silence/noise
                </span>
              ) : (
                <span className="flex items-center gap-1 text-status-critical">
                  <ShieldAlert className="size-3.5 shrink-0" />
                  No clear speech detected ({Math.round((transcript.speechRatio ?? 0) * 100)}% of clip) — captions
                  may be a hallucination, verify by ear
                </span>
              )}
              {!transcript.threatAssessment ? (
                <button
                  type="button"
                  onClick={handleDetectThreat}
                  disabled={detectingThreat}
                  className={buttonVariants({ variant: "outline", size: "xs" })}
                >
                  {detectingThreat ? <Loader2 className="size-3.5 animate-spin" /> : <Siren className="size-3.5" />}
                  {detectingThreat ? "Analyzing conversation…" : "Detect threat"}
                </button>
              ) : transcript.threatAssessment.containsThreat ? (
                <span className="flex items-center gap-1 text-status-critical" title={transcript.threatAssessment.reasoning ?? undefined}>
                  <ShieldAlert className="size-3.5 shrink-0" />
                  Possible threat ({transcript.threatAssessment.severity ?? "unspecified"} severity)
                  {transcript.threatAssessment.quote ? ` — "${transcript.threatAssessment.quote}"` : ""}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-status-safe">
                  <ShieldCheck className="size-3.5 shrink-0" />
                  No threat detected
                </span>
              )}
              {!transcript.claimVerification && (
                <button
                  type="button"
                  onClick={handleVerifyClaim}
                  disabled={verifyingClaim}
                  className={buttonVariants({ variant: "outline", size: "xs" })}
                  title="Real live web search — checks whether real news/fact-check sources confirm this was actually said, not just whether audio contains speech."
                >
                  {verifyingClaim ? <Loader2 className="size-3.5 animate-spin" /> : <Search className="size-3.5" />}
                  {verifyingClaim ? "Searching real sources…" : "Verify claim"}
                </button>
              )}
            </>
          )}
          {transcriptStatus === "error" && (
            <span role="alert" className="flex items-center gap-1 text-status-critical">
              <AlertTriangle className="size-3.5 shrink-0" />
              {transcriptError}
            </span>
          )}
          {translateError && (
            <span role="alert" className="flex items-center gap-1 text-status-critical">
              <AlertTriangle className="size-3.5 shrink-0" />
              {translateError}
            </span>
          )}
          {validateSpeechError && (
            <span role="alert" className="flex items-center gap-1 text-status-critical">
              <AlertTriangle className="size-3.5 shrink-0" />
              {validateSpeechError}
            </span>
          )}
          {detectThreatError && (
            <span role="alert" className="flex items-center gap-1 text-status-critical">
              <AlertTriangle className="size-3.5 shrink-0" />
              {detectThreatError}
            </span>
          )}
          {verifyClaimError && (
            <span role="alert" className="flex items-center gap-1 text-status-critical">
              <AlertTriangle className="size-3.5 shrink-0" />
              {verifyClaimError}
            </span>
          )}
        </div>
      )}

      {revealed && transcript?.claimVerification && (
        <div
          className={cn(
            "flex flex-col gap-1.5 rounded-md border p-2.5 text-xs",
            transcript.claimVerification.verdict === "debunked"
              ? "border-status-critical/30 bg-status-critical-bg"
              : transcript.claimVerification.verdict === "confirmed"
                ? "border-status-safe/30 bg-status-safe-bg"
                : "border-border-subtle bg-surface-sunken",
          )}
        >
          <p
            className={cn(
              "flex items-center gap-1.5 font-medium",
              transcript.claimVerification.verdict === "debunked"
                ? "text-status-critical"
                : transcript.claimVerification.verdict === "confirmed"
                  ? "text-status-safe"
                  : "text-text-secondary",
            )}
          >
            {transcript.claimVerification.verdict === "debunked" ? (
              <XCircle className="size-3.5 shrink-0" />
            ) : transcript.claimVerification.verdict === "confirmed" ? (
              <ShieldCheck className="size-3.5 shrink-0" />
            ) : (
              <HelpCircle className="size-3.5 shrink-0" />
            )}
            Claim verification —{" "}
            {transcript.claimVerification.verdict === "debunked"
              ? "debunked by real sources"
              : transcript.claimVerification.verdict === "confirmed"
                ? "confirmed by real sources"
                : "no clear coverage found"}
          </p>
          <p className="text-text-secondary">{transcript.claimVerification.summary}</p>
          {transcript.claimVerification.citations.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {transcript.claimVerification.citations.slice(0, 8).map((c, i) => (
                <a
                  key={i}
                  href={c.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center gap-1 rounded-full border border-border-subtle bg-surface px-2 py-0.5 text-[10px] text-accent-primary hover:underline"
                  title={c.title}
                >
                  <ExternalLink className="size-3 shrink-0" />
                  {c.domain || c.title}
                </a>
              ))}
            </div>
          )}
          <p className="text-[10px] text-text-tertiary">
            Real live web search grounding, not the model&apos;s own training knowledge — sources shown are what
            it actually found. Still an AI-produced summary of that research, not a verified legal finding.
          </p>
        </div>
      )}

      {revealed && showScript && transcript && (
        <div className="flex flex-col gap-1.5 rounded-md border border-border-subtle bg-surface-sunken p-2.5 text-xs">
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium text-text-secondary">Full transcript</p>
            {transcript.translations.length > 0 && (
              <select
                value={scriptLang ?? transcript.language}
                onChange={(e) => setScriptLang(e.target.value === transcript.language ? null : e.target.value)}
                className="rounded-md border border-border-subtle bg-surface px-1.5 py-1 text-text-primary"
              >
                <option value={transcript.language}>{languageLabel(transcript.language)} (original)</option>
                {transcript.translations.map((t) => (
                  <option key={t.targetLang} value={t.targetLang}>
                    {languageLabel(t.targetLang)} (translated)
                  </option>
                ))}
              </select>
            )}
          </div>
          {(() => {
            const activeSegments =
              scriptLang && scriptLang !== transcript.language
                ? (transcript.translations.find((t) => t.targetLang === scriptLang)?.segments ?? transcript.segments)
                : transcript.segments;
            if (activeSegments.length === 0) {
              return <p className="text-text-tertiary">No transcript text available.</p>;
            }
            return (
              <ol className="flex max-h-64 flex-col gap-1 overflow-y-auto">
                {activeSegments.map((seg, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => {
                        if (playerRef.current) playerRef.current.currentTime = seg.start;
                      }}
                      className="flex w-full gap-2 rounded-md px-1.5 py-1 text-left hover:bg-surface"
                    >
                      <span className="shrink-0 font-mono text-[10px] text-text-tertiary">
                        {formatTimestamp(seg.start)}
                      </span>
                      <span className="text-text-primary">{seg.text}</span>
                    </button>
                  </li>
                ))}
              </ol>
            );
          })()}
        </div>
      )}

      {revealed && isAudio && activeCaptionText && (
        <div className="rounded-md border border-border-subtle bg-surface-sunken px-3 py-2 text-center text-sm text-text-primary">
          {activeCaptionText}
        </div>
      )}
      </TabsContent>

      <TabsContent value="forensics" className="flex flex-col gap-3">
      {revealed && (isVideo || isAudio) && <AudioAnalyser mediaEl={mediaEl} />}

      {revealed && (isVideo || isAudio) && (
        <div id={`ev-${evidenceId}-splice`} className="scroll-mt-14">
          <SpliceDetectionPanel
            key={cachedSpliceDetection?.ranAt ?? "none"}
            caseId={caseId}
            evidenceId={evidenceId}
            cached={cachedSpliceDetection}
            onSeek={(seconds) => {
              if (playerRef.current) playerRef.current.currentTime = seconds;
            }}
          />
        </div>
      )}

      {revealed && (isImage || isVideo) && (
        <div className="flex flex-col gap-2">
          <p className="flex items-center gap-2 text-sm text-text-secondary">
            <ScanFace className="size-4" />
            Live Forensic Feeds
          </p>
          <div className="grid grid-cols-4 gap-2">
            <OverlayTile
              label="Original"
              baseMediaUrl={fileUrl}
              isVideo={isVideo}
              videoRef={(el) => { relayVideoRefs.current[0] = el; }}
              active={overlayMode === "none"}
              onClick={() => setOverlayMode("none")}
            />
            <OverlayTile
              label={hasHeatmap ? "Heatmap" : "Heatmap (pending)"}
              baseMediaUrl={fileUrl}
              isVideo={isVideo}
              videoRef={(el) => { relayVideoRefs.current[1] = el; }}
              overlayUrl={hasHeatmap ? heatmapUrl : undefined}
              active={overlayMode === "heatmap"}
              disabled={!hasHeatmap}
              onClick={() => setOverlayMode("heatmap")}
            />
            <OverlayTile
              label="ELA"
              baseMediaUrl={fileUrl}
              isVideo={isVideo}
              videoRef={(el) => { relayVideoRefs.current[2] = el; }}
              filterStyle={getFilterStyle("negative")}
              active={overlayMode === "negative"}
              onClick={() => setOverlayMode("negative")}
            />
            <OverlayTile
              label="Edge Det."
              baseMediaUrl={fileUrl}
              isVideo={isVideo}
              videoRef={(el) => { relayVideoRefs.current[3] = el; }}
              filterStyle={getFilterStyle("edge")}
              active={overlayMode === "edge"}
              onClick={() => setOverlayMode("edge")}
            />
          </div>
          <p className="text-[10px] text-text-tertiary">
            Heatmap is a real Grad-CAM model output. ELA/Edge Detection are plain visual filters for manual
            inspection, not a forensic ML technique — don&apos;t read them as a model finding.
          </p>
          <button
            type="button"
            onClick={() => setShowFaceBox((v) => !v)}
            disabled={faceBoxes.length === 0}
            className={cn(buttonVariants({ variant: showFaceBox ? "default" : "outline", size: "sm" }), "w-fit")}
          >
            <ScanFace className="size-3.5" />
            {faceBoxes.length === 0
              ? "No face detected"
              : showFaceBox
                ? `Hide face detection (${faceBoxes.length})`
                : `Show face detection (${faceBoxes.length})`}
          </button>
        </div>
      )}

      {revealed && faceCropCount > 0 && (
        <div className="flex flex-col gap-2 rounded-md border border-border-subtle bg-surface p-2">
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: faceCropCount }, (_, i) => {
              const label = faceAnnotations.get(i)?.label;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedFaceIndex(i)}
                  className="flex flex-col items-center gap-1 rounded-md p-0.5 transition-colors hover:bg-surface-sunken"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${faceCropUrl}?index=${i}`}
                    alt={i === 0 ? "Face 1 — the actual image fed to the classifier" : `Face ${i + 1}`}
                    className="size-16 shrink-0 rounded border border-border-subtle bg-black object-cover"
                  />
                  <span className="max-w-16 truncate text-[9px] text-text-tertiary">
                    {label || (i === 0 ? "Face 1 (scored)" : `Face ${i + 1}`)}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-text-tertiary">
            Face 1 is the actual aligned crop the classifier scored. Click any face to label it or run a per-face
            search.
            {faceCropCount > 1 &&
              ` The other ${faceCropCount - 1} face(s) were detected but not separately classified — the model only scores one face per image.`}
          </p>
        </div>
      )}
      </TabsContent>

      {selectedFaceIndex !== null && (
        <FaceDetailDialog
          caseId={caseId}
          evidenceId={evidenceId}
          faceIndex={selectedFaceIndex}
          isScored={selectedFaceIndex === 0}
          open={selectedFaceIndex !== null}
          onOpenChange={(next) => {
            if (!next) setSelectedFaceIndex(null);
          }}
          sensitivityLevel={sensitivityLevel}
          annotation={
            faceAnnotations.get(selectedFaceIndex) ?? { label: null, reverseSearch: null, description: null }
          }
        />
      )}
    </div>
  );
}

/**
 * One tile in the "Forensic view" grid — visually replaces the old mock's
 * "Live Forensic Feeds" tile grid (Original / Heatmap / ELA / Edge
 * Detection), but every tile here is backed by a real output or shows
 * nothing at all rather than a fabricated preview. The old mock's ELA and
 * Edge Detection tiles had no real technique behind them (plain CSS
 * filters) and aren't reproduced here.
 */
function OverlayTile({
  label,
  baseMediaUrl,
  isVideo,
  videoRef,
  overlayUrl,
  filterStyle,
  active,
  disabled,
  onClick,
}: {
  label: string;
  /** The real underlying evidence file — every tile shows the actual
   * footage/frame, not an isolated derivative floating on black, matching
   * the old mock's visual (each tile was the real scene with a different
   * real effect on top of it). */
  baseMediaUrl: string;
  isVideo: boolean;
  /** Registers this tile's own <video> into the parent's relay array so it
   * plays/pauses/seeks in lockstep with the main player — a live preview,
   * not a static first frame, matching the old mock's `relayVideoRefs`. */
  videoRef?: (el: HTMLVideoElement | null) => void;
  /** Real derivative (Grad-CAM heatmap) composited on top of the base
   * media at reduced opacity — never shown alone. */
  overlayUrl?: string;
  /** Plain CSS filter (ELA/Edge Detection) — mutually exclusive with
   * `overlayUrl` in practice, matching the mock's own `mode.id ===
   * "heatmap" ? {} : getFilterStyle(mode.id)` split. */
  filterStyle?: React.CSSProperties;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative flex flex-col items-center gap-1 overflow-hidden rounded-md border p-1 transition-all",
        active ? "border-accent-primary bg-accent-dim" : "border-border-subtle bg-surface hover:bg-surface-hover",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded bg-black">
        {isVideo ? (
          <video
            ref={videoRef}
            src={baseMediaUrl}
            muted
            playsInline
            className="size-full object-cover"
            style={filterStyle}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={baseMediaUrl} alt={label} className="size-full object-cover" style={filterStyle} />
        )}
        {overlayUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={overlayUrl}
            alt=""
            className="pointer-events-none absolute inset-0 size-full object-cover opacity-80 mix-blend-hard-light"
          />
        )}
      </div>
      <span className="text-[10px] font-medium text-text-secondary">{label}</span>
    </button>
  );
}
