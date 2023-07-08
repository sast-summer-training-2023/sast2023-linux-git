import type { FlagInfo, LeaderBoard } from '../models/leaderboard';
import { assert } from './type';

import '../styles/leaderboard.css';

export class Category {
	/** The description of this category. */
	name: string;
	/** The index of this category in `categories[]`. */
	index: number;
	/** The flags in this category. */
	flags: FlagInfo[];

	constructor(name: string, index: number) {
		this.name = name;
		this.index = index;
		this.flags = [];
	}
}

/**
 * Cluster the consecutive flags into groups (components).
 * @param flags The raw flags.
 * @returns The array of categories.
 * @example ["s", "s", "t", "s"] => ["s"(2), "t"(1), "s"(1)]
 */
export function clustering(flags: FlagInfo[]) {
	const categories: Category[] = [];
	for (const flag of flags) {
		const last = categories.at(-1);
		const category = (() => {
			if (flag.category === last?.name)
				return last;
			const c = new Category(flag.category, categories.length);
			categories.push(c);
			return c;
		})();
		flag.categoryObj = category;
		category.flags.push(flag);
	}
	return categories;
}

/**
 * Analyze student's score and problem's status.
 * @param board The whole board.
 */
export function analyze(board: LeaderBoard) {
	const { flags } = board;
	board.score = flags.reduce((score, flag) => score + flag.score, 0);
	for (const flag of flags) flag.count = 0;
	for (const row of board.data) {
		assert(row.state.length === flags.length);
		row.score = 0;
		row.latest = 0;
		row.categoryInfo = Array.from({ length: board.categories.length }, () => ({ score: 0, latest: 0 }));
		flags.forEach((flag, idx) => {
			if (row.state[idx]) {
				++flag.count;
				row.score += flag.score;
				row.latest = Math.max(row.latest, row.state[idx]!);
				const ci = row.categoryInfo[flag.categoryObj.index];
				ci.score += flag.score;
				ci.latest = Math.max(ci.latest, row.state[idx]!);
			}
		});
	}
}
