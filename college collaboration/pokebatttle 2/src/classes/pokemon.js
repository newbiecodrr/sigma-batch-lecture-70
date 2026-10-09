// Pokemon battle class (pure math and logic outside React renders)
export default class Pokemon {
  constructor(
    name = "Unknown",
    maxHp = 100,
    maxEnergy = 50,
    baseDamage = 20,
    defense = 10,
    strongCost = 15,
    types = ["Normal"],
    moves = { weak: "Quick Strike", strong: "Special Attack" }
  ) {
    this.name = name;
    this.maxHp = maxHp;
    this.currentHp = maxHp;
    this.maxEnergy = maxEnergy;
    this.energy = maxEnergy;
    this.baseDamage = baseDamage;
    this.defense = defense;
    this.strongCost = strongCost;
    this.types = Array.isArray(types) ? types : [types];
    this.moves = {
      weak: moves.weak || "Quick Strike",
      strong: moves.strong || "Special Attack",
    };
    this.isDefending = false;
    this.sprite = "";
    this.id = name.toLowerCase();
  }

  // 1. Weak Attack: 0 energy cost, recovers +5 stamina
  weakAttack(target) {
    if (!target) return null;

    // thoda sa energy refund de rahe hain
    this.energy = Math.min(this.maxEnergy, this.energy + 5);

    // damage variance between 90% and 110%
    const variance = 0.9 + Math.random() * 0.2;
    // 15% crit chance
    const isCrit = Math.random() < 0.15;
    const critBonus = isCrit ? 1.5 : 1.0;

    const rawDamage = Math.round(this.baseDamage * variance * critBonus);
    const damageDealt = target.takeDamage(rawDamage);

    // attack karne par defending stance reset ho jata hai
    this.isDefending = false;

    const moveName = this.moves.weak;
    const message = isCrit
      ? `💥 CRITICAL HIT! ${this.name} used ${moveName} for ${damageDealt} DMG!`
      : `⚔️ ${this.name} used ${moveName} and dealt ${damageDealt} DMG.`;

    return {
      success: true,
      attacker: this.name,
      target: target.name,
      moveName,
      damage: damageDealt,
      isCrit,
      message,
      action: "weak",
    };
  }

  // 2. Heavy Special Attack: uses high energy for massive burst
  strongAttack(target) {
    if (!target) return null;

    if (this.energy < this.strongCost) {
      return {
        success: false,
        reason: `Need ${this.strongCost} EN, but only have ${this.energy} EN.`,
        damage: 0,
        action: "strong",
      };
    }

    this.energy -= this.strongCost;

    // 25% crit chance with heavy damage multiplier
    const variance = 0.95 + Math.random() * 0.25;
    const isCrit = Math.random() < 0.25;
    const critBonus = isCrit ? 1.6 : 1.0;

    const rawDamage = Math.round(this.baseDamage * 2.25 * variance * critBonus);
    const damageDealt = target.takeDamage(rawDamage);

    this.isDefending = false;

    const moveName = this.moves.strong;
    const message = isCrit
      ? `⚡ CRITICAL BLAST! ${this.name} unleashed ${moveName} for ${damageDealt} DMG!`
      : `🔥 ${this.name} unleashed ${moveName} for ${damageDealt} DMG!`;

    return {
      success: true,
      attacker: this.name,
      target: target.name,
      moveName,
      damage: damageDealt,
      isCrit,
      message,
      action: "strong",
    };
  }

  // 3. Defensive Guard: cuts next incoming damage by 50% + gives +12 EN
  defend() {
    this.isDefending = true;
    const recovered = 12;
    this.energy = Math.min(this.maxEnergy, this.energy + recovered);

    return {
      success: true,
      attacker: this.name,
      energyGained: recovered,
      message: `🛡️ ${this.name} is guarding! (+${recovered} EN & 50% damage reduction next turn).`,
      action: "defend",
    };
  }

  // 4. Charge: restores +25 energy
  chargeEnergy() {
    const gained = Math.min(this.maxEnergy - this.energy, 25);
    this.energy += gained;
    this.isDefending = false;

    return {
      success: true,
      attacker: this.name,
      energyGained: gained,
      message: `⚡ ${this.name} charged up +${gained} EN (${this.energy}/${this.maxEnergy} EN).`,
      action: "charge",
    };
  }

  // Damage calculation logic with defense subtraction
  takeDamage(rawDamage) {
    let effectiveDamage = rawDamage;

    if (this.isDefending) {
      // guard stance mein 50% direct cut
      effectiveDamage = Math.max(3, Math.round(rawDamage * 0.5 - this.defense * 0.8));
      this.isDefending = false;
    } else {
      effectiveDamage = Math.max(5, Math.round(rawDamage - this.defense * 0.4));
    }

    // HP ko 0 se neeche nahi jaane dena
    this.currentHp = Math.max(0, this.currentHp - effectiveDamage);
    return effectiveDamage;
  }

  isFainted() {
    return this.currentHp <= 0;
  }

  // CPU move selection heuristic logic
  getComputerMove(opponent) {
    const hasEnoughEnergy = this.energy >= this.strongCost;
    const myHpPercent = this.currentHp / this.maxHp;

    // 1. agar opponent kill ho sakta hai toh heavy attack maar do
    if (hasEnoughEnergy && opponent && opponent.currentHp <= this.baseDamage * 2.2) {
      return "strong";
    }

    // 2. agar weak attack se hi kaam ho jaye toh energy bacha lo
    if (opponent && opponent.currentHp <= this.baseDamage * 0.8) {
      return "weak";
    }

    // 3. low HP hone par defense ya charge prefer karo
    if (myHpPercent < 0.25 && opponent && opponent.energy >= opponent.strongCost && !this.isDefending) {
      return Math.random() < 0.5 ? "defend" : "charge";
    }

    // 4. energy bilkul low ho toh pehle recharge karo
    if (this.energy < this.strongCost) {
      return Math.random() < 0.65 ? "charge" : "weak";
    }

    // 5. default state: 60% heavy attack, 25% weak attack, 15% guard
    const roll = Math.random();
    if (roll < 0.6) return "strong";
    if (roll < 0.85) return "weak";
    return "defend";
  }

  reset() {
    this.currentHp = this.maxHp;
    this.energy = this.maxEnergy;
    this.isDefending = false;
  }

  // Deep clone helper taaki original roster clean rahe
  clone() {
    const copy = new Pokemon(
      this.name,
      this.maxHp,
      this.maxEnergy,
      this.baseDamage,
      this.defense,
      this.strongCost,
      [...this.types],
      { ...this.moves }
    );
    copy.sprite = this.sprite;
    copy.backSprite = this.backSprite;
    copy.id = this.id;
    copy.accentColor = this.accentColor;
    copy.description = this.description;
    copy.pokedexId = this.pokedexId;
    return copy;
  }
}