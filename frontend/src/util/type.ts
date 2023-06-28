export const AsyncFunction: FunctionConstructor = Object.getPrototypeOf(async function () {/* get prototype */}).constructor;

export function assert(expression: unknown): asserts expression {
	if (!expression) throw new Error('Assertion failed');
}

export function isObject(value: unknown): value is object {
	return value?.constructor === Object && Object.prototype.toString.call(value) === '[object Object]' && Object.getPrototypeOf(value) === Object.prototype;
}

export function isEmptyObject(value: unknown, allowArray = true) {
	if (!allowArray && Array.isArray(value)) return false;
	for (const _ in <object>value) return false;
	return true;
}

/**
 * Convert an error into a '\n'-separted string.
 * @param err The error to be converted, may not be an `Error` object.
 * @returns The result string.
 */
export function err2str(err: unknown): string {
	const stack = (<{ stack: unknown }>err)?.stack, str = err?.toString?.() ?? '';
	if (typeof stack !== 'string') return str;
	const pos = (stack + '\n').indexOf('\n'), msg = (<{ message: string }>err)?.message;
	return str + (
		msg && stack.substring(0, pos).includes(msg)
			? stack.substring(pos)
			: '\n' + stack
	);
}

/**
 * Convert an error into lines.
 * @param err The error to be converted, may not be an `Error` object.
 * @returns The array of lines.
 */
export function err2lines(err: unknown): string[] {
	const ret = err2str(err).split('\n');
	if (ret.length > 16) ret.splice(15, ret.length, '……');
	return ret.map(line => line.length > 256 ? line.substring(0, 64) + ' …… ' + line.substring(line.length - 64) : line);
}
