# ⚔️ PokéBattle Arena

A turn-based Pokémon battle game built with **React**, **Tailwind CSS**, and pure **Object-Oriented JavaScript**. Features animated battle sprites, smart CPU AI, canvas visual effects, sound effects, and win streak tracking.

---

## 🎮 Features

- **Turn-Based Combat:** Tactical action deck with Weak Attack, Strong Special Attack, Guard Stance, and Energy Charging.
- **Smart CPU Opponent:** An AI opponent that calculates lethal damage ranges, manages its stamina, and guards when its HP is critically low.
- **Live PokéAPI Integration:** Fetches animated Gen-5 Black/White GIF sprites from PokéAPI with an offline fallback so the game never breaks.
- **Canvas Visual Effects:** Dynamic background featuring 60 FPS floating embers, procedural lightning strikes, and retro CRT scanlines.
- **Web Audio Sound Effects:** Arcade-style sound effects synthesized directly in code using the browser's native Web Audio API (no external MP3 files needed).
- **Persistent Win Streaks:** Keeps track of current win streak and personal best records using `localStorage`.
- **Keyboard Controls:** Play the entire battle using hotkeys (`1` for Weak, `2` for Strong, `3` for Guard, `4` for Charge, and `Enter` on menus).
- **Mobile Responsive:** Clean dark mode layout optimized for phones, tablets, and desktop screens.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, React Router v7, Vite
- **Styling:** Tailwind CSS, Lucide Icons
- **APIs & Web Standards:** PokéAPI, HTML5 Canvas API, Web Audio API, Web Storage API (`localStorage`)
- **Architecture:** Decoupled OOP domain model (`Pokemon.js`) + React UI layer

---

## 📂 Project Structure

```text
pokebattle/
├── src/
│   ├── classes/
│   │   └── pokemon.js          # Pure OOP Pokemon class (combat math, damage, CPU AI)
│   ├── components/
│   │   ├── BackgroundFX.jsx    # HTML5 Canvas particles & procedural lightning
│   │   ├── BattleLog.jsx       # Auto-scrolling battle event feed
│   │   ├── DamageNumber.jsx    # Floating RPG combat numbers
│   │   ├── GameOverModal.jsx   # Victory / Defeat screen & match recap
│   │   ├── Navbar.jsx          # Header with win streak counter and sound toggle
│   │   ├── PokemonCard.jsx     # Selection card with stats and animated sprite
│   │   └── StatBar.jsx         # Dynamic HP and Energy progress bars
│   ├── context/
│   │   └── GameContext.jsx     # Global state for selected fighters & localStorage streaks
│   ├── hooks/
│   │   └── usePokemonData.js   # Custom hook fetching PokéAPI sprites and data
│   ├── pages/
│   │   ├── Landing.jsx         # Home landing page with stats ribbon
│   │   ├── Select.jsx          # Character roster selection screen
│   │   └── Battle.jsx          # Main combat arena controller
│   ├── utils/
│   │   └── audio.js            # Web Audio API retro sound synthesis
│   ├── App.jsx                 # Routing and layout setup
│   └── index.css               # Design tokens, animations, and CRT scanlines
├── vercel.json                 # SPA client-side routing rewrites
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js (v18+) installed on your machine.

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/pokebattle.git
cd pokebattle
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

4. Build for production:
```bash
npm run build
```

---

## 💡 How It Works (Interview Cheat Sheet)

### 1. Why decouple `Pokemon.js` into an OOP Class?
Instead of putting all the battle math inside React state, the combat engine is written as a pure JavaScript ES6 class (`Pokemon.js`).
- **Separation of Concerns:** Business logic (damage variance, defense reduction, energy checks, CPU moves) is kept separate from UI rendering.
- **Portability & Testing:** The class can be tested directly in Node.js or easily moved to a backend server.

### 2. Why use `useRef` for Pokemon instances in `Battle.jsx`?
During combat, Pokémon objects change often (HP drops, energy charges, guard flags toggle).
- If we put the whole `Pokemon` instance in `useState`, mutating its properties won't trigger re-renders due to shallow comparison, and re-instantiating the whole object every turn causes unnecessary re-renders.
- Storing the instance in `useRef` preserves the object across renders. We only sync lightweight numbers (`playerHp`, `playerEnergy`, `turn`) to `useState` to update the health bars smoothly at 60 FPS.

### 3. How does the CPU AI decide what move to make?
In `Pokemon.js`, the `getComputerMove()` function uses a decision tree:
1. **Lethal Strike:** If the CPU has enough energy for a Strong Attack and it will knock out the player, it uses it immediately.
2. **Quick Finish:** If a Weak Attack can finish the player off, it attacks.
3. **Emergency Guard:** If CPU health is under 25% and the player has high energy, it guards or charges.
4. **Stamina Recovery:** If energy is too low for a strong attack, it prioritizes charging.
5. **Weighted Random:** Otherwise, it plays aggressively (60% strong attacks, 25% weak, 15% guard).

### 4. Why use the Web Audio API for sound?
Instead of loading external `.mp3` files that could fail to load or add network delay, `src/utils/audio.js` uses the browser's native `AudioContext` to generate retro synth tones (sine, sawtooth, and triangle waves). This means zero network bandwidth and instant audio triggers.

---

## 📝 License
This project is open source and available under the [MIT License](LICENSE).
*(Pokémon and Pokémon character names are trademarks of Nintendo / Creatures Inc. / GAME FREAK).*
