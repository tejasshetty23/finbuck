'use client'

import { useState, useRef, useEffect } from 'react'

// One slot per line. Duplicates are dropped so the randomiser stays fair.
const DEFAULT_POOL: string[] = Array.from(new Set(
  `Rage of Egypt
Wanted Dead or a Wild
Le Bandit
Le Catcher
The Haunted Circus
Lit City
Le Pharaoh
Duel at Dawn
Le Fisherman
Grug Make Fire
Fist of Demolition
Rip City
Le Rapper
Fist of Destruction
Xmas Drop
SixSixSix
Le Cowboy
Rotten
Forest Fortune
Le King
Ze Zeus
Slayers Inc
Hot Ross
Dork Unit
Le Zeus
Stormforged
Densho
Le Digger
Life and Death
Le Viking
Magic Piggy
Chaos Crew
Donny Dough
Nitro Nights
Donny & Danny
Le Bunny
Secret Order
Drop'em
Jaws of Justice
Hounds of Hell
Cursed Seas
Le Santa
Chocolate Rocket
Pirate Bonanza
Pyrofox
Pirate Bonanza 2
Old Gun
Barrel Bonanza
Chicken Man
Crystal Robot
Hoot Shot The Sheriff
Desert Temple
Pirate Rock
Infernus
Super Twins
Home of Thor
Roman Bonanza
Power Pops
Blaze Buddies
Fireborn
Commander of Tridents
Gladius: Death or Glory
Sleepy Grandpa
Double Flux
Rooster's Reloaded
Bonsai Banzai
Drac's Stacks
Hex Appeal
Rooster Returns
Rooster's Revenge
Super Wild Cat
Maximus Multiplus
Licence to Squirrel
Bling King Camel
Gold Mine Monsters
Magic Stacks
Jawsome
Jittery Critters
Wild Don Donkey
Incredible
Thor's Hammered
Hot Rocks
Hyde and Seek
Joker Jam
Duck Hunters
AFK Airport Security
Soaked by Seam
Duck Hunters Happy Hour
Mental 2
Fire in the Hole 3
Seamen
Outsourced
Flight Mode
Gator Hunters
San Quentin 2: Death Row
Mental
Crazy Ex-Girlfriend
Brute Force: Alien Onslaught
Das xBoot 2wei!
Supersized
xWays Hoarder 2
Punk Rocker 3
Tanked
Brute Force
Fire in the Hole 2
Tombstone Slaughter: El Gordo's Revenge
The Crypt
Tombstone Begins
San Quentin
Dead, Dead or Deader
San Quentin Manhunt
Kenneth Must Die
Highway to Hell
Book of Shadows
Das xBoot
Tombstone RIP
Disorder
Kill Em All
Home of the Brave
Folsom Prison
Deadwood R.I.P.
Stockholm Syndrome
Fire in the Hole xBomb
D-Day
Skate or Die
Blood and Shadow 2
Land of the Free
Deadwood
Dead Men Walking
Apocalypse
Serial
Tombstone No Mercy
Ugliest Catch
Punk Toilet
Disturbed
Possessed
Break Out
Bangkok Hilton
Munchies
Blood & Shadow
Misery Mini
Barbarian Fury
Bushido
Evil Goblins xBomb
Hex Bloom
Cyber Saurus
Mine Drop 2
Knight Watch
Mine Drop
Dragonspire Frostfall
Candy Dash
Crazy Chef
King of Gods
Dragonspire
Tavern Drop
Toon Biker
Miko
CTRL ALT Delete
The Frontier
Potions
Knight Fall
Red Robin
Solar Eclipse
Lazy Knight
Eggs Marks the Spot
Candy Dream
Pigeon Mail
Soul Rush
Forged in Plasma
Toon Pilot
Round Robin
Candy Pantry
Lazy Pirate
Knight Shift
Afternoon Nap
Eggventure
Xmas Link
Off the Rails
Lazy Viking
Konbini
Farm & Merge
Link Quest
Witchy Will
Manor Gray
Maze Quest
Forged in Fire
Gates of Olympus 1000
Sweet Bonanza 1000
Sugar Rush 1000
Gates of Olympus Super Scatter
Big Bass Rock and Roll
The Dog House Megaways 1000
Sweet Bonanza 2500
Sugar Twist 1000
Panda Kingdom
5 Lions Megaways 2
Zeus vs Hades: Gods of War
Joker's Jewels
Gates of Heaven 1000
Sugar Rush Super Scatter
Thunder vs Underworld
Better Barnhouse Bonanza
Fruit Party
Sunnydayz Asylum
Cosmic Clusters
Sweet Rush Bonanza
Crypto Genesys
Big Bass Boom
Lucky Phoenix Megaways
Big Bass Splash 1000
Big Bass Bonanza 1000
Buffalo King Megaways
Sweet Fiesta 1000
5 Lions Megaways
Angel vs Sinner Eternal Battle
Gates of Olympus
Starlight Princess Super Scatter
Juicy Fruits
The Dog Mansion Megaways
Sweet Bonanza
Sugar Rush
Death Dominion
Big Bass: Gold and Monster
Jewel Bonanza
Big Bass Vegas Double Down Deluxe
Transylvania Mania
Big Bass Bonanza
Big Bass Floats My Boat
Pompeii Megareels Megaways
Wisdom of Athena 1000
Mummy's Jewels 100
Bigger Bass Bonanza
Bigger Barnhouse Bonanza
Bigger Bass Splash
Gates of Olympus Xmas 1000
Club Tropicana Happy Hour
Gates of Heaven
Sweet Bonanza Super Scatter
The Big Dog House
Jelly Express
Big Bass Halloween
Big Bass Halloween 3
Bison Spirit
Hell Butcher
The Dog House Megaways
Big Bass Trophy Hunter
Fire Stampede Ultimate
Bee Keeper
Triple Pot Gold
Zombie School Megaways
Gates of Eddie Super Button
Big Bass Reel Repeat
Big Bass Halloween 2
Fire Portals
Out of the Woods
Sweet Bonanza Xmas
The Dog House: No Dog Left Behind
Big Duck Bonanza
Candy Blitz Boom
Super Gummy Strike
Angel vs Sinner
Big Bass Christmas Bash
Bigger Bass Blizzard Christmas Catch
3 Buzzing Wilds
Muertos Multiplier Megaways
Sugar Rush Xmas
Book of the Fallen
Gates of Hades
Super Tiki Strike
Wild Wild Riches Returns
Release the Kraken
Rolling in Treasures
Sticky Bees
Money Stacks
Release the Kraken Megaways
Triple Pot Plinko Hercules
Rabbit Garden
Mr Null's Wicked Wares
Phoenix Forge
Psycho Hero
Candy Blitz
Rabbit Heist
Candy Blitz Bombs
Infective Wild
Release the Kraken 2
Wild Wildebeest Wins
Forge of Olympus
Santa's Great Gifts
Emerald King Wheel of Wealth
The Big Dawgs
Dojo Duel 2
Ninja Rabbit 2
Wizard 2000
Magic Wand
Airstrike 3
Dojo Duel
Orbs of Magic
Puffer Stacks 3
Wizard 1000
Coin Berserk
Airstrike
Airstrike 2
Buckshot Benny
Lucky Man's Chamber
Underworld
Untamed
Canyon Gold Bonanza
Million X
Battle of Gods
Chicken Delivery
Eye of Anubis
Farmageddon
Fireball
Juicy Harvest
Massive X
Maximus
Monkey Bay
Ninja Rabbit
Puffer Stacks 2
Wild Orbs
De Frog
Dream Princess
Dust Devil
Gambit
Puffer Stacks
Switchcraft
The Bandit
Walking Wilds
Akimbo Outlaws
Athena vs Ares
Beasts of Savannah
Boom Town
Wand Strikes
Rogue's Wake
Tavern Doubles
Phoenix 1000
Mission X
Vulcan's Wrath
Dragon Doubles
Mystery Circus
Olympus Doubles
Ancient Mystery
Huge Splash
Forge 1000
Gladiator 1000
Grand Pharaoh
Last Legend
Midas 1000
Rise of Asgard
Sniper
Sweet Build
Wings of Death
Wizard Shop
Wild Storm 2
Sugar Gates 1K
Coins of Anubis
Graffiti Ways
Flaming Mummy
Pudding Bonanza
Wild Storm
Guitar Slash
Tank Knight
Valhalla 100
Harakiri
Ball Drop 1K
Blackout Deluxe
Bucks Bunny
Gates of Gladius
Magic Phoenix
Arctic Mysteries
Bazooka Knight
Chaos Wilds
Gold Raiders
Wanted Balls
Ganja Snail
Cursed Kitchen
Kick Off
Cattle Clash
Rack City Riches
Gym Rat
Wild Voltage
Solar Girl
Gates of Destiny
Cupidon in Paris
Samurai Stacks
Big Lunker Bass Hunter
Sticky Sweets
Clash of Titans
Farm Rush
The Deep
Wild Patrol
Eternal Outlaw
God of the Sea
Golden Glory
The Big Top
Anubis Clusters
Big Bombs
Big Lunker Bass Clusters
Chaos Knight
Dragon's Hoard
Royal Riches
Wild Seas
Bounty Stacks
Full Chamber
Hawk Shot
Waylanders Forge
Mystery Dungeon
Journey's End Titanways
Red Strike
Waylanders Cup
Tiki Wiki Wild
Campfire
Hel's Domain
Angel of Asgard
Midas Multiplier
Tome of Hades
Tanks A Lot
Four Leaf Fortune
Quest for Gold
Ghost Blade
Bank Blast
Castle of Ymir
Battle Sharks
Wild Ruin
Clawmageddon
Coins of the Sea`
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
))

