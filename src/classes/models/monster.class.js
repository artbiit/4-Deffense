class Monster {
  constructor({ id, DisplayName, Description, maxHp, HpPerLv, spd, def, DefPerLv, Atk, AtkPerLv }) {
    this.id = id;
    this.displayName = DisplayName;
    this.description = Description;
    this.maxHp = maxHp;
    this.hpPerLv = HpPerLv;
    this.spd = spd;
    this.def = def;
    this.defPerLv = DefPerLv;
    this.atk = Atk;
    this.atkPerLv = AtkPerLv;
  }
}

export default Monster;
