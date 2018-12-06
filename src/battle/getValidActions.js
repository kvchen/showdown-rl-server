"use strict";

const _ = require("lodash");
const clone = require("./clone");

const ALL_ACTIONS = [
  ..._.range(1, 5).map(slot => `move ${slot}`),
  ..._.range(2, 7).map(slot => `switch ${slot}`),
  "pass",
  null
];

function getValidActions(battle) {
  return battle.sides.map((side, sideIdx) => {
    if (side.isChoiceDone()) {
      return [ALL_ACTIONS.length - 1];
    }

    const filtered_action_indices = _.range(ALL_ACTIONS.length - 1).filter(
      action_idx => {
        side.choose(ALL_ACTIONS[action_idx]);
        return side.isChoiceDone() && !side.choice.error;
      }
    );

    side.clearChoice();
    return filtered_action_indices;
  });
}

module.exports = getValidActions;
