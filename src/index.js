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

const { clone, getFeatures, getValidActions } = require("./battle");

const app = new Koa();
const router = new Router();

// A dead-simple map from ID to battle.
const battles = {};

// A map from battle ID to the battle IDs of its children.
// type: {[parentBattleID]: {[childMoveKey]: childBattleID}}
const children = {};

function getMoveKey(p1Move, p2Move) {
  return `${p1Move};${p2Move}`;
}

/**
 * Start a new game and returns a unique identifier that the client will use
 * to refer to this game.
 *
 * @param options
 */
router.post("/start", async (ctx, next) => {
  const battle = new Battle({
    p1: {},
    p2: {},
    ...ctx.request.body
  });
  const battleID = uuidv4();

  battles[battleID] = battle;
  children[battleID] = {};

  ctx.battleID = battleID;
  await next();
});

router.get("/:battleID", async (ctx, next) => {
  const { battleID } = ctx.params;
  ctx.battleID = battleID;
  await next();
});

/**
 * Makes an (immutable) move. Returns the newly created child battle ID and
 * the battle details.
 *
 * @param {string} battleID
 * @param {string} p1Move
 * @param {string} p2Move
 */
router.post("/:battleID/move", async (ctx, next) => {
  const { battleID: oldBattleID } = ctx.params;
  const { p1Move, p2Move } = ctx.request.body;
  const moveKey = getMoveKey(p1Move, p2Move);

  // If we've already taken a move from some battle state, just return the
  // cached battle instead of recomputing it.

  const cachedBattleID = children[oldBattleID][moveKey];
  if (cachedBattleID != null) {
    ctx.battleID = cachedBattleID;
    return await next();
  }

  // Copy the old battle to ensure we don't mutate it.

  const oldBattle = battles[oldBattleID];
  const newBattle = clone(oldBattle);
  const newBattleID = uuidv4();

  battles[newBattleID] = newBattle;
  children[newBattleID] = {};
  children[oldBattleID][moveKey] = newBattleID;

  if (p1Move) {
    newBattle.choose("p1", p1Move);
  }

  if (p2Move) {
    newBattle.choose("p2", p2Move);
  }

  ctx.battleID = newBattleID;
  await next();
});

/**
 * Cleans up the game (and its descendants) so we don't keep them in memory.
 *
 * @param battleID
 */
router.del("/:battleID", async (ctx, next) => {
  let queue = [ctx.params.battleID];
  while (queue.length !== 0) {
    const battleID = queue.pop();
    const battle = battles[battleID];
    battle.destroy();

    queue = [...queue, ...Object.values(children[battleID])];
    delete battles[battleID];
    delete children[battleID];
  }

  await next();
});

async function battleFeatureMiddleware(ctx, next) {
  const { battleID } = ctx;
  if (battleID) {
    const battle = battles[battleID];
    ctx.body = {
      id: battleID,
      data: getFeatures(battle),
      actions: getValidActions(battle),
      seed: battle.prng.startingSeed
    };
  }

  await next();
}

app
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods())
  .use(battleFeatureMiddleware);

app.listen(3000);
