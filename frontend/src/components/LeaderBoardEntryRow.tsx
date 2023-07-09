import { createElement, Fragment } from 'react';
import { Table } from 'semantic-ui-react';

import type { LeaderBoard, ResultRow } from '../models/leaderboard';
import { date2str } from '../util/date';
import ProgressGradient from './util/ProgressGradient';

interface LeaderBoardEntryRowProps {
	readonly idx: number;
	readonly row: ResultRow;
	readonly board: LeaderBoard;
}

const LeaderBoardEntryRow: React.FC<LeaderBoardEntryRowProps> = props => {
	return (
		<Table.Row>
			<Table.Cell>{props.idx + 1}</Table.Cell>
			<Table.Cell>{props.row.name}</Table.Cell>
			<Table.Cell>
				<ProgressGradient
					content={props.row.score.toString()}
					cur={props.row.score}
					max={props.board.score}
				/>
			</Table.Cell>
			{
				props.row.state.map((optionalTime, idx) =>
					<Table.Cell key={idx}>
						{
							optionalTime
								? <>
									<ProgressGradient
										content={props.board.flags[idx].score.toString()}
										cur={1}
										max={1}
									/>
									<br />
									<span className="prompt no-wrap">{date2str(new Date(optionalTime * 1e3))}</span>
								</>
								: null
						}
					</Table.Cell>
				)
			}
		</Table.Row>
	)
}

LeaderBoardEntryRow.displayName = 'LeaderBoardEntryRow';

export default LeaderBoardEntryRow;
