import divide from '../math';

const multiplierObj = {
    multiplier10: 10,
    multiplier20: 20
}

function sum(a, b) {
    return a + b + multiplierObj.multiplier10;
}

function divideFn(a) {
    return divide(a, 10);
}

const removeFn = function(a) {return 0};

export default sum;