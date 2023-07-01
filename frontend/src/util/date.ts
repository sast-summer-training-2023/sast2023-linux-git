/**
 * Convert the date part of a date to string.
 * @param date The date to be converted.
 * @param UTC Whether to regard `date` as UTC time.
 * @returns The string result.
 */
export function date2datestr(date: Date, UTC?: boolean) {
	return UTC
		// ? `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}`
		// : `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
		? `${date.getUTCMonth() + 1}-${date.getUTCDate()}`
		: `${date.getMonth() + 1}-${date.getDate()}`;
}

/**
 * Convert the time part of a date to string.
 * @param date The date to be converted.
 * @param UTC Whether to regard `date` as UTC time.
 * @returns The string result.
 */
export function date2timestr(date: Date, UTC?: boolean) {
	return UTC
		// ? `${date.getUTCHours()}:${date.getUTCMinutes().toString().padStart(2, '0')}:${date.getUTCSeconds().toString().padStart(2, '0')}`
		// : `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
		? `${date.getUTCHours()}:${date.getUTCMinutes().toString().padStart(2, '0')}`
		: `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
}

/**
 * Convert the full part of a date to string.
 * @param date The date to be converted.
 * @param UTC Whether to regard `date` as UTC time.
 * @returns The string result.
 */
export function date2str(date: Date, UTC?: boolean) {
	return date2datestr(date, UTC) + ' ' + date2timestr(date, UTC);
}
