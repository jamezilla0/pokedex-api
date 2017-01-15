"use strict";

var types = {
  /**
   * Unsigned integer from 0
   */
  Uint: {$type: Number, min: 0},
  /**
   * Unsigned integer from 0 to 255
   */
  Uint8: {$type: Number, min: 0, max: 255},
  /**
   * Pokemon type
   */
  Type: {
    $type: String,
    enum: [
      null,
      'normal',
      'fighting',
      'flying',
      'poison',
      'ground',
      'rock',
      'bug',
      'ghost',
      'steel',
      'fire',
      'water',
      'grass',
      'electric',
      'psychic',
      'ice',
      'dragon',
      'dark',
      'fairy',
      // other:
      'unknown', // gen < 4 (Curse move)
      'shadow' // Pokemon XD (GameCube)
    ]
  },
  UniqueString: {$type: String, unique: true},
  UniqueUint: {$type: Number, min: 0, unique: true}
};

/**
 * Pokemon Stat
 * @type {{base: (uint), yield: (uint)}}
 */
types.Stat = {
  base: types.Uint8,
  yield: types.Uint8
};

module.exports = types;