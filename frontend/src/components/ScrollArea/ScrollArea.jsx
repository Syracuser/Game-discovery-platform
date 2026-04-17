import { useRef, useEffect, useLayoutEffect, useState, useCallback } from "react";
import "./ScrollArea.css";

/**
 * ScrollArea
 *
 * Hides the native scrollbar and replaces it with a custom track + thumb.
 * The thumb syncs with scroll position and is also draggable.
 *
 * Props:
 *   children         — content to scroll
 *   maxHeight        — e.g. "250px" — for filter section lists
 *   height           — e.g. "100%" — for the sidebar (fill parent)
 *   className        — applied to the outer wrapper div
 *   contentClassName — applied to the inner scrollable div (for layout styles)
 */
function ScrollArea({ children, maxHeight, height, className = "", contentClassName = "" }) {

  const contentRef = useRef(null);
  const thumbRef   = useRef(null);   // direct DOM ref — thumb position never goes through React state
  const isDragging = useRef(false);  // prevents scroll event from fighting the drag handler

  const [isScrollable, setIsScrollable] = useState(false);


  // ── Thumb position ─────────────────────────────────────────────────────────
  // Directly mutates the thumb's DOM style.
  // This is intentionally bypassing React state so that every scroll event and
  // every drag frame updates the thumb instantly with zero re-render overhead.

  const updateThumb = useCallback(() => {
    const el    = contentRef.current;
    const thumb = thumbRef.current;
    if (!el || !thumb) return;

    const { scrollHeight, clientHeight, scrollTop } = el;

    // Height: what fraction of the total content is visible right now?
    const thumbHeight  = Math.max((clientHeight / scrollHeight) * clientHeight, 20);

    // Top: how far along the scrollable range are we?
    const maxScrollTop = scrollHeight - clientHeight;
    const maxThumbTop  = clientHeight - thumbHeight;
    const thumbTop     = maxScrollTop > 0 ? (scrollTop / maxScrollTop) * maxThumbTop : 0;

    thumb.style.height    = `${thumbHeight}px`;
    thumb.style.transform = `translateY(${thumbTop}px)`;
  }, []);


  // ── Show/hide the scrollbar ────────────────────────────────────────────────
  // +2 tolerance absorbs subpixel rounding differences so the bar doesn't
  // appear when content and container are the same "real" height.

  const recalculate = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;

    const scrollable = el.scrollHeight > el.clientHeight + 2;
    setIsScrollable(scrollable);
    if (scrollable) updateThumb();
  }, [updateThumb]);


  // ── After thumb first renders, position it immediately ────────────────────
  // useLayoutEffect runs synchronously after the DOM is updated but BEFORE
  // the browser paints — so the thumb is in the right spot on the first frame.

  useLayoutEffect(() => {
    if (isScrollable) updateThumb();
  }, [isScrollable, updateThumb]);


  // ── Wire up scroll + resize listeners ────────────────────────────────────

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const onScroll = () => {
      // Skip during drag — the drag handler calls updateThumb directly
      if (!isDragging.current) updateThumb();
    };

    el.addEventListener("scroll", onScroll);

    // Watch the content element AND each direct child.
    // Direct children must be watched because when they collapse (e.g. a
    // filter section closing), the content div's own size may not change
    // (it has a fixed height), but the scrollable range has shrunk.
    const observer = new ResizeObserver(recalculate);
    observer.observe(el);
    Array.from(el.children).forEach(child => observer.observe(child));

    // Delay the first recalculate by one animation frame.
    // Without this, it runs before the browser has resolved "height: 100%"
    // on the content div, which causes a false positive (shows bar when not needed).
    const frameId = requestAnimationFrame(recalculate);

    return () => {
      cancelAnimationFrame(frameId);
      el.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, [recalculate, updateThumb]);


  // ── Thumb drag ─────────────────────────────────────────────────────────────
  // On mousedown: capture the starting scroll position and mouse Y.
  // On mousemove: convert the pixel delta into a scroll delta using the
  //               same thumb-to-track ratio as recalculate uses.
  // On mouseup: clean up.

  const handleThumbMouseDown = useCallback((e) => {
    e.preventDefault();
    const el = contentRef.current;
    if (!el) return;

    isDragging.current = true;
    document.body.style.cursor     = "grabbing";
    document.body.style.userSelect = "none";

    const startY         = e.clientY;
    const startScrollTop = el.scrollTop;
    const { scrollHeight, clientHeight } = el;

    const thumbHeight  = Math.max((clientHeight / scrollHeight) * clientHeight, 20);
    const maxScrollTop = scrollHeight - clientHeight;
    const maxThumbTop  = clientHeight - thumbHeight;

    const onMouseMove = (moveEvent) => {
      if (maxThumbTop === 0) return;
      const scrollDelta = ((moveEvent.clientY - startY) / maxThumbTop) * maxScrollTop;
      el.scrollTop = Math.max(0, Math.min(maxScrollTop, startScrollTop + scrollDelta));
      updateThumb(); // update thumb directly — no React state, no flicker
    };

    const onMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor     = "";
      document.body.style.userSelect = "";
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup",   onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup",   onMouseUp);
  }, [updateThumb]);


  // ── Styles ─────────────────────────────────────────────────────────────────

  const wrapperStyle = {};
  if (maxHeight) wrapperStyle.maxHeight = maxHeight;
  if (height)    wrapperStyle.height    = height;


  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className={`scroll-area ${className}`} style={wrapperStyle}>

      <div
        className={`scroll-area__content ${contentClassName}`}
        style={{ ...wrapperStyle }}
        ref={contentRef}
      >
        {children}
      </div>

      {isScrollable && (
        <div className="scroll-area__track">
          <div
            className="scroll-area__thumb"
            ref={thumbRef}
            onMouseDown={handleThumbMouseDown}
          />
        </div>
      )}

    </div>
  );
}

export default ScrollArea;