const STEPS = [
  {
    title: 'Chat gets picked',
    desc: 'A viewer is pulled from chat — they become the challenger.',
    color: '#a855f7',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
  {
    title: 'Slots locked in',
    desc: 'A viewer and FinBuck get their slots picked randomly.',
    color: '#00ff87',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
      </svg>
    ),
  },
  {
    title: 'Spin it out',
    desc: 'Both run live at the same bet. Highest multiplier takes it.',
    color: '#38bdf8',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.306a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
  },
  {
    title: 'Winner takes it',
    desc: 'If chat wins → the prize is paid out on stream.',
    color: '#FFD700',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
      </svg>
    ),
  },
]

/**
 * Shrink the font as the text gets longer so it stays inside its box.
 * `fitChars` is how many characters fit at full size; beyond that the whole
 * clamp (min/preferred/max) scales down proportionally, so it stays responsive.
 */
function fitFont(text: string, fitChars: number, minPx: number, vw: number, maxPx: number): string {
  const len = text.trim().length || 1
  const k = Math.max(0.55, Math.min(1, fitChars / len))
  return `clamp(${Math.max(7, minPx * k).toFixed(1)}px, ${(vw * k).toFixed(2)}vw, ${(maxPx * k).toFixed(1)}px)`
}

function parseMult(s: string): number | null {
  const cleaned = s.replace(/[^0-9.]/g, '')
  if (!cleaned) return null
  const n = parseFloat(cleaned)
  return Number.isNaN(n) ? null : n
}

