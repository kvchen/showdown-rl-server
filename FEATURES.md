# Features

There are three primitives we deal with when analyzing the state of a Pokemon
battle: battle, side, and Pokemon.

## Battle

- Field attributes (weather, etc.)
- Contains two sides (p1 and p2), or (player and opponent)

## Side

- Array of six Pokemon

## Pokemon

-

# Actions

We restrict actions to just moves and switches, without z-moves or mega
evolutions.

If the server sends a `active` request, we can make the following moves:

- move {1-4}
- switch {2-6}

If the server sends a `forceSwitch` request, we can make the following moves:

- switch {2-6}

If the server sends a `wait` command, there are no actions to take and the
client will automatically send a null action.
