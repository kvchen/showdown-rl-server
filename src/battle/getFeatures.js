"use strict";

const _ = require("lodash");

/**
 * Based on Side.getRequestData()
 */
function getPokemonFeatures(pokemon) {
  return pokemon.getRequestData();
  return {
    ident: pokemon.fullname,
    details: pokemon.details,
    condition: pokemon.getHealth(pokemon.side),
    active: pokemon.position < pokemon.side.active.length,
    baseAbility: pokemon.baseAbility,
    item: pokemon.item,
    pokeball: pokemon.pokeball,
    ability: pokemon.battle.gen > 6 ? pokemon.ability : undefined,
    stats: {
      atk: pokemon.baseStats["atk"],
      def: pokemon.baseStats["def"],
      spa: pokemon.baseStats["spa"],
      spd: pokemon.baseStats["spd"],
      spe: pokemon.baseStats["spe"]
    },
    moves: pokemon.moves.map(move => ({
      ...move.getRequestData()
    }))
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
      "weather"

      // DEBUGGING FEATURES
      // "active",
      // "activeMove",
      // "effect",
      // "effectData",
      // "inputLog",
      // "log",

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
