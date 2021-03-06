"use strict";

const _ = require("lodash");

function getMoveFeatures(pokemon, moveSlot) {
  return {
    ..._.pick(pokemon.battle.getMove(moveSlot.move), [
      "accuracy",
      "basePower",
      "category",
      "priority",
      "target",
      "type", 
      "num"
    ]),
    id: moveSlot.id,
    pp: moveSlot.pp,
    maxpp: moveSlot.maxpp,
    disabled: moveSlot.disabled
  };
}

/**
 * Based on Side.getRequestData()
 */
function getPokemonFeatures(pokemon) {
  // return pokemon.getRequestData();
  return {
    // ident: pokemon.fullname,
    // details: pokemon.details,
    num: pokemon.baseTemplate.num,
    species: pokemon.species,
    condition: pokemon.getHealth(pokemon.side),
    hp: pokemon.hp,
    maxhp: pokemon.maxhp,
    trapped: pokemon.trapped,
    status: pokemon.status,
    fainted: pokemon.fainted,
    active: pokemon.position < pokemon.side.active.length,
    baseAbility: pokemon.baseAbility,
    item: pokemon.item,
    itemnum: pokemon.battle.getItem(pokemon.item).num,
    types: pokemon.types,
    gender: pokemon.gender,
    happiness: pokemon.happiness,
    level: pokemon.level,
    // pokeball: pokemon.pokeball,
    ability: pokemon.battle.gen > 6 ? pokemon.ability : undefined,
    abilitynum: pokemon.battle.getAbility(pokemon.ability).num,
    stats: {
      atk: pokemon.stats["atk"],
      def: pokemon.stats["def"],
      spa: pokemon.stats["spa"],
      spd: pokemon.stats["spd"],
      spe: pokemon.stats["spe"]
    },
    boosts: {
      atk: pokemon.boosts["atk"],
      def: pokemon.boosts["def"],
      spa: pokemon.boosts["spa"],
      spd: pokemon.boosts["spd"],
      spe: pokemon.boosts["spe"],
      accuracy: pokemon.boosts["accuracy"],
      evasion: pokemon.boosts["evasion"]
    },
    // moves: pokemon.moves.map(move => ({
    //   ...move.getRequestData()
    // }))
    moves: pokemon.moveSlots.map(moveSlot => getMoveFeatures(pokemon, moveSlot))
  };
}

/**
 * Based on Side.getRequestData()
 */
function getSideFeatures(side) {
  return {
    name: side.name,
    id: side.id,
    pokemon: side.pokemon.map(getPokemonFeatures),
    choiceError: side.choice.error,
    currentRequest: side.currentRequest
  };
}

function getFeatures(battle) {
  const { sides } = battle;
  return {
    ..._.pick(battle, [
      "ended",
      "eventDepth",
      "gameType",
      "lastUpdate",
      "started",
      "terrain",
      "turn",
      "weather",
      "winner",

      // DEBUGGING FEATURES
      // "active",
      // "activeMove",
      // "effect",
      // "effectData",
      "inputLog",
      "log"

      // CIRCULAR REFS
      // "itemData",
      // "lastMove",
      // "pseudoWeather",
      // "terrainData",
      // "weatherData"
    ]),
    sides: sides.map(getSideFeatures)
  };
}

module.exports = getFeatures;
