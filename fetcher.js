

module.exports = function(recipeUrl,nutrientProfile,calories,macros,callback) {
console.log("\nFetching the recipe from the DIY Soylent website...");

    var request = require('superagent');

    request.get(recipeUrl + "/json?nutrientProfile=" + nutrientProfile, function(err, response) {
    if (err) {
        console.log("An error occurred", err);
        return;
    }

    console.log("Successfully fetched recipe.\n");

    var ingredients     = response.body.ingredients,
        nutrientTargets = response.body.nutrientTargets,
        i, j, nutrient;

    // Override macros based on user variables from top of this file
    nutrientTargets.calories = calories;
    nutrientTargets.carbs    = Math.round(macros.carbs * calories / 100 / 4);
    nutrientTargets.protein  = Math.round(macros.protein * calories / 100 / 4);
    nutrientTargets.fat      = Math.round(macros.fat * calories / 100 / 9);
    nutrientTargets.calories_max = Number((nutrientTargets.calories * 1.04).toFixed(2));
    nutrientTargets.carbs_max    = Number((nutrientTargets.carbs * 1.04).toFixed(2));
    nutrientTargets.protein_max  = Number((nutrientTargets.protein * 1.04).toFixed(2));
    nutrientTargets.fat_max      = Number((nutrientTargets.fat * 1.04).toFixed(2));

    callback(ingredients,nutrientTargets);
});
}

