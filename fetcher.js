
var request = require('superagent');


var patchProfile = function (calories,macros,nutrientTargets) {

    // Override macros based on user variables from top of this file
    nutrientTargets.calories = calories;

    // convert from calories to grams
    nutrientTargets.carbs    = Math.round(macros.carbs * calories / 100 / 4);
    nutrientTargets.protein  = Math.round(macros.protein * calories / 100 / 4);
    nutrientTargets.fat      = Math.round(macros.fat * calories / 100 / 9);

    // max for macros and calories is 104% of target
    nutrientTargets.calories_max = Number((nutrientTargets.calories * 1.04).toFixed(2));
    nutrientTargets.carbs_max    = Number((nutrientTargets.carbs * 1.04).toFixed(2));
    nutrientTargets.protein_max  = Number((nutrientTargets.protein * 1.04).toFixed(2));
    nutrientTargets.fat_max      = Number((nutrientTargets.fat * 1.04).toFixed(2));
}


var mergeRecipes = function(recipes) {
   var keys = {}
    var rval = [];

    var addIngredient = function(ingredient) {
       if(ingredient.id in keys) return;

        keys[ingredient.id] == true;
        rval.push(ingredient);
    }
    var addRecipe = function(recipe) { recipe.forEach(addIngredient)}
    recipes.forEach(addRecipe)
    return rval;
}

module.exports =function(urls,profileCode,calories,macros,callback) {
    var state = {recipies:[], profile:null};


    var allDone = function() {
        patchProfile(calories,macros,state.profile)
        var ingredients = mergeRecipes(state.recipies)
        callback(ingredients, state.profile)
    }

    var requestDone = function(err,response) {
        state.profile = response.body.nutrientTargets;
        state.recipies.push(response.body.ingredients);
        if(state.recipies.length == urls.length) allDone();
    }

    var singleRequest = function(url) {
        request.get(url + "/json?nutrientProfile=" + profileCode,requestDone);
    }
    urls.forEach(singleRequest);
}

