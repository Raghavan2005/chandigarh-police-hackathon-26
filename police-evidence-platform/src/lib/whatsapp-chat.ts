/**
 * Real parser for WhatsApp's own "Export chat" .txt format — not a generic
 * text-file heuristic. WhatsApp writes one of two well-known line formats
 * depending on the exporting phone's OS:
 *
 *   iOS:     [DD/MM/YY, HH:MM:SS] Sender Name: message text
 *   Android: DD/MM/YYYY, HH:MM - Sender Name: message text  (or "H:MM am/pm")
 *
 * A message with embedded newlines continues on following lines that don't
 * themselves start with a new timestamp — those get appended to the
 * previous message rather than treated as new ones, the same way a real
 * chat client would render them. System notices (join/leave, "Messages are
 * end-to-end encrypted...") have a timestamp but no "Sender:" prefix — kept
 * as messages with `sender: null`, not silently dropped or misattributed.
 *
 * Honesty note on dates: WhatsApp's own export doesn't include a locale
 * marker, so "DD/MM" vs "MM/DD" is genuinely ambiguous from the file alone.
 * This assumes DD/MM/YY(YY) — WhatsApp's default for every locale except
 * the US, and the standard for India — documented here rather than
 * silently guessed. A date with a first component >12 disambiguates itself
 * either way and parses correctly regardless of which assumption is right.
 */

export interface WhatsAppMessage {
  timestamp: Date | null;
  /** null for a system notice line (encryption notice, member added/left,
   * etc.) — a real distinction, never fabricated as if some person sent it. */
  sender: string | null;
  text: string;
  /** WhatsApp's own placeholder text for an omitted attachment — the real
   * file was never in the export, so there is nothing to analyze for it
   * beyond knowing a media message occurred here. */
  isMediaOmitted: boolean;
}

export interface ParsedWhatsAppChat {
  messages: WhatsAppMessage[];
  /** Distinct senders, in first-appearance order — excludes system notices. */
  participants: string[];
  dateRangeStart: Date | null;
  dateRangeEnd: Date | null;
  mediaOmittedCount: number;
}

const MEDIA_OMITTED_PATTERNS = [
  /<media omitted>/i,
  /image omitted/i,
  /video omitted/i,
  /audio omitted/i,
  /document omitted/i,
  /sticker omitted/i,
  /gif omitted/i,
];

// iOS: [DD/MM/YY(YY), HH:MM:SS] Sender: message   (Sender/message optional -> system notice)
const IOS_LINE = /^\[(\d{1,2})\/(\d{1,2})\/(\d{2,4}),\s*(\d{1,2}):(\d{2})(?::(\d{2}))?\]\s*(?:([^:]+?):\s)?(.*)$/;
// Android: DD/MM/YYYY, HH:MM(am/pm)? - Sender: message
const ANDROID_LINE =
  /^(\d{1,2})\/(\d{1,2})\/(\d{2,4}),\s*(\d{1,2}):(\d{2})\s*([ap]\.?m\.?)?\s*-\s*(?:([^:]+?):\s)?(.*)$/i;