/** Reusable avatar with drag-drop / click-to-upload. */
// Frame aspect + overlay regions (percentages of the frame box), tuned to the
// neon frame artwork so content sits inside the circle / name bar / slot boxes.
// Each frame crop has its own aspect ratio and its own ring position, measured
// from the artwork. The avatar is sized to the ring's INNER diameter (plus a
// hair of overlap) and the frame renders on top, so the neon ring always draws
// cleanly over the photo's edge.
type Region = {
  ar: number
  avatar: { x: number; y: number; size: number }
  name: { x: number; y: number; w: number }
  slot: { x: number; y: number; w: number }
  mult: { x: number; y: number; w: number }
}
const REGION_GREEN: Region = {
  ar: 715 / 1023,
  avatar: { x: 44.83, y: 23.56, size: 29.6 },
  name: { x: 45.0, y: 38.5, w: 33 },
  slot: { x: 44.6, y: 54.0, w: 54 },
  mult: { x: 44.7, y: 73.6, w: 54 },
}
const REGION_PURPLE: Region = {
  ar: 705 / 1021,
  avatar: { x: 51.63, y: 23.6, size: 30.4 },
  name: { x: 51.35, y: 38.5, w: 33 },
  slot: { x: 51.4, y: 54.1, w: 56 },
  mult: { x: 51.4, y: 73.6, w: 56 },
}

interface Fighter {
  role: string
  color: string
  img: string
  /** Scale applied to the avatar photo (>1 zooms in, <1 zooms out). */
  zoom?: number
  /** Nudge the photo inside its circle, in % of the circle (x, y). */
  nudge?: { x?: number; y?: number }
  setImg: (v: string) => void
  name: string
  setName: (v: string) => void
  slot: string
  setSlot: (v: string) => void
  mult: string
  setMult: (v: string) => void
}

