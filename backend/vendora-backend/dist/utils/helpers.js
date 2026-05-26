"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep = exports.generateSKU = exports.formatDecimal = void 0;
/**
 * Format Decimal to number
 */
const formatDecimal = (decimal) => {
    if (!decimal)
        return 0;
    return Number(decimal);
};
exports.formatDecimal = formatDecimal;
/**
 * Generate a random SKU if not provided
 */
const generateSKU = (prefix = 'VDR') => {
    return `${prefix}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
};
exports.generateSKU = generateSKU;
/**
 * Simple delay helper
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
exports.sleep = sleep;