function buildDate(day: string, month: string, year: string, hour: string, minute: string, second: string, meridiem?: string): Date | null {
  let h = parseInt(hour, 10);
  const m = parseInt(minute, 10);
  const s = second ? parseInt(second, 10) : 0;
  if (meridiem) {
    const isPm = meridiem.toLowerCase().startsWith("p");
    if (isPm && h < 12) h += 12;
    if (!isPm && h === 12) h = 0;
  }
  let yearNum = parseInt(year, 10);
  if (yearNum < 100) yearNum += 2000;
  // First component >12 can only be a day, not a month (DD/MM assumption
  // confirmed); otherwise DD/MM is used as documented above.
  const dayNum = parseInt(day, 10);
  const monthNum = parseInt(month, 10);
  const date = new Date(yearNum, monthNum - 1, dayNum, h, m, s);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isMediaOmitted(text: string): boolean {
  return MEDIA_OMITTED_PATTERNS.some((p) => p.test(text));
}

/**
 * Parses a real WhatsApp "Export chat" .txt file. Returns null when fewer
 * than 2 lines actually match the known export format — an honest signal
 * this isn't a recognizable WhatsApp export (a different app's export, or
 * plain unrelated text), so callers fall back to treating it as generic
 * text rather than fabricating chat structure that isn't there.
 */
export function parseWhatsAppChat(rawText: string): ParsedWhatsAppChat | null {
  // WhatsApp exports sometimes start each line with a U+200E (left-to-right
  // mark) invisible character — stripped before matching, never treated as
  // meaningful content.
  const lines = rawText.split(/\r?\n/).map((l) => l.replace(/‎/g, ""));

  const messages: WhatsAppMessage[] = [];
  let matchedLineCount = 0;

  for (const line of lines) {
    const iosMatch = line.match(IOS_LINE);
    const androidMatch = !iosMatch ? line.match(ANDROID_LINE) : null;
    const match = iosMatch ?? androidMatch;

    if (match) {
      matchedLineCount++;
      const [, day, month, year, hour, minute, secondOrMeridiem, senderOrText, maybeText] = match;
      const isIos = Boolean(iosMatch);
      const second = isIos ? secondOrMeridiem : undefined;
      const meridiem = isIos ? undefined : secondOrMeridiem;
      const timestamp = buildDate(day, month, year, hour, minute, second ?? "0", meridiem);
      const sender = senderOrText && maybeText !== undefined ? senderOrText.trim() : null;
      const text = (maybeText !== undefined ? maybeText : senderOrText ?? "").trim();
      messages.push({ timestamp, sender, text, isMediaOmitted: isMediaOmitted(text) });
    } else if (messages.length > 0 && line.trim()) {
      // Continuation of the previous message's multi-line text.
      const prev = messages[messages.length - 1];
      prev.text = prev.text ? `${prev.text}\n${line.trim()}` : line.trim();
      if (isMediaOmitted(prev.text)) prev.isMediaOmitted = true;
    }
  }

  // Fewer than 2 real matched export lines: not confidently a WhatsApp
  // export (could be one coincidental line in an unrelated file) — refuse
  // to claim chat structure rather than guess.
  if (matchedLineCount < 2) return null;

  const participants: string[] = [];
  for (const m of messages) {
    if (m.sender && !participants.includes(m.sender)) participants.push(m.sender);
  }

  const timestamps = messages.map((m) => m.timestamp).filter((t): t is Date => t !== null);
  const dateRangeStart = timestamps.length ? new Date(Math.min(...timestamps.map((t) => t.getTime()))) : null;
  const dateRangeEnd = timestamps.length ? new Date(Math.max(...timestamps.map((t) => t.getTime()))) : null;
  const mediaOmittedCount = messages.filter((m) => m.isMediaOmitted).length;

  return { messages, participants, dateRangeStart, dateRangeEnd, mediaOmittedCount };
}

/** Real, readable "Sender: message" transcript text for AI analysis (threat
 * detection, summarization) and the mind-map's text aggregation — the same
 * real content an investigator reading the raw export would see, not a
 * fabricated paraphrase. Caps length the same way PDF text extraction
 * already does, to bound what leaves the platform on any one AI call.
 *
 * System notices (sender === null — WhatsApp's own "Messages are end-to-end
 * encrypted..." boilerplate, join/leave notices) are deliberately excluded
 * here, not just cosmetically hidden — this text is what every downstream
 * AI call (document summary, threat detection, mind-map entity extraction)
 * actually reads. Leaving WhatsApp's own disclaimer text in caused a real,
 * observed bug: the mind-map's entity extractor read "...not even WhatsApp,
 * can read or listen to them" and extracted "WhatsApp" as an Organization
 * entity in the case graph — the app's own boilerplate masquerading as case
 * content. The raw export (with system notices intact) is still viewable
 * in full via the evidence file's own inline preview, so nothing is lost —
 * only kept out of the text that AI and search treat as this chat's actual
 * content. */
export function chatToPlainText(chat: ParsedWhatsAppChat, maxChars = 4000): string {
  const lines = chat.messages
    .filter((m) => m.sender !== null && !m.isMediaOmitted && m.text)
    .map((m) => `${m.sender}: ${m.text}`);
  const joined = lines.join("\n");
  return joined.length > maxChars ? `${joined.slice(0, maxChars)}…` : joined;
}

export interface ParticipantStat {
  name: string;
  messageCount: number;
  firstTimestamp: string | null;
  lastTimestamp: string | null;
}

export interface TurnTakingEdge {
  from: string;
  to: string;
  count: number;
}

/**
 * Real, per-participant message counts and first/last-seen timestamps —
 * computed directly from the parsed export, not inferred. This is what lets
 * the mind-map show "who else was in this group chat" as a structural,
 * always-correct fact instead of leaving it to the AI-inferred layer (which
 * can only ever notice a participant if their name happens to come up in
 * the free-text entity-extraction prompt).
 */
export function computeParticipantStats(chat: ParsedWhatsAppChat): ParticipantStat[] {
  const byName = new Map<string, { count: number; first: number; last: number }>();
  for (const m of chat.messages) {
    if (m.sender === null) continue; // system notices aren't a participant's message
    const ts = m.timestamp?.getTime() ?? null;
    const existing = byName.get(m.sender);
    if (existing) {
      existing.count += 1;
      if (ts !== null) {
        existing.first = Math.min(existing.first, ts);
        existing.last = Math.max(existing.last, ts);
      }
    } else {
      byName.set(m.sender, { count: 1, first: ts ?? Infinity, last: ts ?? -Infinity });
    }
  }
  return chat.participants.map((name) => {
    const s = byName.get(name)!;
    return {
      name,
      messageCount: s.count,
      firstTimestamp: Number.isFinite(s.first) ? new Date(s.first).toISOString() : null,
      lastTimestamp: Number.isFinite(s.last) ? new Date(s.last).toISOString() : null,
    };
  });
}

/**
 * Real conversational turn-taking, computed from message order alone: every
 * time participant B's message immediately follows participant A's (in
 * chronological export order), that's one real, observable turn A→B.
 *
 * This is deliberately NOT presented as "A replied to B" — a flat WhatsApp
 * export carries no reply-to metadata, so which message someone was
 * actually responding to is genuinely unknowable from this file alone (see
 * whatsapp-chat.ts's own module doc). "Turn-taking" is the honest, weaker
 * claim that's actually supported by the data: two people's messages were
 * adjacent in the timeline, that many times. System notices are excluded
 * (they aren't a participant's turn), and a run of consecutive messages
 * from the same sender doesn't count as a turn against themselves.
 */
export function computeTurnTaking(chat: ParsedWhatsAppChat): TurnTakingEdge[] {
  // Keyed on JSON.stringify([from, to]) rather than a joined string — real
  // participant names routinely contain spaces themselves (e.g. "Ravi
  // Malhotra"), so any single-character join would be ambiguous to split
  // back into exactly two names.
  const counts = new Map<string, { from: string; to: string; count: number }>();
  let prevSender: string | null = null;
  for (const m of chat.messages) {
    if (m.sender === null) continue;
    if (prevSender !== null && prevSender !== m.sender) {
      const key = JSON.stringify([prevSender, m.sender]);
      const existing = counts.get(key);
      if (existing) existing.count += 1;
      else counts.set(key, { from: prevSender, to: m.sender, count: 1 });
    }
    prevSender = m.sender;
  }
  return [...counts.values()].sort((a, b) => b.count - a.count);
}
