import type { CSSProperties, ReactNode } from 'react'

// The site's card. Same geometry as the podium and the buttons — top-left and
// bottom-right corners cut at 45° — so every surface on the site reads as one
// family of objects.
//
// Built as two clipped layers: an outer one that is the border (a gradient,
// strongest along the top so the panel looks lit from above), and an inner one
// with the fill. The inner cut is smaller by (2 − √2)·border so the diagonal
// edge comes out the same thickness as the straight ones.

type Tone = 'default' | 'accent' | 'gold'

const CUT = 18
const BORDER = 1

const chamfer = (c: number) =>
  `polygon(${c}px 0, 100% 0, 100% calc(100% - ${c}px), calc(100% - ${c}px) 100%, 0 100%, 0 ${c}px)`

const TONE: Record<Tone, { edge: string; fill: string }> = {
  default: {
    edge: 'linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.07) 35%, rgba(255,255,255,0.04) 100%)',
    fill: 'linear-gradient(180deg, #272D6C 0%, #22285F 55%, #1E2357 100%)',
  },
  // A green lit edge, for the panel that holds the code.
  accent: {
    edge: 'linear-gradient(180deg, rgba(0,255,135,0.85) 0%, rgba(0,255,135,0.25) 45%, rgba(255,255,255,0.05) 100%)',
    fill: 'radial-gradient(90% 60% at 50% 0%, rgba(0,255,135,0.10), transparent 70%), linear-gradient(180deg, #272D6C 0%, #22285F 55%, #1E2357 100%)',
  },
  gold: {
    edge: 'linear-gradient(180deg, rgba(255,196,77,0.85) 0%, rgba(255,196,77,0.25) 45%, rgba(255,255,255,0.05) 100%)',
    fill: 'radial-gradient(90% 60% at 50% 0%, rgba(255,196,77,0.10), transparent 70%), linear-gradient(180deg, #272D6C 0%, #22285F 55%, #1E2357 100%)',
  },
}

export default function Panel({
  children,
  tone = 'default',
  className = '',
  innerClassName = '',
  style,
}: {
  children: ReactNode
  tone?: Tone
  /** Applied to the outer (border) layer — use for width, margins, grid placement. */
  className?: string
  /** Applied to the inner (fill) layer — use for padding and layout. */
  innerClassName?: string
  style?: CSSProperties
}) {
  const t = TONE[tone]
  return (
    <div className={className} style={{ ...style, clipPath: chamfer(CUT), padding: BORDER, background: t.edge }}>
      <div
        className={`relative h-full ${innerClassName}`}
        style={{ clipPath: chamfer(CUT - (2 - Math.SQRT2) * BORDER), background: t.fill }}
      >
        {children}
      </div>
    </div>
  )
}
