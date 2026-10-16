'use client'

import { useState, useRef, useEffect } from 'react'
import Button from '../../components/Button'
import PageHeader from '../../components/PageHeader'
import Panel from '../../components/Panel'
import Reveal from '../../components/Reveal'
import SectionHeading from '../../components/SectionHeading'

// The two sides' colours: the site's green for the house, a soft violet
// for the challenger so the pair still reads as two without leaving the
// navy-and-green palette.
const HOUSE = '#00FF87'
const CHAT = '#B4A7FF'

// One slot per line. Duplicates are dropped so the randomiser stays fair —
// 22 of these titles are carried by more than one provider.
//
// Pulled from Gamba's catalogue (the previous list was built around Stake's
// lineup) for: Pragmatic Play, Hacksaw Gaming, Nolimit City, Slotmill,
// Bullshark Games, Backseat Gaming, Shady Lady, Peter and Sons.
const DEFAULT_POOL: string[] = Array.from(new Set(
  `2 Wild 2 Die
  3 Buzzing Wilds
  3 Cursed Chests: Hold & Win
  3 Dancing Monkeys
  3 Genie Wishes MANA
  3 Kingdoms - Battle of Red Cliffs
  3 Magic Eggs
  5 Frozen Charms Megaways
  5 Lions
  5 Lions Dance
  5 Lions Megaways
  5 Lions Megaways 2
  5 Lions Reborn
  6 Jokers
  7 Clovers of Fortune
  7 Monkeys
  7 Piggies
  777 Rush
  777 Wheel Blitz
  8 Dragons
  888 Dragons
  888 Gold
  AFK Airport Security
  African Elephant
  Age of Seth
  Aiko and the Wind Spirit
  Aladdin and the Sorcerer
  Alien Invaders
  Aliens Among Us
  Alpha Eagle
  Amazing Miceketeers
  Ancient Egypt
  Ancient Egypt Classic
  Ancient Island Megaways
  Ancient Paws
  Andar Bahar
  Angel vs Sinner
  Apocalypse Super xNudge
  Argonauts
  Army of Ares
  Asgard
  Astro Rumble
  Aztec Blaze
  Aztec Bonanza
  Aztec Gems
  Aztec Gems Deluxe
  Aztec Gems Megaways
  Aztec Powernudge
  Aztec Smash
  Aztec Treasure Hunt
  Aztec Twist
  Baccarat
  Badge Blitz
  Balloons
  Banana Farm
  Bandit Megaways
  Bangkok Hilton
  Barbarian Fury
  Barn Festival
  Barnyard Megahays Megaways
  Barrel Bonanza
  Bash Bros
  Beam Boys
  Bear Crazy
  Bear Patrol
  Beast Below
  Bee Keeper
  Beheaded
  Behind Bars: Masterplan
  Belle the Blade Hunter
  Benji Killed in Vegas
  Benny the Beer
  Better Barn House Bonanza
  Beware The Deep Megaways
  Big Bass - Hold & Spinner
  Big Bass - Keeping it Reel
  Big Bass Amazon Xtreme
  Big Bass Blast
  Big Bass Bonanza
  Big Bass Bonanza 1000
  Big Bass Bonanza 3 Reeler
  Big Bass Bonanza Megaways
  Big Bass Bonanza – Reel Action
  Big Bass Boxing Bonus Round
  Big Bass Christmas Bash
  Big Bass Christmas – Frozen Lake
  Big Bass Day at the Races
  Big Bass Floats My Boat
  Big Bass Football Bonanza
  Big Bass Halloween
  Big Bass Halloween 2
  Big Bass Halloween 3
  Big Bass Mission Fishin'
  Big Bass Raceday Repeat
  Big Bass Reel Repeat
  Big Bass Return to the Races
  Big Bass Secrets of the Golden Lake
  Big Bass Splash
  Big Bass Splash 1000
  Big Bass Trophy Catch
  Big Bass Vegas Double Down Deluxe
  Big Bass Xmas Xtreme
  Big Bounty Bandits: 3 Pots
  Big Burger Load it up with Xtra cheese
  Big Juan
  Bigger Barn House Bonanza
  Bigger Bass Blizzard - Christmas Catch
  Bigger Bass Bonanza
  Bigger Bass Splash
  Bingo Mania
  Bizarre
  Black Bull
  Black Friday
  Blackjack
  Blade & Fangs
  Blaze Buddies
  Blazing Wilds Megaways
  Blitz Super Wheel
  Blood & Shadow
  Blood & Shadow 2
  Blood Diamond
  Bloodthirst
  Bloody Dawn
  Bomb Bonanza
  Bonus Bunnies
  Book of Golden Sands
  Book of Kingdoms
  Book of Monsters
  Book of Shadows
  Book of the Fallen
  Book of Time
  Book of Tut Megaways
  Book of Vikings
  Boom City
  Booze Bash
  Born in Hell
  Born Wild
  Bouncy Bombs
  Bounty Gold
  Bounty Hunter
  Bounty Hunters
  Bow of Artemis
  Boxes
  Brainwashed
  Break Bone
  Break the Ice
  Breakout
  Brew Brothers
  Brew Brothers: Xmas Brew
  Brick House Bonanza
  BRICK SNAKE 2000
  Bronco Spirit
  Brute Force
  Buffalo Hunter
  Buffalo King
  Buffalo King Megaways
  Buffalo King Untamed Megaways
  Buffalo Stack'n'Sync
  Bullets and Bounty
  Bullride Loot
  Bullshark Brawl
  Bushido Ways xNudge
  Buzz Patrol
  Caishen's Cash
  Caishen's Cash Pots
  Caishen's Gold
  Candy Blitz
  Candy Blitz Bombs
  Candy Corner
  Candy Jar Clusters
  Candy Rush
  Candy Stars
  Captain Kraken Megaways
  Cash Bonanza
  Cash Box
  Cash Chips
  Cash Compass
  Cash Crew
  Cash Crooks
  Cash Elevator
  Cash Pandas
  Cash Patrol
  Cash Quest
  Cash Scratch
  Cash Surge
  Casino Win Spin
  Castle of Fire
  Catfish Hunters
  Chaos Crew
  Chaos Crew 2
  Chaos Crew 3
  Chaos Crew Scratch
  Charm of the Dragon
  Chase for Glory
  Chests of Cai Shen
  Chests of Cai Shen 2
  Chicken Chase
  Chicken Drop
  Chicken Man
  Chilli Bandits
  Chilli Heat
  Chilli Heat Megaways
  Chilli Heat Spicy Spins
  Chocolate Rocket
  Christmas Big Bass Bonanza
  Christmas Carol Megaways
  Circle of Life
  Clawsy Collector
  Cleocatra
  Cloud Princess
  Clover Club
  Clover Gold
  Club Tropicana
  Club Tropicana - Happy Hour
  Clumsy Cowboys
  Code of Cairo
  Coin Quest 2
  Coins
  Coins and Cannons
  Coins Of Fortune
  Colors
  Colossal Cash Zone
  Commander of Tridents
  Congo Cash
  Congo Cash XL
  Coop Clash
  Cosmic Cash
  Cosmic Clusters!
  Country Farming
  Cowboy Coins
  Cowboys Gold
  Crank It Up
  Crazy Crops
  Crazy Ex-Girlfriend
  Crown of Fire
  Crowned Corners
  Crystal Caverns Megaways
  Crystal Robot
  Cubes
  Cubes 2
  Culinary Clash
  CULT.
  Curse of the Werewolf Megaways
  Cursed Crypt
  Cursed Seas
  Cyber Runner
  Cyberheist City
  Cyclops Smash
  D-Day
  Da Vinci's Treasure
  Dance Party
  Dandy Diamonds
  Danny Dollar
  Dark Forge
  Dark Spiral
  Dark Summoning
  Das xBoot
  Das xBoot 2wei!
  Dawn of Kings
  Day of Dead
  Dead Canary
  Dead Man's Drop
  Dead Men Walking
  Dead, Dead Or Deader
  Deadwood
  Deadwood R.I.P
  Deal With Death
  Death Becomes You
  Death Dominion
  Demon Pots
  Demon's Gate
  Densho
  Desert Temple
  Devil's Crossroad
  Devil's Finger
  Devilicious
  Diamond Cascade
  Diamond Mole
  Diamond Strike
  Diamonds Of Egypt
  Dice City
  Ding Dong Christmas Bells
  Dino Drop
  Disorder
  Disturbed
  Divine Drop
  DJ Psycho
  Donny and Danny
  Donny Dough
  Donut Division
  Dork Unit
  Dorks of the Deep
  Double Rainbow
  Down the Rails
  Drago - Jewels of Fortune
  Dragon Gold 88
  Dragon Hero
  Dragon Hot Hold and Spin
  Dragon King Hot Pots
  Dragon Kingdom
  Dragon Kingdom - Eyes of Fire
  Dragon Pots Megaways
  Dragon Tiger
  Dragon Tiger Fortunes
  Dragon Tribe
  Dragon's Domain
  Dragon's gate - Bonus Choice
  Drill That Gold
  Drop'em
  Duck Hunters
  Duck Hunters: Happy Hour
  Duel at Dawn
  Duel of Night & Day
  Dungeon Quest
  Dusk Princess
  Dwarf & Dragon
  Dwarven Gold Deluxe
  Dynamite Diggin Doug
  Dynasty of Death
  East Coast vs West Coast
  Egyptian Fortunes
  El Paso Gunfight xNudge
  Elemental Gems Megaways
  Emberfall
  Emberfall 40K
  Emerald King
  Emerald King - Wheel of Wealth
  Emerald King Rainbow Road
  Emotiwins
  Emperors Rise
  Empress of The Shadows
  Empty the Bank
  Epic Bullets & Bounty
  Escape the Pyramid - Fire & Ice
  Eternal Dawn
  Eternal Duel
  Eternal Empress - Freeze Time
  Evil Eyes
  Evil Goblins
  Excalibur Unleashed
  Extra Juicy
  Extra Juicy Megaways
  Eye of Cleopatra
  Eye of Medusa
  Eye of Spartacus
  Eye of the Panda
  Eye of the Storm
  Fairytale Fortune
  Fangtastic Freespins
  Fat Panda
  Fear The Dark
  Feel The Beat
  Fiesta Fortune
  Fighter Pit
  Finger Lick'n Free Spins
  Fire 88
  Fire Archer
  Fire Hot 100
  Fire Hot 20
  Fire Hot 40
  Fire Hot 5
  Fire in the Hole 2
  Fire in the Hole 3
  Fire In The Hole xBomb
  Fire my Laser
  Fire Portals
  Fire Stampede
  Fire Stampede 2
  Fire Strike
  Fire Strike 2
  Firebird Spirit
  Fireborn
  Firelord
  Fish Eye
  Fishin' Reels
  Fist of Destruction
  Flight Mode
  Floating Dragon
  Floating Dragon - Dragon Boat Festival
  Floating Dragon Megaways
  Floating Dragon New Year Festival Ultra Megaways Hold & Spin
  Floating Dragon Wild Horses
  Floating Dragon – Year of the Snake
  Folsom Prison
  Fonzo's Feline Fortunes
  Forest Fortune
  Forge of Olympus
  Forging Wilds
  Fortune Hit'n Roll
  Fortune of Aztec
  Fortune of Giza
  Fortune of Olympus
  Fortune Pandas
  Fortunes of Aztec
  Frank's Farm
  Fred's Food Truck
  Frightening Frankie
  FRKN Bananas
  Front Runner
  Frozen Tropics
  Fruit Duel
  Fruit Party
  Fruit Party 2
  Fruit Rainbow
  Fruit Smash
  Fruits
  Fruity Treats
  Frutz
  Fury and Fortune
  Fury of Anubis
  Fury of Odin Megaways
  Gaelic Gold
  Gates of Hades
  Gates of Olympus
  Gates of Olympus 1000
  Gates of Olympus Roulette
  Gates of Olympus Super Scatter
  Gates of Olympus Xmas 1000
  Gates of Valhalla
  Gator Hunters
  Gearlab Genius
  Gears of Horus
  Gem Elevator
  Gem Fire Fortune
  Gem Rush
  Gem Trio
  Gems Bonanza
  Gems of Serengeti
  Genie's Gem Bonanza
  Get the CHEESE
  Ghostly Hallows
  Ginger Wins: Wild Jungle
  Gladiator Legends
  Gladius: Death Or Glory
  Gluttony
  Goblin Heist Powernudge
  Godly Gains
  Gods of Giza
  Gods of Glory
  Gold Oasis
  Gold Party
  Gold Rush
  Gold Train
  Golden Beauty
  Golden Genie and the Walking Wilds
  Golden Scrolls
  Golden Shower
  Good Luck & Good Fortune
  Gorilla Mayhem
  Gravity Bonanza
  Great Ghosts!
  Great Rhino
  Great Rhino Deluxe
  Great Rhino Megaways
  Greedy Fortune Pig
  Greedy Wolf
  Greek Gods
  Gronk's Gems
  Grug Make Fire
  Grunt Gold
  Halls of Odin
  Hammerstorm
  Hand of Anubis
  Hand of Midas 2
  Happy Dragon
  Happy Hooves
  Happy Nets
  Happy Scratch
  Harlequin Carnival
  Harvest Moon - Grave Profits
  Harvest Wilds
  Haunted Crypt
  Heart of Cleopatra
  Heart Of Rio
  Heartbreakers
  Heist for the Golden Nuggets
  Hell Butcher
  Hellvis Wild
  Hercules and Pegasus
  Hercules Son of Zeus
  Heroic Spins
  Highway to Hell
  Himalayan Wild
  Holy Heist
  Home of the Brave
  Home of Thor
  Honey Honey Honey
  Hoot Shot The Sheriff
  Hop'n'Pop
  Hot 4 Cash
  Hot Chilli
  Hot Fiesta
  Hot Nudge
  Hot Pepper
  Hot Ross
  Hot Safari
  Hot to burn
  Hot to Burn - 7 Deadly Free Spins
  Hot to Burn Extreme
  Hot to Burn Hold and Spin
  Hot To Burn Multiplier
  Hot Tuna
  Hounds of Hell
  Ice Ice Yeti
  Ice Lobster
  Ice Mints
  Idol Pop Fever
  Immortal Desire
  Immortal Fruits
  Inca Queen
  Infectious 5 xWays
  Infective Wild
  Invictus
  Irish Crown
  ITERO
  Jackpot Hunter
  Jade Butterfly
  Jade Legends
  Jane Hunter and the Mask of Montezuma
  Jasmine Dreams
  Jaws of Justice
  Jawsome Pirates
  Jelly Candy
  Jelly Express
  Jelly Slice
  Jewel Rush
  Jingle Balls
  John Hunter and Galileo's Secrets
  John Hunter and the Aztec Treasure
  John Hunter and the Book of Tut
  John Hunter and the Book of Tut Respin
  John Hunter and the Mayan Gods
  John Hunter and the Quest for Bermuda Riches
  John Hunter and the Tomb of the Scarab Queen
  Joker Bombs
  Joker King
  Joker's Jewels
  Joker's Jewels Cash
  Joker's Jewels Dice
  Joker's Jewels Hold & Spin
  Joker's Jewels Wild
  Joker's Revenge
  Joker’s Jewels Hot
  Journey to the West
  Juicy Fruits
  Juicy Fruits Multihold
  Jungle Gorilla
  Junkyard Kings
  Jurassic Giants
  Karen Maneater
  KD: BBQ Frenzy
  KD: Sushi Mania
  Keep'em
  Keep'em Cool
  Kenneth Must Die
  Kill Em All
  King Carrot
  King of the Streets
  Kingdom of The Dead
  Kiss My Chainsaw
  Klowns
  Knight Hot Spotz
  Knights vs Barbarians
  Laced
  Lady Godiva
  Lamp Of Infinity
  Land of the Free
  Last Man Standing
  Launch to Riches
  Lava Balls
  Le Bandit
  Le Bunny
  Le Cowboy
  Le Digger
  Le Fisherman
  Le Football Fan
  Le Hooligan
  Le King
  Le Pharaoh
  Le Prechaun
  Le Santa
  Le Viking
  Le Zeus
  Legion X
  Lemur Levels
  Leprechaun Carol
  Leprechaun Song
  Let it Snow
  Life and Death
  Little Bighorn
  Little Gem
  Lobster Bob's Sea Food and Win It
  Lobster House
  Loki's Riches
  Loner
  Lord Venom
  Lucky 6 Roulette
  Lucky Dog
  Lucky Dragons
  Lucky Fortune Tree
  Lucky Grace and Charm
  Lucky Lightning
  Lucky Monkey
  Lucky Mouse
  Lucky New Year
  Lucky Ox
  Lucky Panda
  Lucky Phoenix
  Lucky Tiger
  Lucky Tiger 1000
  Lucky Tiger Gold
  Lucky’s Wild Pub
  Lucy Luck and the Quest for Coins
  Lucy Luck and the Temple of Mysteries
  Luxor of Cleopatra
  Madame Destiny
  Madame Destiny Megaways
  Mafia Clash
  Magic Crystals
  Magic Journey
  Magic Money Maze
  Magic Piggy
  Magic Piggy OG
  Magician's Secrets
  Mahjong Wins Super Scatter
  Mahjong Wins Triple Pot
  Majestic Express - Gold Run
  Mammoth Gold Megaways
  Manhattan Goes Wild
  Marlin Masters
  Marlin Masters OG
  Marlin Masters: Atlantis
  Marlin Masters: The Big Haul
  Master Chen's Fortune
  Master Gems
  Master Joker
  Max Win Machine
  Mayan Magic Wildfire
  Mayan Stackways
  Medusa's Stone
  Mega Baccarat
  Mega Roulette
  Mega Sic Bac
  Mega Sic Bo
  Mega Wheel
  Mental
  Mental 2
  Merlin's Alchemy
  Merlin's Fortune
  Merlin's Mania
  Mermaid's Treasure Trove
  Miami Mayhem
  Miami Multiplier
  Might of Freya Megaways
  Might of Ra
  Mighty Kong
  Mighty Masks
  Mighty Munching Melons
  Milky Ways
  Mining Rush
  Misery Mining
  Mochimon
  Moleionaire
  Money Blitz
  Money Jar 2
  Money Mouse
  Money Stacks Megaways
  Money Time
  Monkey Madness
  Monkey Warrior
  Monkey's Gold: xPays
  Monster Superlanche
  Mr Null's Wicked Wares
  Muertos Multiplier Megaways
  Mummy's Jewels
  Mummy's Jewels 100
  Munchies
  Munchy Milo
  Mustang Gold
  Mustang Gold Megaways
  Mustang Trail
  Mutagenes
  Mysterious
  Mysterious Egypt
  Mystery Bats
  Mystery Mice
  Mystery Motel
  Mystery of the Orient
  Mystic Chief
  Mystic Wishes
  Nile Fortune
  Nine to Five
  Nitro Nights
  North Guardians
  Octo Attack
  Octobeer Fortunes
  Office Party
  Oktoberfest
  Old Gun
  Olympus Wins
  OmNom
  ONE Blackjack
  Oodles of Noodles
  Oops
  Oracle of Gold
  Orb of Destiny
  Orphan Organ
  Out of the Woods
  Outlaws Inc
  Outsourced
  Outsourced 2
  Outsourced: Payday
  Outsourced: Slash Game
  Owls
  Panda Fortune 2
  Panda Gold 10 000
  Panda's Fortune
  Pandemic Rising
  Panther Queen
  Paper Biker
  Peak Power
  Peaky Blinders
  Pearl Harbor
  Peking Luck
  Penguins Christmas Party Time
  Peppe's Pepperoni Pizza Plaza
  Phoenix DuelReels
  Phoenix Forge
  Pickle Bandits
  Pig Farm
  Piggy Bank Bills
  Piggy Bankers
  Piggy Cluster Hunt
  Pinup Girls
  Pirate Bonanza
  Pirate Bonanza 2
  Pirate Gold
  Pirate Gold Deluxe
  Pirate Golden Age
  Pirates Pub
  Pixie Wings
  Pixies vs Pirates
  PIZZA! PIZZA? PIZZA!
  Plushie Wins
  Poison Eve
  Pompeii Megareels Megaways
  Possessed
  Pot of Fortune
  Power of Merlin Megaways
  Power of Ten
  Power of Thor Megaways
  Power Pops
  PowerUP Roulette
  Pray For Six
  Pray for Three
  Preach TV
  Pub Kings
  Pug Life
  Punk Rocker
  Punk Rocker 2
  Punk Rocker 3
  Punk Toilet
  Pyramid King
  Pyrofox
  Queen of Atlantis
  Queen of Gods
  Queen of Gold
  Queenie
  Rabbit Garden
  Rad Maxx
  Raging Riches
  Raging Waterfall Megaways
  Ragnarok
  Rainbow Gold
  Rainbow Princess
  Rainbow Reels
  Rainbow Rush
  Rat Riches
  Red Hot Luck
  Red Rascal
  Reel Banks
  Reign of Rome
  Release the Bison
  Release the Kraken
  Release the Kraken 2
  Release the Kraken Megaways
  Remember Gulag
  Resurrecting Riches
  Return of the Dead
  Revenge of Loki Megaways
  Ride The Lightning
  RIP City
  Ripe Rewards
  Rise of Giza PowerNudge
  Rise of Pyramids
  Rise of Ymir
  Road Rage
  RoadKill
  Roadquake
  Rock Bottom
  Rock Vegas
  Rocket Blast Megaways
  Rocket Reels
  Rolling in Treasures
  Roman Glory
  Ronin Stackways
  Rotten
  Roulette
  Running Sushi
  Rusty & Curly
  Safari King
  Samurai Code
  San Quentin
  San Quentin 2: Death Row
  San Quentin Manhunt
  Sanatorium Secrets
  Sand and Ashes
  Sands of Eternity
  Sands of Eternity 2
  Santa
  Santa's Great Gifts
  Santa's Wonderland
  Santa's Xmas Rush
  Savannah Legend
  Scratch 'Em
  Seamen
  Season of Fortune
  Secret City Gold
  Serial
  Sew
  Shadow of Dominion
  Shadow Strike
  Shaolin Master
  Shark Frenzy
  Sheeple
  Shield of Sparta
  Shining Hot 100
  Shining Hot 20
  Shining Hot 40
  Shining Hot 5
  SixSixSix
  Skate Or Die
  Sky Bounty
  Slayers Inc
  Sleeping Dragon
  Sleeping Dragon Ultra Dark
  Sleepy Grandpa
  Smoking Dragon
  Smugglers Cove
  Snakes & Ladders
  Snakes & Ladders 2 - Snake Eyes
  Snakes and Ladders Megadice
  Snow Party
  Snow Scratcher
  Snow Slingers
  Soaked By Seamen
  Space Donkey
  Space Zoo
  Spaceman
  Spartan King
  Spear of Athena
  Spellbinding Mystery
  Spellmaster
  Spin & Score Megaways
  Spinman
  Spirit of Adventure
  Spooky Scary Scratchy
  Stack 'Em
  Stack'Em Scratch
  Star Bounty
  Star Pirates Code
  Star Struck
  Starlight Christmas
  Starlight Princess
  Starlight Princess 1000
  Starlight Princess Pachi
  Starlight Princess Super Scatter
  Starlight Wins
  Starz Megaways
  Steamin' Reels
  Steamrunners
  Stick 'Em
  Sticky Bees
  Stockholm Syndrome
  Stormborn
  Stormforged
  Strawberry Cocktail
  Street Racer
  Strength of Hercules
  Striking Hot 5
  Suck
  Sugar Rush
  Sugar Rush 1000
  Sugar Rush Super Scatter
  Sugar Rush Xmas
  Sugar Supreme Powernudge
  Summer Scratch
  Sumo Supreme Megaways
  Sun Princess
  Sunnydaze Asylum
  Super 7s
  Super Fruit Smash
  Super Gummy Strike
  Super Joker
  Super Serge
  Super Tiki Strike
  Super Trunfo
  Super Twins
  Super X
  Supersized
  Superstar Sevens
  Supreme Zeus
  Sweet Bonanza
  Sweet Bonanza 1000
  Sweet Bonanza 2500
  Sweet Bonanza Candyland
  Sweet Bonanza Dice
  Sweet Bonanza Super Scatter
  Sweet Bonanza Xmas
  Sweet Burst
  Sweet Craze
  Sweet Kingdom
  Sweet Powernudge
  Sweet Rush Bonanza
  Sweet Spotz
  Swoll
  Sword of Ares
  Tai the Toad
  Tango of Chaos
  Tanked
  Tanked 3: First Blood 2
  Tasty Treats
  Temple Guardians
  Temple of Torment
  Temujin Treasures
  Tesla Jolt
  The Alter Ego
  The Amazing Money Machine
  The Big Dawgs
  The Big Dog House
  The Border
  The Cage
  The Champions
  The Count
  The Creepy Carnival
  The Crypt
  The Crypt 2
  The Cursed King
  The Dog House
  The Dog House - Dog or Alive
  The Dog House - Royal Hunt
  The Dog House Dice Show
  The Dog House Megaways
  The Dog House Megaways 1000
  The Dog House Multihold
  The Dog House – Muttley Crew
  The Great Chicken Escape
  The Great Stick-Up
  The Hand of Midas
  The Knight King
  The Luxe
  The Magic Cauldron - Enchanted Brew
  The Money Men Megaways
  The Perfect Scratch
  The Rave
  The Red Queen
  The Respinners
  The Ultimate 5
  The Wild Gang
  The Wild Machine
  The Wildwood Curse
  Thor: Hammer Time
  Three Samurai
  Three Star Fortune
  Tic Tac Take
  Tiki Thunder
  Timber Stacks
  Time Spinners
  Tiny Toads
  Toad Town
  Tomb of Akhenaten
  Tomb of Nefertiti
  Tombstone
  Tombstone Begins
  Tombstone No Mercy
  Tombstone R.I.P.
  Tombstone Slaughter: El Gordo’s Revenge
  Toshi Video Club
  Toshi Ways Club
  Towering Fortunes
  Tractor Beam
  Trap Tower
  Treasure Horse
  Treasure Wild
  Treasures of Osiris
  Tree of Riches
  Trees of Treasure
  Triple Dragons
  Triple Jokers
  Triple Pot Diamond
  Triple Pot Gold
  Triple Pot Plinko - Hercules
  Triple Tigers
  Tropical Tiki
  True Grit Redemption
  True Grit Redemption 2
  True Kult
  Truth
  Tsar Wars
  Tundra’s Fortune
  Tut's Treasure Tower
  Twilight Princess
  Twisted Lab
  Tyrant's Fall
  Ugliest Catch
  Ultimate Slot of America
  Ultra Burn
  Ultra Fruit Smash
  Ultra Hold and Spin
  Undead Fortune
  Valhalla: Wild Winter
  Vampires vs Wolves
  Vampy Party
  Vegas Ball Bonanza
  Vegas Magic
  Vegas Nights
  Vending Machine
  Viking Forge
  Volcano Goddess
  Voodoo Magic
  Walk Of Shame
  Wanted Dead or a Wild
  Warrior Graveyard
  Warrior Ways
  Waves Of Poseidon
  Wealthy Frog
  Whacked!
  Wheel O'Gold
  Wheel of Happiness
  Wild Beach Party
  Wild Bison Charge
  Wild Bison Stampede
  Wild Booster
  Wild Depth
  Wild Dojo Strike
  Wild Gladiators
  Wild Hop & Drop
  Wild Pixies
  Wild Skullz
  Wild Spells
  Wild Walker
  Wild West Duels
  Wild West Gold
  Wild West Gold Blazing Bounty
  Wild West Gold Megaways
  Wild Wild Bananas
  Wild Wild Joker
  Wild Wild Pearls
  Wild Wild Riches
  Wild Wild Riches Megaways
  Wild Wild Riches Returns
  Wild Wildebeest Wins
  Wildhalla
  Wildies
  Wings of Horus
  Wisdom of Athena
  Wisdom of Athena 1000
  Wisdom of Athena 1000 Xmas
  Wishbringer
  Witch Heart Megaways
  Wixx
  Wolf Gold
  Wolf Gold 4 Pack
  Wolf Gold Ultimate
  Xmas Drop
  Xpander
  xWays Hoarder 2
  xWays Hoarder xSplit
  Year of the Dragon King
  Yeti Quest
  You Can Piggy Bank On It
  Yum Yum Powerways
  Ze Zeus
  Zeus vs Hades - Gods of War
  Zeus vs Hades – Gods of War 250
  Zeus vs Typhon
  Zeus Ze Zecond
  Zombie Carnival
  Zombie Dawgs
  Zombie School Megaways
`
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
))

