/**
 * This module starts up a server that greatly simplifies simulating rollouts.
 * Our Python client will call into the local server to simulate games.
 */

"use strict";

const _ = require("lodash");
const Koa = require("koa");
const Router = require("koa-router");

const bodyParser = require("koa-bodyparser");
const uuidv4 = require("uuid/v4");

const { Battle } = require("./third_party/Pokemon-Showdown/sim");
const getBattleFeatures = require("./getBattleFeatures");
const cloneBattle = require("./cloneBattle");

const app = new Koa();
const router = new Router();

// A dead-simple map from ID to battle.
const battles = {};

// A map from battle ID to the battle IDs of its children.
// type: {[parentBattleID]: {[childMoveKey]: childBattleID}}
const children = {};

function getMoveKey(moveType, message) {
  return `${moveType},${message}`;
}

/**
 * Start a new game and returns a unique identifier that the client will use
 * to refer to this game.
 */
router.post("/game/new", async (ctx, next) => {
  const options = {
    p1: {},
    p2: {},
    ...ctx.request.body
  };
  const battle = new Battle(options);
  const battleID = uuidv4();
  battles[battleID] = battle;
  children[battleID] = {};

  ctx.battleID = battleID;
  await next();
});

/**
 * Get a JSON blob with details about the given game
 */
router.get("/game/:battleID", async (ctx, next) => {
  const { battleID } = ctx.params;
  const battle = battles[battleID];

  ctx.battleID = battleID;
  await next();
});

/**
 * Makes an (immutable) move. Returns the newly created child battle ID and
 * the battle details.
 */
router.post("/game/:battleID/move", async (ctx, next) => {
  const { battleID: oldBattleID } = ctx.params;
  const { moveType, message } = ctx.request.body;
  const moveKey = getMoveKey(moveType, message);

  const cachedBattleID = children[oldBattleID][moveKey];
  if (cachedBattleID != null) {
    ctx.battleID = cachedBattleID;
    return await next();
  }

  // Copy the old battle to ensure we don't mutate it.
  const oldBattle = battles[oldBattleID];
  const newBattle = cloneBattle(oldBattle);
  const newBattleID = uuidv4();

  battles[newBattleID] = newBattle;
  children[newBattleID] = {};
  children[oldBattleID][moveKey] = newBattleID;

  switch (moveType) {
    case "p1":
    case "p2":
      if (message === "undo") {
        newBattle.undoChoice(moveType);
      } else {
        newBattle.choose(moveType, message);
      }
      break;
    case "forcewin":
    case "forcetie":
      newBattle.win(message);
      break;
    case "tiebreak":
      newBattle.tiebreak();
      break;
  }

  ctx.battleID = newBattleID;
  await next();
});

/**
 * Cleans up the game (and its descendants) so we don't keep them in memory.
 */
router.del("/game/:battleID", async (ctx, next) => {
  let queue = [ctx.params.battleID];
  while (queue.length !== 0) {
    const battleID = queue.pop();
    const battle = battles[battleID];
    battle.destroy();

    queue = [...queue, ...Object.values(children[battleID])];
    battles[battleID] = undefined;
    children[battleID] = undefined;
  }

  await next();
});

async function battleFeatureMiddleware(ctx, next) {
  const { battleID } = ctx;
  if (battleID) {
    ctx.body = { battleID, battle: getBattleFeatures(battles[battleID]) };
  }

  await next();
}

app
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods())
  .use(battleFeatureMiddleware);

app.listen(3000);
