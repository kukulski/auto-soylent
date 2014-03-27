/**
 * Nonlinear Auto-Soylent Solver v0.2
 *
 * by  Alrecenk (Matt McDaniel) of Inductive Bias LLC (http://www.inductivebias.com)
 * and Nick Poulden of DIY Soylent (http://diy.soylent.me)
 *
 */

// This can be replaced with any of the recipes on http://diy.soylent.me
var recipeUrl = "http://diy.soylent.me/recipes/people-chow-301-tortilla-perfection";

// Calorie goal
var calories = 2200;

// Ratio of carbs / protein / fat. Should add to 100
var macros = {
    carbs: 40,
    protein: 30,
    fat: 30
};

var ingredientLength,
    targetLength, // Length of ingredient and target array (also dimensions of m)
    M,            // Matrix mapping ingredient amounts to chemical amounts (values are fraction per serving of target value)
    cost,         // Cost of each ingredient per serving
    w = .0001,    // Weight cost regularization (creates sparse recipes for large numbers of ingredient, use 0 for few ingredients)
    maxPerMin,    // Ratio of maximum value to taget value for each ingredient
    lowWeight,
    highWeight;   // How to weight penalties for going over or under a requirement

var nutrients = [
    'calories', 'carbs', 'protein', 'fat', 'biotin', 'calcium', 'chloride', 'cholesterol', 'choline', 'chromium', 'copper',
    'fiber', 'folate', 'iodine', 'iron', 'maganese', 'magnesium', 'molybdenum', 'niacin', 'omega_3', 'omega_6',
    'panthothenic', 'phosphorus', 'potassium', 'riboflavin', 'selinium', 'sodium', 'sulfur', 'thiamin',
    'vitamin_a', 'vitamin_b12', 'vitamin_b6', 'vitamin_c', 'vitamin_d', 'vitamin_e', 'vitamin_k', 'zinc'
];

// These nutrients are considered 'more important'
var macroNutrients = ["calories", "protein", "carbs", "fat"];

// Convenience function for preinitializing arrays because I'm not accustomed to working on javascript
function createArray(length) {
    var arr = new Array(length || 0),
        i = length;

    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while(i--) arr[length-1 - i] = createArray.apply(this, args);
    }

    return arr;
}



// Fetch recipe, pass to generateRecipe function and output results...

var request = require('superagent');

console.log("\nFetching the recipe from the DIY Soylent website...");
request.get(recipeUrl + "/json?nutrientProfile=51e4e6ca7789bc0200000007", function(err, response) {
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


    var generateRecipe = require('./generateRecipe');

    // Here's where the magic happens...
    var ingredientQuantities = generateRecipe(ingredients, nutrientTargets);


    var output = require ('./output');

    output(ingredients,ingredientQuantities,nutrients,nutrientTargets);


    // That's it!
});
