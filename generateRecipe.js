/**
 * Nonlinear Auto-Soylent Solver v0.2
 *
 * by  Alrecenk (Matt McDaniel) of Inductive Bias LLC (http://www.inductivebias.com)
 * and Nick Poulden of DIY Soylent (http://diy.soylent.me)
 *
 */

var nutrients = require('./nutrients')

var ingredientLength,
    targetLength, // Length of ingredient and target array (also dimensions of m)
    M,            // Matrix mapping ingredient amounts to chemical amounts (values are fraction per serving of target value)
    cost,         // Cost of each ingredient per serving
    w = .0001,    // Weight cost regularization (creates sparse recipes for large numbers of ingredient, use 0 for few ingredients)
    maxPerMin,    // Ratio of maximum value to taget value for each ingredient
    lowWeight,
    highWeight;   // How to weight penalties for going over or under a requirement

/**
 * Fitness function that is being optimized
 *
 * Note: target values are assumed as 1 meaning M amounts are normalized to be fractions of target values does not
 * consider constraints, those are managed elsewhere.
 *
 * Based on the formula (M * x-1)^2 + w *(x dot c) except that penalties are only given if above max or below min and
 * quadratically from that point.
 *
 * @author Alrecenk (Matt McDaniel) of Inductive Bias LLC (www.inductivebias.com) March 2014
 */
function f(x) {

    var output = new Array(targetLength),
        totalError = 0;

    // M*x - 1
    for (var t = 0; t < targetLength; t++) {
        // Calculate output
        output[t] = 0;
        for (var i = 0; i < ingredientLength; i++) {
            output[t] += M[i][t] * x[i];
        }
        // If too low penalize with low weight
        if (output[t] < 1) {
            totalError += lowWeight[t] * (1 - output[t]) * (1 - output[t]);
        }
        else if (output[t] > maxPerMin[t]){ // If too high penalize with high weight
            totalError += highWeight[t] * (maxPerMin[t] - output[t]) * (maxPerMin[t] - output[t]);
        }
    }

    // Calculate cost penalty, |c*x|
    // but X is nonnegative so absolute values aren't necessarry
    var penalty = 0;
    for (var i = 0; i < ingredientLength; i++) {
        penalty += cost[i] * x[i];
    }

    return totalError + w * penalty;
}

/**
 * Gradient of f with respect to x.
 * Based on the formula 2 M^T(Mx-1) + wc except with separate parabolas for going over or under.
 * Does not consdier constraints, those are managed elsewhere.
 *
 * @author Alrecenk (Matt McDaniel) of Inductive Bias LLC (www.inductivebias.com) March 2014
 */
function gradient(x){

    var output = new Array(targetLength);

    // output = M*x
    for (var t = 0; t < targetLength; t++) {
        // Calculate output
        output[t] = 0;
        for (var i = 0; i < ingredientLength; i++) {
            output[t] += M[i][t] * x[i];
        }
    }

    // Initialize gradient
    var dx = [];
    for (var i = 0; i < ingredientLength; i++) {
        dx[i] = 0;
        for (var t = 0; t < targetLength; t++) {
            // M^t (error)
            if (output[t] < 1) { // If output too low calculate gradient from low parabola
                dx[i] += lowWeight[t] * M[i][t] * (output[t] - 1);
            }
            else if (output[t] > maxPerMin[t]) { // If output too high calculate gradient from high parabola
                dx[i] += highWeight[t] * M[i][t] * (output[t] - maxPerMin[t]);
            }
        }
        dx[i] += cost[i] * w; // + c w
    }
    return dx;
}

/**
 * Generates a recipe based on gradient descent minimzation of a fitness function cosisting of half parabola penalties
 * for out of range items and weighted monetary cost minimzation.
 *
 * @author Alrecenk (Matt McDaniel) of Inductive Bias LLC (www.inductivebias.com) March 2014
 */
