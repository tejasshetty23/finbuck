'use client'

import { useState, useRef, useEffect } from 'react'

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

/** Reusable avatar with drag-drop / click-to-upload. */
// Frame aspect + overlay regions (percentages of the frame box), tuned to the
// neon frame artwork so content sits inside the circle / name bar / slot boxes.
// Positions are percentages of the frame box, measured from the artwork by
// scanning for its neon lines. The avatar sits just inside the ring and the
// frame renders on top, so the ring always draws cleanly over the photo's edge.
// The artwork carries no text — SLOT/WINNER are drawn as HTML so they stay
// editable and can never desync from the image.
type Region = {
  ar: number
  avatar: { x: number; y: number; size: number }
  name: { x: number; y: number; w: number }
  slot: { x: number; y: number; w: number }
  win: { x: number; y: number; w: number }
  slotLabelY: number
}
const REGION_GREEN: Region = {
  ar: 659 / 1024,
  avatar: { x: 50, y: 23.3, size: 32 },
  name: { x: 50, y: 39.2, w: 55 },
  slot: { x: 50, y: 54.7, w: 66 },
  win: { x: 50, y: 77.6, w: 60 },
  slotLabelY: 44.8,
}
const REGION_PURPLE: Region = {
  ar: 664 / 1024,
  avatar: { x: 50, y: 23.3, size: 32 },
  name: { x: 50, y: 39.2, w: 55 },
  slot: { x: 50, y: 54.7, w: 66 },
  win: { x: 50, y: 77.6, w: 60 },
  slotLabelY: 44.8,
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
  /** Fill for this side's winner button. */
  gradient: string
}

