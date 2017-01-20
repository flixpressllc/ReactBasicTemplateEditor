export function round(value, decimals) {
    decimals = decimals === undefined ? 2 : decimals;
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

export function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}


