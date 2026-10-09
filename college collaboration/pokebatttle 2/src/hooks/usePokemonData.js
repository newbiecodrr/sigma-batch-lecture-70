import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Pokemon from "@/classes/pokemon";

// Hardcoded base stats config for all 6 playable Pokemon
const POKEMON_CONFIGS = [
  {
    name: "Pikachu",
    id: 25,
    maxHp: 110,
    maxEnergy: 50,
    baseDamage: 28,
    defense: 10,
    strongCost: 18,
    types: ["Electric"],
    moves: { weak: "Thunder Shock", strong: "Volt Tackle" },
    accentColor: "#eab308",
    description: "Fast electric type with high critical strike potential.",
  },
  {
    name: "Charizard",
    id: 6,
    maxHp: 140,
    maxEnergy: 50,
    baseDamage: 32,
    defense: 14,
    strongCost: 22,
    types: ["Fire", "Flying"],
    moves: { weak: "Dragon Claw", strong: "Blast Burn" },
    accentColor: "#f97316",
    description: "Offensive heavy hitter with devastating fire attacks.",
  },
  {
    name: "Blastoise",
    id: 9,
    maxHp: 175,
    maxEnergy: 50,
    baseDamage: 24,
    defense: 22,
    strongCost: 20,
    types: ["Water"],
    moves: { weak: "Water Gun", strong: "Hydro Cannon" },
    accentColor: "#3b82f6",
    description: "High defense tank built to outlast opponents.",
  },
  {
    name: "Venusaur",
    id: 3,
    maxHp: 155,
    maxEnergy: 50,
    baseDamage: 26,
    defense: 18,
    strongCost: 20,
    types: ["Grass", "Poison"],
    moves: { weak: "Vine Whip", strong: "Solar Beam" },
    accentColor: "#22c55e",
    description: "Well balanced fighter with consistent damage output.",
  },
  {
    name: "Gengar",
    id: 94,
    maxHp: 125,
    maxEnergy: 50,
    baseDamage: 34,
    defense: 12,
    strongCost: 19,
    types: ["Ghost", "Poison"],
    moves: { weak: "Shadow Sneak", strong: "Shadow Ball" },
    accentColor: "#a855f7",
    description: "Ghost type with high attack and unpredictable strikes.",
  },
  {
    name: "Mewtwo",
    id: 150,
    maxHp: 165,
    maxEnergy: 50,
    baseDamage: 36,
    defense: 16,
    strongCost: 24,
    types: ["Psychic"],
    moves: { weak: "Psycho Cut", strong: "Psystrike" },
    accentColor: "#ec4899",
    description: "Legendary psychic pokemon with massive raw power.",
  },
];

export function usePokemonData() {
  const [roster, setRoster] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchPokemonData = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);

    try {
      // parallel fetch all pokemon sprites from PokeAPI
      const requests = POKEMON_CONFIGS.map((cfg) =>
        axios
          .get(`https://pokeapi.co/api/v2/pokemon/${cfg.id}`, { timeout: 5000 })
          .catch(() => null) // single failure se poora fetch fail mat hone do
      );

      const responses = await Promise.all(requests);

      const list = POKEMON_CONFIGS.map((cfg, index) => {
        const pokemon = new Pokemon(
          cfg.name,
          cfg.maxHp,
          cfg.maxEnergy,
          cfg.baseDamage,
          cfg.defense,
          cfg.strongCost,
          cfg.types,
          cfg.moves
        );

        pokemon.accentColor = cfg.accentColor;
        pokemon.description = cfg.description;
        pokemon.pokedexId = cfg.id;

        const apiRes = responses[index];
        if (apiRes && apiRes.data) {
          // Gen 5 animated GIF sprite extract kar rahe hain
          pokemon.sprite =
            apiRes.data.sprites?.versions?.["generation-v"]?.["black-white"]
              ?.animated?.front_default ||
            apiRes.data.sprites?.front_default ||
            `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${cfg.id}.png`;

          pokemon.backSprite =
            apiRes.data.sprites?.versions?.["generation-v"]?.["black-white"]
              ?.animated?.back_default ||
            apiRes.data.sprites?.back_default ||
            pokemon.sprite;
        } else {
          // Direct fallback URL agar API slow ho ya rate limit hit ho
          pokemon.sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${cfg.id}.gif`;
          pokemon.backSprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/back/${cfg.id}.gif`;
        }

        return pokemon;
      });

      setRoster(list);
      setIsLoading(false);
    } catch (err) {
      console.error("PokeAPI error, loading fallback list:", err);

      // Offline fallback dataset
      const fallbackList = POKEMON_CONFIGS.map((cfg) => {
        const pokemon = new Pokemon(
          cfg.name,
          cfg.maxHp,
          cfg.maxEnergy,
          cfg.baseDamage,
          cfg.defense,
          cfg.strongCost,
          cfg.types,
          cfg.moves
        );
        pokemon.accentColor = cfg.accentColor;
        pokemon.description = cfg.description;
        pokemon.pokedexId = cfg.id;
        pokemon.sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${cfg.id}.gif`;
        pokemon.backSprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/back/${cfg.id}.gif`;
        return pokemon;
      });

      setRoster(fallbackList);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPokemonData();
  }, [fetchPokemonData]);

  return { roster, isLoading, isError, refetch: fetchPokemonData };
}