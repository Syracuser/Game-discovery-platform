import { useRef, useEffect, useState, useCallback } from "react";
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
  const [thumb, setThumb]           = useState({ height: 20, top: 0 });
  const [isScrollable, setIsScrollable] = useState(false);


  // ── Recalculate thumb size + position ──────────────────────────────────────
  // Called on scroll, on mount, and whenever children change size.

  const recalculate = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;

    const { scrollHeight, clientHeight, scrollTop } = el;
    const scrollable = scrollHeight > clientHeight;
    setIsScrollable(scrollable);
    if (!scrollable) return;

    // Thumb height is proportional to how much of the content is visible.
    // e.g. visible = 250px, total = 500px → thumb = 50% of track height.
    const thumbHeight = Math.max((clientHeight / scrollHeight) * clientHeight, 20);

    // Thumb position maps scroll progress to the available track space.
    const maxScrollTop = scrollHeight - clientHeight;
    const maxThumbTop  = clientHeight - thumbHeight;
    const thumbTop = maxScrollTop > 0 ? (scrollTop / maxScrollTop) * maxThumbTop : 0;

    setThumb({ height: thumbHeight, top: thumbTop });
  }, []);


  // ── Sync with scroll + content size changes ────────────────────────────────

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    recalculate();
    el.addEventListener("scroll", recalculate);

    // Watch the content div AND every direct child.
    // Why children? When the content div has a fixed height (e.g. height: 100%),
    // its own size never changes — but its children can grow/shrink (e.g. filter
    // sections expanding). Without watching children, recalculate would never
    // fire after a child collapses and the track would stay visible incorrectly.
    const observer = new ResizeObserver(recalculate);
    observer.observe(el);
    Array.from(el.children).forEach(child => observer.observe(child));

    return () => {
      el.removeEventListener("scroll", recalculate);
      observer.disconnect();
    };
  }, [recalculate]);


  // ── Thumb dragging ─────────────────────────────────────────────────────────
  // On mousedown on the thumb we record where the drag started, then on
  // mousemove (attached to document so the drag works outside the element)
  // we convert the pixel distance moved into a scroll distance.

  const handleThumbMouseDown = useCallback((e) => {
    e.preventDefault(); // prevent text selection while dragging

    const el = contentRef.current;
    if (!el) return;

    const startY          = e.clientY;
    const startScrollTop  = el.scrollTop;
    const { scrollHeight, clientHeight } = el;

    const thumbHeight  = Math.max((clientHeight / scrollHeight) * clientHeight, 20);
    const maxScrollTop = scrollHeight - clientHeight;
    const maxThumbTop  = clientHeight - thumbHeight;

    const onMouseMove = (e) => {
      if (maxThumbTop === 0) return;
      const deltaY      = e.clientY - startY;
      // Convert thumb pixels moved → scroll pixels moved using the same ratio
      const scrollDelta = (deltaY / maxThumbTop) * maxScrollTop;
      el.scrollTop = Math.max(0, Math.min(maxScrollTop, startScrollTop + scrollDelta));
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, []);


  // ── Styles ─────────────────────────────────────────────────────────────────

  const wrapperStyle = {};
  if (maxHeight) wrapperStyle.maxHeight = maxHeight;
  if (height)    wrapperStyle.height    = height;

  const contentStyle = { ...wrapperStyle };


  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className={`scroll-area ${className}`} style={wrapperStyle}>

      <div
        className={`scroll-area__content ${contentClassName}`}
        style={contentStyle}
        ref={contentRef}
      >
        {children}
      </div>

      {isScrollable && (
        <div className="scroll-area__track">
          <div
            className="scroll-area__thumb"
            style={{
              height: `${thumb.height}px`,
              transform: `translateY(${thumb.top}px)`,
            }}
            onMouseDown={handleThumbMouseDown}
          />
        </div>
      )}

    </div>
  );
}

export default ScrollArea;