function generateRecipe(ingredients, nutrientTargets) {

    // Initialize our return object: an array of ingredient quantities (in the same order the ingredients are passed in)
    var ingredientQuantities = [],
        targetAmount = [], // Target amounts used to convert ingredient amounts to per serving ratios
        targetName = [],
        x = []; // Number of servings of each ingredient

    // Fetch the target values ignoring the "max" values and any nonnumerical variables
    for (var key in nutrientTargets) {
        var name = key,
            nutrient = name.replace(/_max$/, '')
        value = nutrientTargets[key];

        if (nutrients.micro.indexOf(nutrient) > -1 && name.substring(name.length - 4, name.length) != "_max" && value > 0) {
            targetName.push(name);
            targetAmount.push(value);
        }
    }

    maxPerMin = [];
    lowWeight = [];
    highWeight = [];

    // Initialize target amount maxes and mins along with weights.
    // There are some hardcoded rules that should be made configurable in the future.
    for (var t = 0; t < targetAmount.length; t++) {
        // If has a max for this element
        if (typeof nutrientTargets[targetName[t] + "_max"] > targetAmount[t]) {
            var maxvalue = nutrientTargets[targetName[t] + "_max"];
            maxPerMin[t] = maxvalue / targetAmount[t]; // Record it
        }
        else {
            maxPerMin[t] = 1000; // Max is super high for things that aren't limited
        }

        // Weight macro nutrients values higher and make sure we penalize for going over (ad hoc common sense rule)
        if (nutrients.macro.indexOf(targetName[t]) >= 0) {
            lowWeight[t] = 5;
            highWeight[t] = 5;
            maxPerMin[t] = 1;
        }
        else {
            lowWeight[t] = 1;
            highWeight[t] = 1;
        }

        // Weird glitch where niacin isn't being read as having a max, so I hardcoded in this
        // should be removed when that is tracked down
        if (targetName[t] =="niacin"){
            maxPerMin[t] = 30.0 / 16.0;
        }
        // console.log(targetName[t] + " : " + targetAmount[t] +" --max ratio :" + maxPerMin[t] +" weights :" + lowWeight[t]+"," + highWeight[t]);
    }

    // Intitialize the matrix mapping ingredients to chemicals and the cost weights.
    // These are the constants necessary to evaluate the fitness function and gradient.

    ingredientLength = ingredients.length;
    targetLength = targetAmount.length;
    M = make2dArray(ingredientLength, targetLength);
    cost = [];

    for (var i = 0; i < ingredients.length; i++) {
        for (var t = 0; t < targetAmount.length; t++) {
            // Fraction of daily value of target t in ingredient i
            M[i][t] = ingredients[i][targetName[t]] / (targetAmount[t]);
        }

        // Initial x doesn't affect result but a good guess may improve speed
        x[i] = 1; // Initialize with one of everything

        // Cost per serving is cost per container * servings per container
        cost[i] = ingredients[i].item_cost * ingredients[i].serving / ingredients[i].container_size;
    }

    // Projected Gradient descent with halving step size, accepting largest step with improvement.
    // Could be made faster by moving to LBGS and implementing a proper inexact line search
    // but this method does guarantee convergence so those improvements are on the back burner
    console.log("Calculating Optimal Recipe...");

    var fv = f(x),
        g = gradient(x),
        iteration = 0;

    while (!done && iteration < 50000) { // Loops until no improvement can be made or max iterations
        iteration++;

        var done = false,
            stepsize = 10, // Start with big step
            linesearch = true;

        while (linesearch) {
            var newx = [];

            // Calculate new potential value
            for (var i = 0; i < x.length; i++) {
                newx[i] = x[i] - g[i] * stepsize;
                if (newx[i] < 0) {
                    newx[i] = 0;
                }
            }

            var newf = f(newx); // Get fitness
            if (newf < fv) {    // If improvement then accept and recalculate gradient
                fv = newf;
                x = newx;
                g = gradient(x);
                linesearch = false; // exit line search
            }
            else {
                stepsize *= 0.5; // If bad then halve step size
                if (stepsize < 0.00000001) { // If stepsize too small then quit search entirely
                    done = true;
                    linesearch = false;
                }
                else { // otherwise continue line search
                    linesearch = true;
                }
            }
        }
    }

    var pricePerDay = 0;
    for (var k = 0; k < x.length; k++) {
        pricePerDay += x[k] * cost[k];
    }

    console.log("Price per day: $" + pricePerDay.toFixed(2));

    // Map number of servings into raw quantities because that's what this function is supposed to return
    for (var i = 0; i < ingredients.length; i++) {
        ingredientQuantities[i] = x[i] * ingredients[i].serving;
    }

    return ingredientQuantities;
}

function make2dArray(a,b) {
    var spine = new Array(a);
    // did you know that Array.map skips uninitialized entries?
    for(var i = 0; i < a; i++) { spine[i] = new Array(b)};
    return spine;
}

module.exports = generateRecipe;