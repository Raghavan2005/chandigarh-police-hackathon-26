import "server-only";
import { existsSync } from "fs";
import puppeteer from "puppeteer-core";

const CANDIDATE_CHROME_PATHS = [
  process.env.CHROME_EXECUTABLE_PATH,
  "/usr/bin/google-chrome-stable",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium-browser",
  "/usr/bin/chromium",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
].filter((p): p is string => Boolean(p));

function findChromeExecutable(): string {
  const found = CANDIDATE_CHROME_PATHS.find((p) => existsSync(p));
  if (!found) {
    throw new Error(
      "No Chrome/Chromium executable found for PDF export. Set CHROME_EXECUTABLE_PATH, or install " +
        "google-chrome-stable/chromium. Checked: " + CANDIDATE_CHROME_PATHS.join(", "),
    );
  }
  return found;
}

/**
 * Renders an already-authenticated, already-rendered app page to PDF by
 * launching a real headless Chrome and navigating to it — reuses the exact
 * same React/Tailwind report markup and print CSS (`print:hidden` etc.,
 * already on RealReportPreview) that a human printing via their own
 * browser would see, instead of re-building the certificate layout a
 * second time in a separate PDF-generation code path that could drift out
 * of sync with the on-screen report.
 *
 * `puppeteer-core` (not `puppeteer`) deliberately, to avoid a ~200MB
 * bundled-Chromium download — this machine already has Google Chrome
 * installed, so point at it directly instead (PS4_MVP_BUILD_PLAN.md's
 * "Puppeteer PDF render quality" Phase 3 item, sized for a hackathon
 * laptop, not a serverless deploy).
 */
export async function renderPageToPdf(url: string, cookieHeader: string | null): Promise<Buffer> {
  const executablePath = findChromeExecutable();
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    if (cookieHeader) {
      // Carries the caller's real session cookie through so the headless
      // page loads authenticated, real data — not a public/unauthenticated
      // render of a page that normally requires login.
      await page.setExtraHTTPHeaders({ Cookie: cookieHeader });
    }
    await page.goto(url, { waitUntil: "networkidle0" });
    await page.emulateMediaType("print");
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "12mm", bottom: "12mm", left: "10mm", right: "10mm" },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
