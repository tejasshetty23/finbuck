'use client'

export default function CopyButton({ code }: { code: string }) {
  return (
    <button
      onClick={() => navigator.clipboard?.writeText(code)}
      className="p-2 border border-[#00ff87]/30 rounded text-[#00ff87]/60 hover:text-[#00ff87] hover:border-[#00ff87] transition-colors"
      aria-label="Copy code"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </svg>
    </button>
  )
}