const STEPS = [
  {
    title: 'Chat gets picked',
    desc: 'A viewer is pulled from chat — they become the challenger.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
  {
    title: 'Slots locked in',
    desc: 'A viewer and FinBuck get their slots picked randomly.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
      </svg>
    ),
  },
  {
    title: 'Spin it out',
    desc: 'Both run live at the same bet. Highest multiplier takes it.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.306a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
  },
  {
    title: 'Winner takes it',
    desc: 'If chat wins → the prize is paid out on stream.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
      </svg>
    ),
  },
]

interface Fighter {
  role: string
  /** This side's colour: green for the house, violet for chat. */
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
}

const smallCut = 'polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)'
const btnCut = 'polygon(9px 0,100% 0,100% calc(100% - 9px),calc(100% - 9px) 100%,0 100%,0 9px)'

function FighterCard({ f, winner, onWin }: { f: Fighter; winner: boolean | null; onWin: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const glow = winner === true
  const handle = (file?: File) => { if (file) f.setImg(URL.createObjectURL(file)) }

  return (
    <div
      className="w-full transition-all duration-300"
      style={{ filter: glow ? `drop-shadow(0 0 26px ${f.color}80)` : 'none', opacity: winner === false ? 0.6 : 1 }}
    >
      <Panel innerClassName="flex flex-col items-center p-6 text-center sm:p-7">
        {/* This side's colour, as a lit edge along the top */}
        <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[3px]" style={{ background: `linear-gradient(90deg, transparent, ${f.color}, transparent)` }} />

        <p className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: f.color }}>{f.role}</p>

        {/* Avatar: click or drop to replace */}
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handle(e.dataTransfer.files?.[0]) }}
          className="mt-4 flex h-28 w-28 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-[#080A20] sm:h-32 sm:w-32"
          style={{ boxShadow: `0 0 0 3px #0B0E2A, 0 0 0 5px ${f.color}` }}
          title="Click or drop an image"
        >
          {f.img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={f.img}
              alt=""
              className="h-full w-full object-cover"
              style={{ transform: `translate(${f.nudge?.x ?? 0}%, ${f.nudge?.y ?? 0}%) scale(${f.zoom ?? 1})` }}
            />
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-10 w-10 text-faint">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          )}
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handle(e.target.files?.[0] ?? undefined)} />
        </div>

        {/* Name */}
        <input
          value={f.name}
          onChange={(e) => f.setName(e.target.value)}
          aria-label="Name"
          className="font-display mt-4 w-full truncate bg-transparent text-center text-[2rem] leading-none text-white focus:outline-none"
        />

        {/* Slot */}
        <label className="mt-4 block w-full">
          <span className="block text-[10px] font-bold uppercase tracking-[0.3em] text-faint">Slot</span>
          <input
            value={f.slot}
            onChange={(e) => f.setSlot(e.target.value)}
            placeholder="—"
            className="field mt-2 !h-11 text-center text-sm font-bold"
          />
        </label>

        {/* Declare this side the winner */}
        <button
          type="button"
          onClick={onWin}
          className="mt-5 flex h-11 w-full items-center justify-center text-sm font-bold uppercase tracking-[0.12em] transition-[transform,filter] hover:-translate-y-px active:translate-y-px"
          style={{
            clipPath: btnCut,
            background: winner === true ? f.color : `${f.color}1F`,
            color: winner === true ? '#0B0E2A' : f.color,
            boxShadow: winner === true ? `0 0 24px ${f.color}66` : 'none',
          }}
        >
          {winner === true ? 'Winner' : 'Declare winner'}
        </button>
      </Panel>
    </div>
  )
}

