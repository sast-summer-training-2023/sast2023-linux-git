import { createElement, Fragment, useEffect, useState } from 'react';
import { Header, Segment } from 'semantic-ui-react';

import StandingsTable from '../components/StandingsTable';
import ErrorMessage from '../components/util/ErrorMessage';
import { getLeaderBoard } from '../libs/api/leaderboard';
import type { LeaderBoard } from '../models/leaderboard';
import { analyze, clustering } from '../util/leaderboard';

const main: React.FC = () => {
	// 用 WebSocket/socket.io 等动态更新榜单的功能先鸽了🕊🕊🕊
	// Bonus 3 flag: sast2023{web-debugger}

	const [leaderBoardData, setLeaderBoardData] = useState<LeaderBoard | null>(null);
	const [error, setError] = useState<unknown>(null);

	useEffect(() => {
		getLeaderBoard().then(
			data => {
				data.categories = clustering(data.flags);
				analyze(data);
				setLeaderBoardData(data);
			},
			setError
		);
	}, []);

	return (
		<>
			<Header
				block
				as="h3"
				content="Leaderboard"
				attached="top"
			/>
			<Segment attached="bottom">
				{error
					? <ErrorMessage err={error} />
					: <StandingsTable board={leaderBoardData} />
				}
			</Segment>
		</>
	);
}

main.displayName = 'main';

export default main;
