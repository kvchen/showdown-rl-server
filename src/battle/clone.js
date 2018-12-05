"use strict";

const _ = require("lodash");
const {
  Dex: { ModdedDex },
  Battle
} = require("../third_party/Pokemon-Showdown/sim");

/**
 * To speed up cloning battles, we omit these keys when cloning.
 * They're all data-related, and aren't mutated over the course of the battle.
 */
const omittedBattleKeys = new Set(Object.keys(new ModdedDex()))
  .add("zMoveTable")
  .add("teamGenerator");

function customizer(value, key, object) {
  if (object instanceof Battle && omittedBattleKeys.has(key)) {
    return value;
  }
}

/**
 * Performs a deep clone of a Battle object.
 */
function clone(battle) {
  const newBattle = _.cloneDeepWith(battle, customizer);
  newBattle.sides.forEach(side =>
    side.pokemon.forEach(pokemon => {
      pokemon.getHealth = pokemon.getHealthInner.bind(pokemon);
      pokemon.getDetails = pokemon.getDetailsInner.bind(pokemon);
    })
  );

  return newBattle;
}

module.exports = clone;
