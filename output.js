var Table = require('cli-table');    // Library to output the results in a pretty way
var colors = require('colors');

module.exports = function(ingredients,ingredientQuantities,nutrients,nutrientTargets) {


// Now lets output the results. First the ingredients.
var ingredientsTable = new Table({
    style: { compact: true },
    head: ["Ingredient", "Official\nAmount", "Optimized\nAmount"]
});

for (i=0; i< ingredients.length; i++) {
    ingredientsTable.push([
        ingredients[i].name,
        ingredients[i].amount + " " + ingredients[i].unit,
        ingredientQuantities[i].toFixed(2) + " " + ingredients[i].unit
    ]);
}

console.log(ingredientsTable.toString());


// Output the nutrients.
var nutrientsTable = new Table({
    style: { compact: true },
    head: ['Nutrient', 'Target', 'Max', 'Recipe', '%']
});

var pct;

for (var n=0; n < nutrients.length; n++) {

    var nutrient = nutrients[n];

    // Add up the amount of the current nutrient in each of the ingredients.
    var nutrientInIngredients = 0;
    for (j=0; j< ingredients.length; j++) {
        if (typeof ingredients[j][nutrient] == 'number' && ingredientQuantities[j] > 0) {
            nutrientInIngredients += ingredients[j][nutrient] * ingredientQuantities[j] / ingredients[j].serving;
        }
    }

    // Format percentages nicely. Cyan: too little. Green: just right. Red: too much
    pct = nutrientTargets[nutrient] ? (nutrientInIngredients / nutrientTargets[nutrient] * 100) : 100;
    if (pct < 99) {
        pct = (pct.toFixed(0) + " %").cyan.bold;
    }
    else if (nutrientTargets[nutrient + '_max'] > 0 && nutrientInIngredients > nutrientTargets[nutrient + '_max']) {
        pct = (pct.toFixed(0) + " %").red.bold.inverse;
    }
    else {
        pct = (pct.toFixed(0) + " %").green;
    }

    nutrientsTable.push([
        nutrient || '',                           // Nutrient Name
        nutrientTargets[nutrient] || '',          // Target amount
        nutrientTargets[nutrient + '_max'] || '', // Maximum amount
        nutrientInIngredients.toFixed(2) || '',   // Amount in Recipe
        pct || ''                                 // % of Target in recipe
    ]);
}

console.log(nutrientsTable.toString());

}