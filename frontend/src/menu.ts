import type { SemanticICONS } from 'semantic-ui-react';

export interface MenuItem {
	icon: SemanticICONS;
	name: string;
	to: string;
}

const Menu: Record<string, MenuItem> = {
	index: {
		icon: 'chart bar',
		name: 'Leaderboard',
		to: '/'
	}
};

export default Menu;
