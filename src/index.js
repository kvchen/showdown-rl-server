/**
 * This module starts up a server that greatly simplifies simulating rollouts.
 * Our Python client will call into the local server to simulate games.
 */

"use strict";

const Koa = require("koa");
const Router = require("koa-router");

const bodyParser = require("koa-bodyparser");
const uuidv4 = require("uuid/v4");

const Sim = require("./third_party/Pokemon-Showdown/sim");

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
  const stream = new Sim.BattleStream();
  const options = {
    ...ctx.request.body,
    p1: {},
    p2: {}
  };
  stream.write(`>start ${JSON.stringify(options)}`);

  const id = uuidv4();
  const battle = stream.battle;
  battles[id] = battle;

  ctx.body = { id, battle: battle.toString() };
});

/**
 * Get a JSON blob with details about the given game
 */
router.get("/game/:id", async ctx => {
  const id = ctx.params.id;
  ctx.body = { battle: battles[id].toString() };
});

/**
 * Makes an (immutable) move. Returns the newly created child battle ID and
 * the battle details.
 */
router.post("/game/:id/move", (ctx, next) => {
  const oldID = ctx.params.id;
  const oldBattle = battles[id];

  // Copy the old battle to ensure we don't mutate it.
  const newBattle = oldBattle.deepClone();
});

/**
 * Cleans up the game (and its descendants) so we don't keep them in memory.
 */
router.del("/game/:id", (ctx, next) => {});

app
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods());
app.listen(3000);
