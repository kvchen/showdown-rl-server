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
const cloneBattle = require("./cloneBattle");

const app = new Koa();
const router = new Router();

// A dead-simple map from ID to battle.
const battles = {};

// A map from battle ID to the battle IDs of its children.
// This allows us to figure out which battles to garbage collect.
const children = {};

/**
 * Start a new game and returns a unique identifier that the client will use
 * to refer to this game.
 */
router.post("/game/new", async ctx => {
  const options = {
    p1: {},
    p2: {},
    ...ctx.request.body
  };
  const battle = new Battle(options);
  const battleID = uuidv4();
  battles[battleID] = battle;

  ctx.body = { battleID, battle: battle.toString() };
});

/**
 * Get a JSON blob with details about the given game
 */
router.get("/game/:battleID", async ctx => {
  const { battleID } = ctx.params;
  const battle = battles[battleID];

  ctx.body = { battleID, battle: battle.toString() };
});

/**
 * Makes an (immutable) move. Returns the newly created child battle ID and
 * the battle details.
 */
router.post("/game/:battleID/move", async ctx => {
  const { battleID: oldBattleID } = ctx.params;
  const oldBattle = battles[oldBattleID];
  const { moveType, message } = ctx.request.body;

  // Copy the old battle to ensure we don't mutate it.
  const newBattleID = uuidv4();
  const newBattle = cloneBattle(oldBattle);

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

  ctx.body = { battleID: newBattleID, battle: newBattle.toString() };
});

/**
 * Cleans up the game (and its descendants) so we don't keep them in memory.
 */
router.del("/game/:battleID", async ctx => {
  const queue = [ctx.params.battleID];
  while (queue.length !== 0) {
    const battleID = queue.pop();
  }
});

app
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods());
app.listen(3000);
