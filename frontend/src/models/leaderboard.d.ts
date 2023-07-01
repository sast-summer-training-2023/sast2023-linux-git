import { Category } from '../util/leaderboard';

export { Category };

export interface FlagInfo {
	/** The description of the flag. */
	name: string;
	/** The score of the flag. */
	score: number;
	/** The category name of the flag. */
	category: string;

	/** The category object of the flag. */
	categoryObj: Category;
	/** Number of participants achieved this flag. */
	count: number;
}

export interface ResultRow {
	/** Student id. */
	id: number;
	/** Student name. */
	name: string;
	/** `null` denotes not achieved yet, a number denotes the achievement time. */
	state: (number | null)[];

	/** Total score. */
	score: number;
	/** Latest submit time. */
	latest: number;
}

export interface LeaderBoard {
	/** Current timestamp. */
	time: number;
	/** Information of all flags. */
	flags: FlagInfo[];
	/** All participants' data. */
	data: ResultRow[];

	/** Information of all categories. */
	categories: Category[];
	/** Total score. */
	score: number;
}
