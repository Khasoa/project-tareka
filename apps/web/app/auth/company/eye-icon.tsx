export function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
      <path d="M2 10s3.333-5 8-5 8 5 8 5-3.333 5-8 5-8-5-8-5Z" />
      <circle cx="10" cy="10" r="2.5" />
    </svg>
  ) : (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
      <path d="M3 3l14 14M11.57 11.57A2.5 2.5 0 0 1 7.43 8.43M7.42 4.6C8.24 4.22 9.1 4 10 4c4.667 0 8 5 8 5a15.1 15.1 0 0 1-2.36 3.07M5.08 5.08A14.95 14.95 0 0 0 2 10s3.333 5 8 5c1.6 0 3.09-.45 4.38-1.19" />
    </svg>
  );
}

export function Spinner() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 animate-spin" aria-hidden>
      <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="25 27" strokeLinecap="round" />
    </svg>
  );
}
