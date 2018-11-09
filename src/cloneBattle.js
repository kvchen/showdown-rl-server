"use strict";

const _ = require("lodash");
const {
  Dex: { ModdedDex },
  Battle,
  Side
} = require("./third_party/Pokemon-Showdown/sim");

/**
 * To speed up cloning battles, we omit these keys when cloning.
 * They're all data-related, and aren't mutated over the course of the battle.
 */
const omittedKeys = new Set(Object.keys(new ModdedDex()))
  .add("zMoveTable")
  .add("teamGenerator");

console.warn("Ignoring keys when cloning battles: ", omittedKeys);

function customizer(value, key, object) {
  if (object instanceof Battle && omittedKeys.has(key)) {
    return value;
  }
}

/**
 * Performs a deep clone of a Battle object.
 */
function cloneBattle(battle) {
  return Object.assign(
    Object.create(Object.getPrototypeOf(battle)),
    battle,
    _.cloneDeepWith(battle, customizer)
  );
}

module.exports = cloneBattle;
