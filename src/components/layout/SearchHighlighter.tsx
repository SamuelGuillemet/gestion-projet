import { useEffect } from "react";
import { useGlobalSearchState } from "./global-search-state";

const HIGHLIGHT_NAME = "search-match";
const HIGHLIGHT_DURATION_MS = 10_000;
const SKIPPED_TAGS = new Set(["SCRIPT", "STYLE", "TEXTAREA", "INPUT", "NOSCRIPT"]);

function foldChar(char: string) {
  return char
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// Folding keeps a per-char index map so matches map back to original offsets.
function findRangesInNode(node: Text, needle: string, ranges: Range[]) {
  const text = node.data;
  let folded = "";
  const indexMap: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const piece = foldChar(text[i]);
    for (let j = 0; j < piece.length; j++) indexMap.push(i);
    folded += piece;
  }

  let from = 0;
  for (;;) {
    const at = folded.indexOf(needle, from);
    if (at < 0) return;
    const range = new Range();
    range.setStart(node, indexMap[at]);
    range.setEnd(node, indexMap[at + needle.length - 1] + 1);
    ranges.push(range);
    from = at + needle.length;
  }
}

function findRanges(needle: string) {
  const ranges: Range[] = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      const parent = node.parentElement;
      if (!parent || SKIPPED_TAGS.has(parent.tagName) || parent.closest("[role=dialog]")) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    findRangesInNode(node as Text, needle, ranges);
  }
  return ranges;
}

export function SearchHighlighter() {
  const query = useGlobalSearchState((s) => s.pageHighlightQuery);
  const setQuery = useGlobalSearchState((s) => s.setPageHighlightQuery);

  useEffect(() => {
    if (!query || typeof CSS === "undefined" || !("highlights" in CSS)) return;
    const needle = query
      .split("")
      .map((c) => foldChar(c))
      .join("")
      .trim();
    if (!needle) return;

    let scrolled = false;
    let frame = 0;

    const apply = () => {
      frame = 0;
      const ranges = findRanges(needle);
      if (ranges.length === 0) {
        CSS.highlights.delete(HIGHLIGHT_NAME);
        return;
      }
      CSS.highlights.set(HIGHLIGHT_NAME, new Highlight(...ranges));
      if (!scrolled) {
        scrolled = true;
        ranges[0].startContainer.parentElement?.scrollIntoView({ block: "center" });
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };

    // The target page renders asynchronously, so re-scan on DOM changes.
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    schedule();

    const dismiss = () => setQuery(null);
    const timeout = window.setTimeout(dismiss, HIGHLIGHT_DURATION_MS);
    window.addEventListener("pointerdown", dismiss, true);
    window.addEventListener("keydown", dismiss, true);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
      window.removeEventListener("pointerdown", dismiss, true);
      window.removeEventListener("keydown", dismiss, true);
      CSS.highlights.delete(HIGHLIGHT_NAME);
    };
  }, [query, setQuery]);

  return null;
}
