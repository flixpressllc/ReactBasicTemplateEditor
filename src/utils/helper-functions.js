function round(value, decimals) {
    decimals = decimals === undefined ? 2 : decimals;
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

export {round};
