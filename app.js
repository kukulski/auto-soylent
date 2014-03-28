
// This can be replaced with any of the recipes on http://diy.soylent.me

var recipeUrls = ["http://diy.soylent.me/recipes/people-chow-301-tortilla-perfection"
    ,"http://diy.soylent.me/recipes/alternate-fats"
 //   ,"http://diy.soylent.me/recipes/oats-whey-n-maltodextrin"
// ,"http://diy.soylent.me/recipes/copy-of-teds-1000-cal-paleo-chow-for-fat-loss-muscle-gain-4"

];
var nutrientProfile = "51e4e6ca7789bc0200000007"
//var nutrientProfile = "5333c702ec0bea02006ca8cb"
// Calorie goal
var calories = 2200;

// Ratio of carbs / protein / fat. Should add to 100
var macros = {
    carbs: 35,
    protein: 30,
    fat: 35
};

var generateRecipe = require('./generateRecipe');
var fetcher = require('./fetcher');
var output = require ('./output');

var run = function(ingredients,nutrientTargets) {
    var ingredientQuantities = generateRecipe(ingredients, nutrientTargets);
    output(ingredients,ingredientQuantities,nutrientTargets);
}

fetcher(recipeUrls,nutrientProfile,calories,macros,run);

