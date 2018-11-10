"use strict";

function getPokemonFeatures(pokemon) {
  const {
    side,
    battle,
    getHealth,
    getDetails,
    template,
    baseTemplate,
    hp
    // ...rest,
  } = pokemon;

  return {
    hp
    // health: getHealth(),
    // details: getDetails()
    // ...rest
  };
}

function getBattleFeatures(battle) {
  const {
    log,
    inputLog,
    weatherData,
    terrainData,
    pseudoWeather,
    sides,
    effect,
    effectData,
    itemData,
    gameType,
    turn,
    lastUpdate,
    weather,
    terrain,
    ended,
    started,
    active,
    eventDepth,
    lastMove,
    activeMove,
    activeTarget,
    midTurn
  } = battle;

  return {
    log,
    inputLog,
    // weatherData,
    // terrainData,
    // pseudoWeather,
    // effect,
    // effectData,
    // itemData,
    // gameType,
    // turn,
    // lastUpdate,
    // weather,
    // terrain,
    ended,
    started,
    active,
    // eventDepth,
    // lastMove,
    // activeMove,
    // activeTarget,
    // midTurn,
    sides: sides.map(side => ({
      // ...side,
      pokemon: side.pokemon.map(getPokemonFeatures)
    }))
  };
}

module.exports = getBattleFeatures;