function FighterCard({ f, frameSrc, fillSrc, region, winner, onWin }: { f: Fighter; frameSrc: string; fillSrc: string; region: Region; winner: boolean | null; onWin: () => void }) {
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
        style={{ left: `${region.slot.x}%`, top: `${region.slot.y}%`, width: `${region.slot.w}%`, fontSize: fitFont(f.slot, 18, 14, 2.8, 22) }}
      />

      {/* Section label, drawn as HTML so it stays editable and can never
          desync from the artwork. */}
      <span
        className="absolute -translate-x-1/2 -translate-y-1/2 font-bold uppercase pointer-events-none select-none"
        style={{
          left: '50%',
          top: `${region.slotLabelY}%`,
          color: f.color,
          fontSize: 'clamp(9px, 1.3vw, 12px)',
          letterSpacing: '0.25em',
        }}
      >
        Slot
      </span>

      {/* Declare this side the winner — chamfered badge to match the frame's
          own cut-corner boxes, instead of a plain rounded rectangle. */}
      <button
        onClick={onWin}
        className="absolute -translate-x-1/2 -translate-y-1/2 group transition-transform hover:scale-[1.03] active:scale-[0.97]"
        style={{ left: `${region.win.x}%`, top: `${region.win.y}%`, width: `${region.win.w}%` }}
      >
        {/* Gradient border ring */}
        <div
          className="relative transition-all duration-300"
          style={{
            clipPath: 'polygon(13px 0%, 100% 0%, 100% calc(100% - 13px), calc(100% - 13px) 100%, 0% 100%, 0% 13px)',
            background: `linear-gradient(135deg, ${f.color}, ${f.color}88)`,
            padding: '2px',
            boxShadow: winner === true ? `0 0 24px ${f.color}` : 'none',
            opacity: winner === false ? 0.5 : 1,
          }}
        >
          {/* Fill */}
          <div
            className="flex items-center justify-center font-black uppercase tracking-widest transition-all duration-300"
            style={{
              clipPath: 'polygon(11px 0%, 100% 0%, 100% calc(100% - 11px), calc(100% - 11px) 100%, 0% 100%, 0% 11px)',
              background: winner === true ? f.gradient : `linear-gradient(160deg, ${f.color}14 0%, #07050a 70%)`,
              color: winner === true ? '#08060f' : f.color,
              paddingTop: '0.65rem',
              paddingBottom: '0.65rem',
              fontSize: 'clamp(11px, 1.6vw, 14px)',
            }}
          >
            {winner === true ? 'Winner' : 'Declare winner'}
          </div>
        </div>
      </button>
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


  // Winner is declared with the button on each card. Declaring scores the point
  // and clears the board for the next battle in one action; Undo walks it back.
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
    setScore((s) => ({ ...s, [side]: s[side] + 1 }))
    setHistory((h) => [...h, { side, houseSlot, chatSlot }].slice(-HISTORY_MAX))
    if (timerRef.current) clearTimeout(timerRef.current)
    setRolling(false)
    setDisplay('Ready to roll')
    setLanded('')
    setHouseSlot('')
    setChatSlot('')
    setOutcome(side)
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

  const house: Fighter = { role: 'The House', color: '#00ff87', gradient: 'linear-gradient(135deg, #00ff87, #4ade80, #00c96a)', img: houseImg, setImg: setHouseImg, name: houseName, setName: setHouseName, slot: houseSlot, setSlot: setHouseSlot }
  const chat: Fighter = { role: 'Challenger · from chat', color: '#a855f7', gradient: 'linear-gradient(135deg, #c084fc, #a855f7, #7c3aed)', img: chatImg, setImg: setChatImg, name: chatName, setName: setChatName, slot: chatSlot, setSlot: setChatSlot }

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
        <p className="text-gray-500 text-base max-w-lg mx-auto mb-6">
          A viewer takes on the house. Both spin a slot — highest multiplier wins. Beat FinBuck, take the prize.
        </p>

        {/* Running score — persisted in this browser only, survives a refresh */}
        <div className="inline-flex items-center gap-5 rounded-xl border border-purple-900/40 bg-[#0d0a1a]/70 px-6 py-3">
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#00ff87' }}>FinBuck</p>
            <p className="text-3xl font-black" style={{ color: '#00ff87' }}>{score.house}</p>
          </div>
          <span className="text-gray-600 font-black text-lg">—</span>
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-purple-300">Chat</p>
            <p className="text-3xl font-black text-purple-300">{score.chat}</p>
          </div>
          <button
            onClick={resetScore}
            title="Reset score to 0-0"
            className="ml-2 text-gray-600 hover:text-red-400 transition-colors"
            aria-label="Reset score"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>
        </div>
      </div>

      {/* Random slot picker */}
      <div className="max-w-5xl mx-auto mb-6">
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
              <button
                onClick={undoLastRound}
                disabled={history.length === 0}
                title={
                  history.length
                    ? 'Undo the last declared winner — takes the point back and restores that round’s slots'
                    : 'Nothing to undo yet'
                }
                className="inline-flex items-center gap-1.5 border border-purple-500/50 text-purple-300 hover:bg-purple-500/10 hover:text-white font-bold py-3 px-5 rounded-xl uppercase tracking-widest text-sm transition-all disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-purple-300 disabled:cursor-not-allowed"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 14L4 9l5-5" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 9h11a5 5 0 010 10h-3" />
                </svg>
                Undo
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
          <div className="w-full md:flex-1 max-w-[320px]">
            <FighterCard f={house} frameSrc="/frame2-green.webp" fillSrc="/frame2-green-fill.webp" region={REGION_GREEN} winner={outcome ? outcome === 'house' : null} onWin={() => declareWinner('house')} />
          </div>

          {/* VS emblem — floats gently */}
          <div className="relative flex items-center justify-center shrink-0 -my-6 md:my-0 z-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/vs.webp"
              alt="VS"
              className="vs-float relative w-28 sm:w-36 h-auto select-none pointer-events-none"
            />
          </div>

          <div className="w-full md:flex-1 max-w-[320px]">
            <FighterCard f={chat} frameSrc="/frame2-purple.webp" fillSrc="/frame2-purple-fill.webp" region={REGION_PURPLE} winner={outcome ? outcome === 'chat' : null} onWin={() => declareWinner('chat')} />
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
              className="mt-4 rounded-2xl px-6 py-4 flex flex-wrap items-center justify-center gap-4 transition-colors"
              style={{
                background: isWin ? win.bg : '#0d0a1a99',
                border: isWin ? `1px solid ${win.border}` : '1px solid rgba(168,85,247,0.55)',
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
              {!outcome && (
                <span className="text-sm uppercase tracking-widest font-bold" style={{ color: '#00ff87' }}>
                  Tap a card to declare the winner
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
