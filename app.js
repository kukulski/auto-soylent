
// var nutrientProfile = "51e4e6ca7789bc0200000007"
var nutrientProfile = "51fb86205d5f690200000025" // ketogenic
//var nutrientProfile = "5333c702ec0bea02006ca8cb"

var generateRecipe = require('./generateRecipe');
var fetcher = require('./fetcher');
var output = require ('./output');

var run = function(ingredients,nutrientTargets) {
    var ingredientQuantities = generateRecipe(ingredients, nutrientTargets);
    output(ingredients,ingredientQuantities,nutrientTargets);
}
var args = {urls: [
    //"http://diy.soylent.me/recipes/people-chow-301-tortilla-perfection"
    "http://diy.soylent.me/recipes/alternate-fats"
    ,"http://diy.soylent.me/recipes/copy-of-fail-fast"
    //   ,"http://diy.soylent.me/recipes/oats-whey-n-maltodextrin"
// ,"http://diy.soylent.me/recipes/copy-of-teds-1000-cal-paleo-chow-for-fat-loss-muscle-gain-4"
],
     profile:nutrientProfile,
    calories:2000,
    macros:{
        carbs: 5,
        protein: 45,
        fat: 50
    }};

fetcher(args,run);

