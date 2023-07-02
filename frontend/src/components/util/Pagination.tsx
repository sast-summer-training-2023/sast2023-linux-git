import { createElement } from 'react';
import { Icon, Pagination as RawPagination, type PaginationProps as RawPaginationProps } from 'semantic-ui-react';

interface PaginationProps {
	readonly page: number;
	readonly total: number;
	readonly onPageChange: (data: RawPaginationProps) => void;
}

const Pagination: React.FC<PaginationProps> = props => {
	return (
		props.total > 1
			? <RawPagination
				firstItem={{ icon: true, content: <Icon name='angle double left' />, disabled: props.page === 1 }}
				prevItem={{ icon: true, content: <Icon name='angle left' />, disabled: props.page === 1 }}
				nextItem={{ icon: true, content: <Icon name='angle right' />, disabled: props.page === props.total }}
				lastItem={{ icon: true, content: <Icon name='angle double right' />, disabled: props.page === props.total }}

				activePage={props.page}
				boundaryRange={0}
				ellipsisItem={null}
				onPageChange={(_, data) => props.onPageChange(data)}
				siblingRange={4}
				totalPages={props.total}
			/>
			: null
	);
};

export default Pagination;
