import { createElement } from 'react';
import { Container, Menu } from 'semantic-ui-react';

import menu from '../../menu';

const Header: React.FC = () => {
	return (
		<Menu fixed="top" borderless>
			<Container>
				{
					Object.entries(menu).map(([key, { icon, name, to }]) => {
						const active = location.pathname === to;
						return (
							<Menu.Item
								active={active}
								content={name}
								href={active ? null : to}
								icon={icon}
								key={key}
							/>
						)
					})
				}
			</Container>
		</Menu>
	);
}

Header.displayName = 'Header';

export default Header;
