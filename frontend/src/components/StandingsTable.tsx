import { createElement, Fragment, useEffect, useState } from 'react';
import { Table, type PaginationProps } from 'semantic-ui-react';

import type { LeaderBoard, ResultRow } from '../models/leaderboard';
import { clipInt } from '../util/nt';
import LeaderBoardEntryRow from './LeaderBoardEntryRow';
import Pagination from './util/Pagination';
import ProgressGradient from './util/ProgressGradient';
import TableLoader from './util/TableLoader';
import WithCode from './util/WithCode';

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
const SORT_BY_PART_n: (n: number) => SortFunction = (n: number) => (x: ResultRow, y: ResultRow) => {
	const l = x.state[n] ?? Infinity, r = y.state[n] ?? Infinity;
	return l === r ? x.id < y.id : l < r;
}
const SORT_BY_PART: SortFunction[] = [];
function doSort(rows: ResultRow[], compare: SortFunction, reverse: boolean): ResultRow[] {
	return rows.sort(
		(x, y) =>
			compare(x, y) ? (reverse ? 1 : -1) :
				compare(y, x) ? (reverse ? -1 : 1) :
					0);
}

const ROWS_PER_PAGE = clipInt(parseInt(localStorage.getItem('rowsPerPage')!), 10, 200, 50);

const StandingsTable: React.FC<StandingsTableProps> = props => {
	const [sortFunction, setSortFunction] = useState<[SortFunction]>([SORT_BY_SCORE]); // function hack
	const [sortReverse, setSortReverse] = useState(false);
	const [rows, setRows] = useState<ResultRow[]>([]);
	const [page, setPage] = useState(1);

	useEffect(() => {
		const rows = [...(props.board?.data ?? [])];
		if (props.board)
			for (; SORT_BY_PART.length < props.board.flags.length;)
				SORT_BY_PART.push(SORT_BY_PART_n(SORT_BY_PART.length));
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

	function handlePageChange({ activePage }: PaginationProps) {
		setPage(activePage as number);
	}

	return (
		<>
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
									<Table.HeaderCell
										key={idx}
										className="no-wrap"
										sorted={sortFunction[0] === SORT_BY_PART[idx] ? (sortReverse ? 'ascending' : 'descending') : undefined}
										onClick={() => handleSort(SORT_BY_PART[idx])}
									>
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
							? rows
								.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE)
								.map(
									(row, idx) => {
										idx += (page - 1) * ROWS_PER_PAGE;
										if (sortReverse) idx = props.board!.data.length - idx - 1;
										return <LeaderBoardEntryRow key={idx} idx={idx} row={row} board={props.board!} />;
									}
								)
							: <TableLoader colSpan={3} />
						}
					</Table.Body>
				</Table>
			</div>
			<div style={{ textAlign: 'center', marginTop: '1rem' }}>
				<Pagination page={page} total={Math.ceil(rows.length / ROWS_PER_PAGE)} onPageChange={handlePageChange} />
			</div>
		</>
	);
}

StandingsTable.displayName = 'StandingsTable';

export default StandingsTable;
