export const SET_COLLECTION_TRAITS = "SET_COLLECTION_TRAITS";

export function mapTraits(payload) {
  try {
    const indexMap = {};
    const traits = [];
    const valueMap = [
      "count",
      "listed",
      "percentage",
      "rarity_index",
      "type",
      "ceil",
      "floor",
      "avgPrice",
      "median",
      "volume"
    ];
    for (let i = 0; i < payload.length; i++) {
      const value = {};
      valueMap.forEach(key => {
        if (payload[i].hasOwnProperty(key)) value[key] = payload[i][key];
      });

      const trait = {
        createdAt: payload[i].createdAt,
        updatedAt: payload[i].updatedAt,
        nft_collection: payload[i].nft_collection,
        trait_type: payload[i].trait_type,
        value: [value]
      };
      if (indexMap[trait.trait_type])
        traits[indexMap[trait.trait_type] - 1].value.push(...trait.value);
      else indexMap[trait.trait_type] = traits.push(trait);
    }
    return traits.sort();
  } catch (err) {
    console.log(err);
    return [];
  }
}
