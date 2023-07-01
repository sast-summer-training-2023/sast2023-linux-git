import { createElement, Fragment, useEffect, useState } from 'react';
import { Table } from 'semantic-ui-react';

import { LeaderBoard, ResultRow } from '../models/leaderboard';
import { date2str } from '../util/date';
import ProgressGradient from './util/ProgressGradient';
import TableLoader from './util/TableLoader';
import WithCode from './util/WithCode';

interface LeaderBoardEntryRowProps {
	readonly idx: number;
	readonly row: ResultRow;
	readonly board: LeaderBoard;
}

interface StandingsTableProps {
	readonly board: LeaderBoard | null;
}

type SortFunction = (x: ResultRow, y: ResultRow) => boolean;

const SORT_BY_ID: SortFunction = (x: ResultRow, y: ResultRow) => x.id < y.id;
const SORT_BY_SCORE: SortFunction = (x: ResultRow, y: ResultRow) => {
	if (x.score !== y.score) return x.score > y.score;
	if (x.latest !== y.latest) return x.latest < y.latest;
	return x.id < y.id;
}

function doSort(rows: ResultRow[], compare: SortFunction, reverse: boolean): ResultRow[] {
	return rows.sort(
		(x, y) =>
			compare(x, y) ? (reverse ? 1 : -1) :
				compare(y, x) ? (reverse ? -1 : 1) :
					0);
}

export const LeaderBoardEntryRow: React.FC<LeaderBoardEntryRowProps> = props => {
	return (
		<Table.Row>
			<Table.Cell>{props.idx + 1}</Table.Cell>
			<Table.Cell>
				{props.row.id}
				<br />
				<span className="prompt">{props.row.name}</span>
			</Table.Cell>
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

export const StandingsTable: React.FC<StandingsTableProps> = props => {
	const [sortFunction, setSortFunction] = useState<[SortFunction]>([SORT_BY_SCORE]); // function hack
	const [sortReverse, setSortReverse] = useState<boolean>(false);
	const [rows, setRows] = useState<ResultRow[]>([]);

	useEffect(() => {
		const rows = [...(props.board?.data ?? [])];
		setRows(doSort(rows, sortFunction[0], sortReverse));
	}, [props.board]);

	function handleSort(compare: SortFunction) {
		if (sortFunction[0] === compare) {
			setSortReverse(!sortReverse);
			const rows_ = [...rows];
			setRows(rows_.reverse());
		} else {
			setSortFunction([compare]);
			setSortReverse(false);
			const rows = [...(props.board?.data ?? [])];
			setRows(doSort(rows, compare, false));
		}
	}

	return (
		<div className="standings-table">
			<Table textAlign="center" celled sortable unstackable className="standings-table">
				<Table.Header>
					<Table.Row>
						<Table.HeaderCell rowSpan={2}>#</Table.HeaderCell>
						<Table.HeaderCell
							rowSpan={2}
							sorted={sortFunction[0] === SORT_BY_ID ? (sortReverse ? 'descending' : 'ascending') : undefined}
							onClick={() => handleSort(SORT_BY_ID)}
						>
							ID
						</Table.HeaderCell>
						<Table.HeaderCell
							rowSpan={2}
							sorted={sortFunction[0] === SORT_BY_SCORE ? (sortReverse ? 'ascending' : 'descending') : undefined}
							onClick={() => handleSort(SORT_BY_SCORE)}
						>
							Score
						</Table.HeaderCell>
						{
							props.board?.categories.map(({ name, flags }, idx) =>
								<Table.HeaderCell key={idx} colSpan={flags.length}>
									<WithCode content={name} />
								</Table.HeaderCell>
							)
						}
					</Table.Row>
					<Table.Row>
						<Table.HeaderCell style={{ display: 'none' }} /* CSS Hack */></Table.HeaderCell>
						{
							props.board?.flags.map(({ name, count }, idx) =>
								<Table.HeaderCell key={idx} className="no-wrap">
									<WithCode content={name} />
									<br />
									<span className="prompt">(count: <ProgressGradient
										content={count.toString()}
										cur={count}
										max={props.board!.data.length}
									/>)</span>
								</Table.HeaderCell>
							)
						}
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{props.board
						? rows.map(
							(row, idx) => {
								const real_idx = sortReverse ? props.board!.data.length - idx - 1 : idx;
								return <LeaderBoardEntryRow key={real_idx} idx={real_idx} row={row} board={props.board!} />;
							}
						)
						: <TableLoader colSpan={3} />
					}
				</Table.Body>
			</Table>
		</div>
	);
}
