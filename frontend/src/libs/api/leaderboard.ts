import type { LeaderBoard } from '../../models/leaderboard';
import { POST } from '../../util/web';
import { backendUrl } from './url';

export function getLeaderBoard(): Promise<LeaderBoard> {
	return POST(new URL('/query', backendUrl), {});
}
