import { Buffer } from '../buffer';
import { assert } from './type';

/**
 * Compute the GCD (greatest common divisor) of two bigints.
 * @returns gcd(a, b).
 */
export function gcd(a: bigint, b: bigint): bigint {
	return b ? gcd(b, a % b) : a;
}

/**
 * Compute a^n mod m.
 * @returns a^n mod m.
 */
export function PowerMod(a: bigint, n: bigint, m: bigint) {
	let c = 1n;
	for (a %= m; n; n >>= 1n, a = a * a % m) if (n & 1n) c = c * a % m;
	return c % m;
}

/**
 * Get a (nearly uniform) random integer in [0, n).
 * @returns The random number.
 */
export function Zn(n: bigint) {
	return Buffer.random(n.toString(16).length / 2 + 5).asBigInt() % n;
}

/**
 * Check whether value is an integer between low and high.
 * @param value The value to be tested.
 * @param low The lower bound.
 * @param high The upper bound.
 * @returns The test result.
 */
export function checkIntRange(value: unknown, low: number, high: number): value is number {
	return Number.isSafeInteger(value) && low <= value && value <= high;
}

/**
 * Check whether value is an integer between low and high, if it is, return `value`, otherwise return `defaultValue`.
 * @param value The value to be tested.
 * @param low The lower bound.
 * @param high The upper bound.
 * @param defaultValue The default value.
 * @returns `value` or `defaultValue`, depending on `checkIntRange(value, low, high)`.
 */
export function clipInt(value: unknown, low: number, high: number, defaultValue: number) {
	return checkIntRange(value, low, high) ? value : defaultValue;
}

/**
 * Return an object that produces a sequence of integers from start (inclusive) to stop (exclusive) by step, similar to `range` in Python 3.
 * @returns the [i, i+1, i+2, ..., j-1] list
 */
export function range(start: unknown, stop: unknown, step: unknown = 1) {
	assert(Number.isSafeInteger(start) && Number.isSafeInteger(stop) && Number.isSafeInteger(step));
	const length = Math.floor((stop - start + step - Math.sign(step)) / step);
	assert(checkIntRange(length, 0, 0xffffff));
	return Array.from({ length }, (_, idx) => start + step * idx);
}
