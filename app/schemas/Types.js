var types = {
  /**
   * Unsigned integer from 0
   */
  Uint: {type: Number, min: 0, default: null},
  /**
   * Unsigned integer from 0 to 255
   */
  Uint8: {type: Number, min: 0, max: 255, default: null},
  /**
   * Pokemon type
   */
  Type: {
    type: String,
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
    ],
    default: null
  },
  UniqueString: {type: String, unique: true, default: null},
  UniqueUint: {type: Number, min: 0, unique: true, default: null}
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