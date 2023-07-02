export type Mutable<T> = {
	-readonly [P in keyof T]: T[P];
}

declare global {
	interface NumberConstructor {
		isSafeInteger(number: unknown): number is number;
	}
}
