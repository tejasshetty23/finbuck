'use client'

import { useState, type ReactNode } from 'react'

/**
 * Tilts its child toward the pointer, so a card can be looked around rather
 * than only at.
 *
 * This element only rotates. The sense of depth comes from the child's own
 * layers pushing themselves apart with translateZ under `preserve-3d`, so how
 * far each layer floats stays with the markup that draws it, and the parallax
 * between them falls out of the rotation for free.
 *
 * The child is passed through untouched, so it can stay a server component.
 */
export default function TiltCard({
  children,
  className = '',
  max = 11,
}: {
  children: ReactNode
  className?: string
  /** Peak rotation in degrees, reached at the corners. */
  max?: number
}) {
  const [tilt, setTilt] = useState<{ x: number; y: number } | null>(null)

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    // Only for a real pointer. A touch screen has no hover to leave, so the
    // tilt would stay stuck wherever the last tap landed.
    if (
      !window.matchMedia('(hover: hover) and (pointer: fine)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }

    const r = e.currentTarget.getBoundingClientRect()
    // -1 to 1 out from the centre of the card. The rect is the untransformed
    // box, but the tilted child paints past it, so the pointer can legitimately
    // sit outside — clamped, or the rotation would overshoot `max` there.
    const clamp = (n: number) => Math.max(-1, Math.min(1, n))
    const px = clamp(((e.clientX - r.left) / r.width) * 2 - 1)
    const py = clamp(((e.clientY - r.top) / r.height) * 2 - 1)
    // Y follows the pointer horizontally; X is inverted, so pushing the pointer
    // up tips the top of the card away rather than toward you.
    setTilt({ x: -py * max, y: px * max })
  }

  return (
    <div
      className={className}
      style={{ perspective: '1000px' }}
      onPointerMove={onMove}
      onPointerLeave={() => setTilt(null)}
    >
      <div
        className="relative will-change-transform"
        style={{
          transformStyle: 'preserve-3d',
          transform: tilt
            ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1.03)`
            : 'rotateX(0deg) rotateY(0deg) scale(1)',
          // Quick while tracking, so it keeps up with the pointer; slow on the
          // way back, so releasing reads as the card settling rather than
          // snapping flat.
          transition: `transform ${tilt ? '90ms' : '520ms'} cubic-bezier(0.22, 0.61, 0.36, 1)`,
        }}
      >
        {children}
      </div>
    </div>
  )
}
