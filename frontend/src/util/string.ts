function isAlnum(ch: number) { return (48 <= ch && ch <= 57) || (65 <= ch && ch <= 90) || (97 <= ch && ch <= 122); }
/**
 * Automatically add spaces between two bundles.
 * @param left The left bundle.
 * @param right The right bundle.
 * @returns (left + right) or (left + ' ' + right), depending on type.
 */
export function autoSpace(left: string, right: string) {
	if (!(left && right)) return left + right;
	const l = left.charCodeAt(left.length - 1), r = right.charCodeAt(0);
	return left
		+ ((0x3400 <= l && l <= 0x9fff && isAlnum(r)) || (0x3400 <= r && r <= 0x9fff && isAlnum(l)) ? ' ' : '')
		+ right;
}

const htmlspecialchars: Record<string, string> = { '"': '&quot;', '&': '&amp;', '<': '&lt;', '>': '&gt;' };
export function escapeHTML(string: string) { return string.replace(/["&<>]/g, char => htmlspecialchars[char]); }

const jsspecialchars: Record<string, string> = { "'": "\\'", '\\': '\\\\' };
export function escapeJS(string: string) { return string.replace(/['\\]/g, char => jsspecialchars[char]); }

/**
 * Strip leading zero of a number.
 * @param string Numeric string, assume it is valid.
 * @returns The corresponding numeric string without leading zero.
 * @example '003' => '3', '00' => '0', '0.25' => '.25'.
 */
export function stripLeadingZero(string: string) {
	string = string.trim();
	return string.slice(string.search(/[^0]/));
}

/**
 * Strip trailing zero of a number.
 * @param string Numeric string, assume it is valid.
 * @returns The corresponding numeric string without trailing zero.
 * @example '12.50' => '12.5', '300' => '300', '7.00' => '7'.
 */
export function stripTrailingZero(string: string) {
	string = string.trim();
	return string.includes('.') ? string.replace(/\.?0+$/, '') : string;
}

/**
 * Compute non-overlapping LCP and LCS.
 * @param s1 The first string.
 * @param s2 The second string.
 * @returns [a, b], the length of LCP and the LCS, non-overlapping.
 * @example ('abcdeyz', 'abcxyz') => [3, 2], ('ababa', 'aba') => [3, 0].
 */
export function PTSDecomposition(s1: string, s2: string): [number, number] {
	const m = Math.min(s1.length, s2.length);
	let p, s;
	for (p = 0; p < m && s1[p] === s2[p]; ++p);
	for (s = 0; s < m - p && s1[s1.length - s - 1] === s2[s2.length - s - 1]; ++s);
	return [p, s];
}

/**
 * Find some random identifier that is not appear in some code.
 * @param code The code snipppet.
 * @returns Some random identifier that is not appear in `code`.
 */
const identifierChars = '$0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz';
export function getIdentifierNotUsed(code: string) {
	for (let i = 5; ; ++i) {
		for (let j = 0; j < i; ++j) {
			let s = '$';
			for (let k = 0; k < i; ++k)
				s += identifierChars[Math.floor(Math.random() * identifierChars.length)];
			if (!code.includes(s))
				return s;
		}
	}
}