export default function VsChatPage() {
  // Fighters
  const [houseImg, setHouseImg] = useState('/finbuck-avatar.webp')
  const [houseName, setHouseName] = useState('FinBuck')
  const [houseSlot, setHouseSlot] = useState('')

  const [chatImg, setChatImg] = useState('/deer.webp')
  const [chatName, setChatName] = useState('Chat')
  const [chatSlot, setChatSlot] = useState('')


  // Set while a round has a declared winner, and cleared by Reset. The board is
  // deliberately left standing in between — both slots and the winning card stay
  // visible until Reset, which is also what turns Randomize back from Reset.
  const [outcome, setOutcome] = useState<'chat' | 'house' | null>(null)

  // Running score, persisted so it survives a refresh. Starts at 0-0 on the
  // server/first paint, then loads whatever was saved once the page mounts —
  // that one-time swap avoids a server/client hydration mismatch.
  const SCORE_KEY = 'vschat-score'
  const [score, setScore] = useState({ house: 0, chat: 0 })
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SCORE_KEY)
      if (saved) setScore(JSON.parse(saved))
    } catch {
      /* localStorage unavailable — score just won't persist */
    }
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem(SCORE_KEY, JSON.stringify(score))
    } catch {
      /* ignore */
    }
  }, [score])

  // Declared rounds, newest last, so Undo can put a point back and restore the
  // slots that were in play. Stored under its own key rather than folded into
  // the score, so scores saved by an earlier version still load. Persisted for
  // the same reason the score is: a refresh mid-stream shouldn't cost you the
  // ability to correct a misclick.
  const HISTORY_KEY = 'vschat-history'
  const HISTORY_MAX = 50
  type Round = { side: 'house' | 'chat'; houseSlot: string; chatSlot: string }
  const [history, setHistory] = useState<Round[]>([])
  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY)
      if (saved) setHistory(JSON.parse(saved))
    } catch {
      /* ignore */
    }
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
    } catch {
      /* ignore */
    }
  }, [history])

  // Declaring scores the point and immediately clears the board for the next
  // battle. The winner banner is left showing until the next roll, so you can
  // still see who took the round after the slots have gone.
  function declareWinner(side: 'house' | 'chat') {
    // Already declared for this side — pressing again must not score twice.
    // Reset ends the round before the next point can be awarded.
    if (outcome === side) return

    if (outcome) {
      // Switching sides before Reset reads as correcting a misclick, so move
      // the point across rather than awarding a second one. The last history
      // entry is rewritten in place so Undo still walks back a single round.
      const prev = outcome
      setScore((s) => ({ ...s, [prev]: Math.max(0, s[prev] - 1), [side]: s[side] + 1 }))
      setHistory((h) => (h.length ? [...h.slice(0, -1), { ...h[h.length - 1], side }] : h))
      setOutcome(side)
      return
    }

    setScore((s) => ({ ...s, [side]: s[side] + 1 }))
    setHistory((h) => [...h, { side, houseSlot, chatSlot }].slice(-HISTORY_MAX))
    if (timerRef.current) clearTimeout(timerRef.current)
    setRolling(false)
    setOutcome(side)
  }

  // Clears the board for the next battle. The running score is untouched — only
  // Undo takes a point back.
  function resetRound() {
    if (timerRef.current) clearTimeout(timerRef.current)
    setRolling(false)
    setDisplay('Ready to roll')
    setLanded('')
    setOutcome(null)
    setHouseSlot('')
    setChatSlot('')
  }

  // Walks back the last declaration: takes the point off, restores that round's
  // two slots, and clears the banner.
  function undoLastRound() {
    const last = history[history.length - 1]
    if (!last) return
    if (timerRef.current) clearTimeout(timerRef.current)
    setRolling(false)
    setDisplay('Ready to roll')
    setLanded('')
    setScore((s) => ({ ...s, [last.side]: Math.max(0, s[last.side] - 1) }))
    setHouseSlot(last.houseSlot)
    setChatSlot(last.chatSlot)
    setHistory((h) => h.slice(0, -1))
    setOutcome(null)
  }

  function resetScore() {
    setScore({ house: 0, chat: 0 })
    setHistory([])
    setOutcome(null)
  }

  const house: Fighter = { role: 'The house', color: HOUSE, img: houseImg, setImg: setHouseImg, name: houseName, setName: setHouseName, slot: houseSlot, setSlot: setHouseSlot }
  const chat: Fighter = { role: 'Challenger · from chat', color: CHAT, img: chatImg, setImg: setChatImg, name: chatName, setName: setChatName, slot: chatSlot, setSlot: setChatSlot }

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
    // Clear the previous round's winner banner as the next roll starts.
    setOutcome(null)
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

  const isWin = outcome === 'chat' || outcome === 'house'
  const winColor = outcome === 'house' ? HOUSE : CHAT

  return (
    <div className="px-6 pb-24 pt-[72px]">
      <PageHeader eyebrow="Live slot duel" live title={<>Slot <span className="text-accent-bright">battles</span></>}>
        A viewer takes on the house. Both spin a slot — highest multiplier wins. Beat FinBuck, take the prize.
      </PageHeader>

      {/* Running score — persisted in this browser only, survives a refresh */}
      <Reveal>
        <div className="mt-8 flex justify-center">
          <Panel innerClassName="flex items-center gap-6 px-7 py-4">
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: HOUSE }}>FinBuck</p>
              <p className="font-display text-[2.6rem] leading-none tabular-nums" style={{ color: HOUSE }}>{score.house}</p>
            </div>
            <span className="h-8 w-px bg-white/10" />
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: CHAT }}>Chat</p>
              <p className="font-display text-[2.6rem] leading-none tabular-nums" style={{ color: CHAT }}>{score.chat}</p>
            </div>
            <button
              type="button"
              onClick={resetScore}
              title="Reset score to 0-0"
              className="ml-1 text-faint transition-colors hover:text-red-300"
              aria-label="Reset score"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </button>
          </Panel>
        </div>
      </Reveal>

      {/* Random slot picker */}
      <Reveal>
        <div className="mx-auto mt-14 max-w-xl">
          <p className="mx-auto flex max-w-xs items-center justify-center gap-3 text-[11px] font-bold uppercase tracking-[0.3em] text-accent-bright">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-accent/50" />
            <span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-accent" />
            <span className="whitespace-nowrap">Random slot picker</span>
            <span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-accent" />
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-accent/50" />
          </p>

          <Panel tone={landed ? 'accent' : 'default'} className="mt-6" innerClassName="flex min-h-[140px] items-center justify-center px-6 py-10 text-center">
            <span
              className={`font-display break-words text-[2.2rem] leading-[0.95] sm:text-[2.8rem] ${
                rolling ? 'text-white/70' : landed ? 'text-accent-bright [text-shadow:0_0_30px_rgba(0,255,135,0.35)]' : 'text-faint'
              }`}
            >
              {display}
            </span>
          </Panel>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Button
              onClick={outcome ? resetRound : randomize}
              disabled={!outcome && (rolling || pool.length < 2)}
              variant={outcome ? 'ghost' : 'primary'}
              title={outcome ? 'Clear the board for the next battle — the score is kept' : undefined}
              className="min-w-[150px]"
            >
              {outcome ? 'Reset' : rolling ? 'Rolling…' : 'Randomize'}
            </Button>
            <Button
              onClick={undoLastRound}
              disabled={history.length === 0}
              variant="ghost"
              title={
                history.length
                  ? 'Undo the last declared winner — takes the point back and restores that round’s slots'
                  : 'Nothing to undo yet'
              }
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="h-4 w-4" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 14L4 9l5-5" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 9h11a5 5 0 010 10h-3" />
              </svg>
              Undo
            </Button>
            {landed && !rolling && (
              <>
                <Button onClick={() => setHouseSlot(landed)} variant="outline" size="sm">→ FinBuck</Button>
                <button
                  type="button"
                  onClick={() => setChatSlot(landed)}
                  className="inline-flex h-10 items-center justify-center px-4 text-sm font-bold transition-[transform,background-color] hover:-translate-y-px"
                  style={{ clipPath: btnCut, background: `${CHAT}1F`, color: CHAT }}
                >
                  → Chat
                </button>
              </>
            )}
          </div>
        </div>
      </Reveal>

      {/* Arena */}
      <Reveal>
        <div className="mx-auto mt-14 max-w-4xl">
          <div className="flex flex-col items-center justify-center gap-4 md:flex-row md:items-stretch md:gap-6">
            <div className="w-full max-w-[340px] md:flex-1">
              <FighterCard f={house} winner={outcome ? outcome === 'house' : null} onWin={() => declareWinner('house')} />
            </div>

            {/* VS emblem — floats gently */}
            <div className="relative z-10 -my-2 flex shrink-0 items-center justify-center md:my-0">
              <span
                className="vs-float font-display flex h-20 w-20 items-center justify-center bg-[#080A20] text-[2.4rem] leading-none text-white shadow-[0_20px_40px_rgba(0,0,0,0.45)]"
                style={{ clipPath: smallCut, textShadow: `0 0 18px ${HOUSE}66` }}
                aria-label="versus"
              >
                VS
              </span>
            </div>

            <div className="w-full max-w-[340px] md:flex-1">
              <FighterCard f={chat} winner={outcome ? outcome === 'chat' : null} onWin={() => declareWinner('chat')} />
            </div>
          </div>

          {/* Outcome banner — in the winner's own colour */}
          <div
            className="mt-5 flex flex-wrap items-center justify-center gap-4 px-6 py-4 text-center transition-all"
            style={{
              clipPath: smallCut,
              background: isWin ? `${winColor}14` : 'rgba(255,255,255,0.04)',
              boxShadow: isWin ? `inset 0 0 0 1px ${winColor}66, 0 0 28px ${winColor}33` : 'inset 0 0 0 1px rgba(255,255,255,0.08)',
            }}
          >
            {outcome === 'chat' && (
              <span className="font-display text-[1.6rem] leading-none" style={{ color: winColor, textShadow: `0 0 16px ${winColor}66` }}>
                🏆 Cash money AP for {chatName}
              </span>
            )}
            {outcome === 'house' && (
              <span className="font-display text-[1.6rem] leading-none" style={{ color: winColor, textShadow: `0 0 16px ${winColor}66` }}>
                🏆 More keno money for Fin!
              </span>
            )}
            {!outcome && (
              <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-accent-bright">
                Tap a card to declare the winner
              </span>
            )}
          </div>
        </div>
      </Reveal>

      {/* How it works */}
      <Reveal>
        <div className="mx-auto mt-24 max-w-5xl">
          <SectionHeading eyebrow="How it works" title={<>Four steps to a <span className="text-accent-bright">battle</span></>} className="mb-10" />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <Panel key={i} innerClassName="flex h-full flex-col p-6">
                <div className="flex items-start justify-between">
                  <span className="flex h-11 w-11 items-center justify-center bg-[#0B0E2A] text-accent-bright" style={{ clipPath: smallCut }}>
                    {s.icon}
                  </span>
                  <span className="font-display text-[1.4rem] leading-none text-faint">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <h3 className="font-display mt-5 text-[1.6rem] leading-none text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.desc}</p>
              </Panel>
            ))}
          </div>
        </div>
      </Reveal>
    </div>
  )
}
