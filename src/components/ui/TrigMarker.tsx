/** Small triangulation-point marker (cartographic sign for a control point). */
export function TrigMarker({ className = 'h-3.5 w-3.5 text-signal' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true" focusable="false">
      <path d="M8 2.2L14 13H2Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="8" cy="9.4" r="1.3" fill="currentColor" />
    </svg>
  );
}
