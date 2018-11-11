"use strict";

const _ = require("lodash");

function getPokemonFeatures(pokemon) {
  const { getHealth, getDetails } = pokemon;
  return {
    ..._.pick(pokemon, [
      "ateBerry",
      "fainted",
      "hp",
      "lastItem",
      "maybeDisabled",
      "maybeTrapped",
      "moveSlots",
      "status",
      "trapped"
    ]),
    health: getHealth(),
    details: getDetails()
  };
}

function getSideFeatures(side) {
  const { active, pokemon, sideConditions } = side;
  return {
    ..._.pick(side, ["n", "pokemonLeft"]),
    active: active.map(getPokemonFeatures),
    pokemon: pokemon.map(getPokemonFeatures)
    // TODO: Add side conditions
    // sideConditions
  };
}

function getBattleFeatures(battle) {
  const { activeTarget, sides } = battle;
  return {
    ..._.pick(battle, [
      "active",
      "activeMove",
      "effect",
      "effectData",
      "ended",
      "eventDepth",
      "gameType",
      "inputLog",
      // "itemData",
      // "lastMove",
      "lastUpdate",
      "log",
      // "pseudoWeather",
      "started",
      "terrain",
      // "terrainData",
      "turn",
      "weather"
      // "weatherData"
    ]),
    activeTarget: activeTarget ? getPokemonFeatures(activeTarget) : null,
    sides: sides.map(getSideFeatures)
  };
}

module.exports = getBattleFeatures;
