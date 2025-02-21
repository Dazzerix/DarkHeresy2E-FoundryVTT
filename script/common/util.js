export default class DarkHeresyUtil {
  
  static createCommonAttackRollData(actor, item) {
      return {
        name: item.name,      
        attributeBoni: actor.attributeBoni,
        ownerId: actor.id,
        itemId: item.id,      
        damageBonus: 0,
        damageType: item.damageType,      
    };
  }
  
  static createWeaponRollData(actor, weapon) {
    let characteristic = this.getWeaponCharacteristic(actor, weapon);
    let rateOfFire;
    if (weapon.class === "melee") {
      rateOfFire = {burst: characteristic.bonus, full: characteristic.bonus};
    } else {
      rateOfFire = {burst: weapon.rateOfFire.burst, full: weapon.rateOfFire.full};
    }
    let isMelee = weapon.class === "melee";
    
    let rollData = this.createCommonAttackRollData(actor, weapon);
    rollData.baseTarget= characteristic.total + weapon.attack,
    rollData.modifier= 0,
    rollData.isMelee= isMelee;
    rollData.isRange= !isMelee;
    rollData.clip= weapon.clip;
    rollData.rateOfFire= rateOfFire;
    rollData.weaponTraits= this.extractWeaponTraits(weapon.special); 
    let attributeMod;
    if(rollData.weaponTraits.rabbit) {
      attributeMod = (isMelee && !weapon.damage.match(/AG/gi) ? "+AG" : "");
   } else {
      attributeMod = (isMelee && !weapon.damage.match(/SB/gi) ? "+SB" : "");
   }	
    rollData.damageFormula= weapon.damage + attributeMod + (rollData.weaponTraits.force ? "+PR": "");
    rollData.penetrationFormula = weapon.penetration + (rollData.weaponTraits.force ? "+PR" : "");
    rollData.special= weapon.special;
    rollData.psy= { value: actor.psy.rating, display: false};
    return rollData;
  }
  
  static createPsychicRollData(actor, power) {
    let focusPowerTarget = this.getFocusPowerTarget(actor, power);
    
    let rollData = this.createCommonAttackRollData(actor, power); 
    rollData.baseTarget= focusPowerTarget.total;
    rollData.modifier= power.focusPower.difficulty;      
    rollData.damageFormula= power.damage.formula;      
    rollData.penetrationFormula= power.damage.penetration;
    rollData.attackType= { name: power.damage.zone, text: "" };
    rollData.weaponTraits= this.extractWeaponTraits(power.damage.special);
    rollData.special= power.damage.special;
    rollData.psy = {
        value: actor.psy.rating,
        rating: actor.psy.rating,
        max: this.getMaxPsyRating(actor),
        warpConduit: false,
        display: true
    };
    return rollData;
  }
  
  static extractWeaponTraits(traits) {
    // These weapon traits never go above 9 or below 2
    return {
      accurate: this.hasNamedTrait(/Accurate/gi, traits),
      rfFace: this.extractNumberedTrait(/Vengeful.*\(\d\)/gi, traits), // The alternativ die face Righteous Fury is triggered on
      proven: this.extractNumberedTrait(/Proven.*\(\d\)/gi, traits),
      primitive: this.extractNumberedTrait(/Primitive.*\(\d\)/gi, traits),
      razorSharp: this.hasNamedTrait(/Razor *Sharp/gi, traits),
      skipAttackRoll: this.hasNamedTrait(/Spray/gi, traits),
      tearing: this.hasNamedTrait(/Tearing/gi, traits),
      storm: this.hasNamedTrait(/Storm/gi, traits),
      twinLinked: this.hasNamedTrait(/Twin-Linked/gi, traits),
      rabbit: this.hasNamedTrait(/Rabbit *Punch/gi, traits),
      force: this.hasNamedTrait(/Force/gi, traits),
      inaccurate: this.hasNamedTrait(/Inaccurate/gi, traits)
    };
  }

  static getMaxPsyRating(actor) {
    let base = actor.psy.rating;
    switch (actor.psy.class) {
      case "bound":
        return base + 2;
      case "unbound":
        return base + 4;
      case "daemonic":
        return base + 3;
    }
  }

  static extractNumberedTrait(regex, traits) {
    let rfMatch = traits.match(regex);
    if (rfMatch) {
      regex = /\d+/gi;
      return parseInt(rfMatch[0].match(regex)[0]);
    }
    return undefined;
  }

  static hasNamedTrait(regex, traits) {
    let rfMatch = traits.match(regex);
    if (rfMatch) {
      return true;
    } else {
      return false;
    }
  }
  
  static getWeaponCharacteristic(actor, weapon) {
    if (weapon.class === "melee") {
      return actor.characteristics.weaponSkill;
    } else {
      return actor.characteristics.ballisticSkill;
    }
  }

  static getFocusPowerTarget(actor, psychicPower) {
    const normalizeName = psychicPower.focusPower.test.toLowerCase();
    if (actor.characteristics.hasOwnProperty(normalizeName)) {
      return actor.characteristics[normalizeName];
    } else if (actor.skills.hasOwnProperty(normalizeName)) {
      return actor.skills[normalizeName];
    } else {
      return actor.characteristics.willpower;
    }
  }
   
  static createShipWeaponRollData(actor, starshipWeapon) {
    let characteristic = this.getWeaponCharacteristic(actor, starshipWeapon);

    let rollData = this.createCommonAttackRollData(actor, starshipWeapon);
    rollData.isCannon = starshipWeapon.comptype === "macro";
    rollData.isLance = starshipWeapon.comptype === "lance";
    rollData.isNova = starshipWeapon.comptype === "nova";
    rollData.isTorpedo = starshipWeapon.comptype === "torpedo";
    rollData.baseTarget= characteristic.total,
    rollData.modifier= 0,
    rollData.isRange= true
    rollData.rateOfFire= starshipWeapon.shipStrength;
    rollData.damageFormula= starshipWeapon.damage;
    rollData.critical= starshipWeapon.shipCritical;
    rollData.weaponTraits= this.extractWeaponTraits(starshipWeapon.special);    
    rollData.special= starshipWeapon.special;
    return rollData;
  }
}

