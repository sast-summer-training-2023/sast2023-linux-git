import { createElement } from 'react';
import { Table, Loader } from 'semantic-ui-react';

interface TableLoaderProps {
	readonly colSpan: number;
}

const TableLoader: React.FC<TableLoaderProps> = props => {
	return (
		<Table.Row className="list-loading">
			<Table.Cell colSpan={props.colSpan}>
				<Loader active />
			</Table.Cell>
		</Table.Row>
	);
}

TableLoader.displayName = 'TableLoader';

export default TableLoader;