function FighterCard({ f, frameSrc, fillSrc, region, winner }: { f: Fighter; frameSrc: string; fillSrc: string; region: Region; winner: boolean | null }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const glow = winner === true
  const handle = (file?: File) => { if (file) f.setImg(URL.createObjectURL(file)) }

  return (
    <div
      className="relative w-full transition-all duration-300"
      style={{ aspectRatio: `${region.ar}`, filter: glow ? `drop-shadow(0 0 26px ${f.color})` : 'none' }}
    >
      {/* Solid black card interior, matched to the frame's shape */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={fillSrc} alt="" className="absolute inset-0 w-full h-full pointer-events-none select-none" />

      {/* Avatar sits BEHIND the frame so the neon ring draws over its edge */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handle(e.dataTransfer.files?.[0]) }}
        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full overflow-hidden cursor-pointer bg-[#07050f] flex items-center justify-center"
        style={{ left: `${region.avatar.x}%`, top: `${region.avatar.y}%`, width: `${region.avatar.size}%`, aspectRatio: '1' }}
        title="Click or drop an image"
      >
        {f.img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={f.img}
            alt=""
            className="w-full h-full object-cover"
            style={{ transform: `translate(${f.nudge?.x ?? 0}%, ${f.nudge?.y ?? 0}%) scale(${f.zoom ?? 1})` }}
          />
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-1/3 h-1/3 text-gray-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        )}
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handle(e.target.files?.[0] ?? undefined)} />
      </div>

      {/* Frame overlays the avatar */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={frameSrc} alt="" className="absolute inset-0 w-full h-full pointer-events-none select-none" />

      {/* Name */}
      <input
        value={f.name}
        onChange={(e) => f.setName(e.target.value)}
        className="absolute -translate-x-1/2 -translate-y-1/2 text-center bg-transparent font-black text-white uppercase focus:outline-none truncate"
        style={{ left: `${region.name.x}%`, top: `${region.name.y}%`, width: `${region.name.w}%`, fontSize: fitFont(f.name, 8, 9, 1.7, 15) }}
      />

      {/* Slot */}
      <input
        value={f.slot}
        onChange={(e) => f.setSlot(e.target.value)}
        placeholder="—"
        className="absolute -translate-x-1/2 -translate-y-1/2 text-center bg-transparent font-bold text-white focus:outline-none placeholder-gray-600"
        style={{ left: `${region.slot.x}%`, top: `${region.slot.y}%`, width: `${region.slot.w}%`, fontSize: fitFont(f.slot, 18, 10, 1.9, 15) }}
      />

      {/* Multiplier */}
      <input
        value={f.mult}
        onChange={(e) => f.setMult(e.target.value)}
        placeholder="0x"
        className="absolute -translate-x-1/2 -translate-y-1/2 text-center bg-transparent font-black focus:outline-none placeholder-gray-700"
        style={{ left: `${region.mult.x}%`, top: `${region.mult.y}%`, width: `${region.mult.w}%`, color: f.color, fontSize: fitFont(f.mult || '0x', 7, 22, 4.6, 40) }}
      />
    </div>
  )
}

