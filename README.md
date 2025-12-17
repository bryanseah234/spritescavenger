# Sprite Scavenger

A mobile-first **Idle Collection RPG** built with Next.js. Send your drone on expeditions, collect pixel-art items, unlock biomes, and complete your database.

![App Screenshot](/public/icon.png)

## 🌟 Features

### Core Loop

- **Expeditions**: Send your drone out to scavenge. Expeditions run in the background.
- **Loot Reveal**: Open "packs" of loot with rarity tiers (Common to Legendary).
- **Collection**: Track your discoveries in a visual grid.

### Economy & Progression

- **Bits**: Earn currency by finding duplicate items.
- **Upgrades**: Spend Bits to upgrade your drone:
  - **Speed**: Reduce expedition time.
  - **Multithread**: Gather more items per trip.
  - **Luck**: Increase chance of high-rarity drops.
- **XP & Levels**: Gain XP for every discovery. Level up to show off your rank.

### Advanced Gameplay

- **Biomes**: Unlock new regions (The Pantry, The Wilds, The Workshop, The Mall) to target specific item categories.
- **The Forge**: "Burn" 10 Common items to craft 1 Uncommon item. Clear clutter and climb the rarity ladder.
- **Save Management**: Full Export/Import functionality (Base64 string) to back up your save or move between devices.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State**: React Context + LocalStorage Persistence

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/sprite-scavenger.git
   cd sprite-scavenger
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Run the development server**

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser.

---

## 🚢 Deployment

This project is configured for **Static Export** to ensure optimal performance and compatibility with Vercel's Edge Network (and to solve 404 issues with client-side routing).

### Deploy to Vercel

1. Push your code to GitHub.
2. Import the project into Vercel.
3. The `next.config.ts` is already set to `output: 'export'`.
4. Deploy!

### Build Locally

To verify the production build:

```bash
npm run build
# The 'out' folder now contains the static HTML export
```

---

## ⚡ Performance Optimizations

- **O(1) Lookups**: Item categories are mapped at startup to prevent lag during loot generation.
- **Debounced Saves**: Game state saves to disk at most every 2 seconds to reduce I/O overhead.
- **Lazy Loading**: All item images use `next/image` for optimized loading and format serving.

---

## 📂 Project Structure

- `src/context/GameContext.tsx`: The brain of the game. Manages state, save/load, and economy logic.
- `src/hooks/useExpedition.ts`: Manages the active game loop, timer, and loot generation.
- `src/components/`: Reusable UI components (CollectionGrid, Forge, BiomeSelector, etc.).
- `src/data/biomes.ts`: Configuration for unlockable regions.
- `src/data/master-collection.json`: The database of all collectable items.
