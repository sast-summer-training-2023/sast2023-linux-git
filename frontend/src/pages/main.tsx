import { createElement, Fragment } from 'react';
import { Header, Message, Segment } from 'semantic-ui-react';

const main: React.FC = () => {
	// 用 WebSocket/socket.io 等动态更新榜单的功能先鸽了🕊🕊🕊
	// Bonus 3 flag: sast2023{web-debugger}

	return (
		<>
			<Header
				block
				as="h3"
				content="排行榜"
				attached="top"
			/>
			<Segment attached="bottom">
				<p>🚧 建设中 ... 🚧</p>
			</Segment>
		</>
	);
}

export default main;