export default function VsChatPage() {
  // Fighters
  const [houseImg, setHouseImg] = useState('/finbuck-avatar.webp')
  const [houseName, setHouseName] = useState('FinBuck')
  const [houseSlot, setHouseSlot] = useState('')
  const [houseMult, setHouseMult] = useState('')

  const [chatImg, setChatImg] = useState('/gigachad.webp')
  const [chatName, setChatName] = useState('Chat')
  const [chatSlot, setChatSlot] = useState('')
  const [chatMult, setChatMult] = useState('')


  const hm = parseMult(houseMult)
  const cm = parseMult(chatMult)

  let outcome: 'chat' | 'house' | 'tie' | null = null
  if (hm !== null && cm !== null) outcome = cm > hm ? 'chat' : hm > cm ? 'house' : 'tie'

  const house: Fighter = { role: 'The House', color: '#00ff87', img: houseImg, setImg: setHouseImg, name: houseName, setName: setHouseName, slot: houseSlot, setSlot: setHouseSlot, mult: houseMult, setMult: setHouseMult }
  const chat: Fighter = { role: 'Challenger · from chat', color: '#a855f7', img: chatImg, setImg: setChatImg, name: chatName, setName: setChatName, slot: chatSlot, setSlot: setChatSlot, mult: chatMult, setMult: setChatMult }

  // ── Random slot picker ──
  const pool = DEFAULT_POOL
  const [display, setDisplay] = useState('Ready to roll')
  const [landed, setLanded] = useState('')
  const [rolling, setRolling] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  function randomize() {
    if (rolling || pool.length < 2) return
    setRolling(true)
    setLanded('')
    const winner = pool[Math.floor(Math.random() * pool.length)]
    const total = 26
    let i = 0
    const step = () => {
      if (i >= total) {
        setDisplay(winner)
        setLanded(winner)
        setRolling(false)
        return
      }
      setDisplay(pool[Math.floor(Math.random() * pool.length)])
      i += 1
      // Decelerating flicker. Total = n*40 + k*Σi²; with n = 26 (Σi² = 6201),
      // k = 0.8 lands the roll at ~6s, ending on a ~580ms final beat.
      timerRef.current = setTimeout(step, 40 + i * i * 0.8)
    }
    step()
  }

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 relative">
      {/* Background */}
      {/* Starts below the fixed navbar so the artwork's top isn't hidden by it */}
      <div className="fixed inset-0 -z-10 bg-[#07050f]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/vschat-bg.webp"
          alt=""
          className="absolute inset-x-0 bottom-0 w-full object-cover object-top"
          style={{ top: '58px', filter: 'brightness(0.45) saturate(1.05)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#07050f]/60 via-[#07050f]/45 to-[#07050f]" />
      </div>

      {/* Header */}
      <div className="max-w-4xl mx-auto mb-10 text-center">
        <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-1.5 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-purple-400 text-sm font-semibold tracking-widest uppercase">Live Slot Duel</span>
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-tight mb-4 whitespace-nowrap">
          <span className="animated-gradient-text">Slot</span> <span className="animated-gradient-text-purple">Battles</span>
        </h1>
        <p className="text-gray-500 text-base max-w-lg mx-auto">
          A viewer takes on the house. Both spin a slot — highest multiplier wins. Beat FinBuck, take the prize.
        </p>
      </div>

      {/* Random slot picker */}
      <div className="max-w-5xl mx-auto mb-16">
        <div className="flex items-center gap-3 mb-6 justify-center">
          <div className="h-px flex-1 max-w-[80px] bg-gradient-to-r from-transparent to-purple-500/40" />
          <span className="text-purple-300 text-xs font-black uppercase tracking-[0.3em]">Random Slot Picker</span>
          <div className="h-px flex-1 max-w-[80px] bg-gradient-to-l from-transparent to-purple-500/40" />
        </div>

        <div className="py-2">

          {/* Display */}
          <div className="relative z-10 flex flex-col items-center justify-center max-w-xl mx-auto">
            {/* Octagon frame, purple twin of the sponsor card on the home page */}
            <div className="picker-card w-full mb-6">
              <div
                className="relative p-[3px]"
                style={{
                  clipPath: 'polygon(20px 0%, calc(100% - 20px) 0%, 100% 20px, 100% calc(100% - 20px), calc(100% - 20px) 100%, 20px 100%, 0% calc(100% - 20px), 0% 20px)',
                  background: landed
                    ? 'linear-gradient(135deg, #00ff87, #4ade80, #00c96a, #00ff87)'
                    : 'linear-gradient(135deg, #a855f7, #c084fc, #7c3aed, #a855f7)',
                  transition: 'background 0.3s ease',
                }}
              >
                <div
                  className="relative flex items-center justify-center text-center px-6 py-12"
                  style={{
                    background: 'linear-gradient(160deg, #170b28 0%, #0a0512 50%, #000000 100%)',
                    clipPath: 'polygon(18px 0%, calc(100% - 18px) 0%, 100% 18px, 100% calc(100% - 18px), calc(100% - 18px) 100%, 18px 100%, 0% calc(100% - 18px), 0% 18px)',
                  }}
                >
                  <span className={`font-black leading-tight break-words ${rolling ? 'text-white/70' : landed ? 'text-[#00ff87]' : 'text-gray-500'} text-2xl sm:text-3xl`}>
                    {display}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={randomize}
                disabled={rolling || pool.length < 2}
                className="text-black font-black py-3 px-8 rounded-xl uppercase tracking-widest text-sm transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                style={{ background: 'linear-gradient(135deg, #00ff87, #4ade80, #00c96a)' }}
              >
                {rolling ? 'Rolling…' : 'Randomize'}
              </button>
              {landed && !rolling && (
                <>
                  <button onClick={() => setHouseSlot(landed)} className="border border-[#00ff87]/50 text-[#00ff87] hover:bg-[#00ff87]/10 font-bold py-2.5 px-3 rounded-lg uppercase tracking-widest text-[10px] transition-all">→ FinBuck</button>
                  <button onClick={() => setChatSlot(landed)} className="border border-purple-500/50 text-purple-300 hover:bg-purple-500/10 font-bold py-2.5 px-3 rounded-lg uppercase tracking-widest text-[10px] transition-all">→ Chat</button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Arena */}
      <div className="max-w-5xl mx-auto mb-16">
        <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4">
          <div className="w-full md:flex-1 max-w-[330px]">
            <FighterCard f={house} frameSrc="/frame-green.webp" fillSrc="/frame-green-fill.webp" region={REGION_GREEN} winner={outcome ? outcome === 'house' : null} />
          </div>

          {/* VS emblem — floats gently */}
          <div className="relative flex items-center justify-center shrink-0 -my-6 md:my-0 z-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/vs.webp"
              alt="VS"
              className="vs-float relative w-24 sm:w-32 h-auto select-none pointer-events-none"
            />
          </div>

          <div className="w-full md:flex-1 max-w-[330px]">
            <FighterCard f={chat} frameSrc="/frame-purple.webp" fillSrc="/frame-purple-fill.webp" region={REGION_PURPLE} winner={outcome ? outcome === 'chat' : null} />
          </div>
        </div>

        {/* Outcome banner — gold whenever there's a winner */}
        {(() => {
          const isWin = outcome === 'chat' || outcome === 'house'
          // Winner's own colour: green for the house, purple for chat.
          const win = outcome === 'house'
            ? { color: '#00ff87', bg: 'linear-gradient(135deg, #052a18 0%, #02120a 55%, #000000 100%)', border: 'rgba(0,255,135,0.6)', glow: 'rgba(0,255,135,0.28)' }
            : { color: '#c07cff', bg: 'linear-gradient(135deg, #1d0b33 0%, #0f0619 55%, #000000 100%)', border: 'rgba(168,85,247,0.6)', glow: 'rgba(168,85,247,0.3)' }
          return (
            <div
              className="mt-4 rounded-2xl px-6 py-4 text-center transition-colors"
              style={{
                background: isWin ? win.bg : outcome === 'tie' ? '#26233a' : '#0d0a1a99',
                border: isWin ? `1px solid ${win.border}` : outcome === 'tie' ? 'none' : '1px solid rgba(168,85,247,0.55)',
                boxShadow: isWin ? `0 0 28px ${win.glow}` : 'none',
              }}
            >
              {outcome === 'chat' && (
                <span
                  className="font-black uppercase tracking-wide text-lg"
                  style={{ color: win.color, textShadow: `0 0 16px ${win.glow}` }}
                >
                  🏆 Cash money AP for {chatName}
                </span>
              )}
              {outcome === 'house' && (
                <span
                  className="font-black uppercase tracking-wide text-lg"
                  style={{ color: win.color, textShadow: `0 0 16px ${win.glow}` }}
                >
                  🏆 More keno money for Fin!
                </span>
              )}
              {outcome === 'tie' && (
                <span className="font-black uppercase tracking-wide text-gray-300 text-lg">Dead heat - respin</span>
              )}
              {!outcome && (
                <span className="text-sm uppercase tracking-widest font-bold" style={{ color: '#00ff87' }}>
                  Enter both multipliers to call the winner
                </span>
              )}
            </div>
          )
        })()}
      </div>

      {/* How it works */}
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="h-px flex-1 max-w-[80px] bg-gradient-to-r from-transparent to-[#00ff87]/40" />
          <span className="text-[#00ff87] text-xs font-black uppercase tracking-[0.3em]">How it works</span>
          <div className="h-px flex-1 max-w-[80px] bg-gradient-to-l from-transparent to-purple-500/40" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map((s, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1"
              style={{
                borderColor: `${s.color}33`,
                background: 'linear-gradient(160deg, #150e24 0%, #0a0613 55%, #050308 100%)',
              }}
            >
              {/* Top accent */}
              <span
                className="pointer-events-none absolute inset-x-0 top-0 h-[2px] opacity-60 transition-opacity duration-300 group-hover:opacity-100"
                style={{ background: `linear-gradient(90deg, transparent, ${s.color}, transparent)` }}
              />

              <div className="relative">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                  style={{ color: s.color, background: `${s.color}14`, border: `1px solid ${s.color}40` }}
                >
                  {s.icon}
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: s.color }}>
                  Step {String(i + 1).padStart(2, '0')}
                </p>
                <h3 className="text-white font-black text-base mb-2 leading-tight">{s.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
