import Reveal from '../../components/Reveal'

export default function RewardsPage() {
  return (
    <div className="min-h-screen pt-28 pb-24 px-4 sm:px-6 relative">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/background.png" alt="" className="w-full h-full object-cover object-center" style={{ filter: 'brightness(0.2) saturate(1.1)' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#07050f]/70 via-[#07050f]/50 to-[#07050f]" />
      </div>

      {/* Header */}
      <Reveal>
        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-tight text-white">
            Rewards <span className="animated-gradient-text">Trail</span>
          </h1>
        </div>
      </Reveal>
    </div>
  )
}
