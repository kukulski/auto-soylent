
// This can be replaced with any of the recipes on http://diy.soylent.me
var recipeUrl = "http://diy.soylent.me/recipes/people-chow-301-tortilla-perfection";
var nutrientProfile = "51e4e6ca7789bc0200000007"

// Calorie goal
var calories = 2200;

// Ratio of carbs / protein / fat. Should add to 100
var macros = {
    carbs: 40,
    protein: 30,
    fat: 30
};


// Fetch recipe, pass to generateRecipe function and output results...



var run = function(ingredients,nutrientTargets) {
    var generateRecipe = require('./generateRecipe');

    var ingredientQuantities = generateRecipe(ingredients, nutrientTargets);


    var output = require ('./output');

    output(ingredients,ingredientQuantities,nutrientTargets);


    // That's it!
}

var fetcher = require('./fetcher')
fetcher(recipeUrl,nutrientProfile,calories,macros,run);

