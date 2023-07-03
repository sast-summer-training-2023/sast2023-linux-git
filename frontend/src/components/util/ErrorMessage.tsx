import { createElement } from 'react';
import { Icon, Message, type MessageProps } from 'semantic-ui-react';

import { err2lines } from '../../util/type';

interface ErrorMessageProps extends MessageProps {
	readonly err: unknown;
}

const ErrorMessage: React.FC<ErrorMessageProps> = props => {
	const rest: MessageProps = { ...props };
	delete rest.err;
	return (
		<Message icon error {...rest}>
			<Icon name="remove" />
			<Message.Content>
				<Message.Header content="错误" />
				<Message.List>
					{err2lines(props.err).map((line, idx) => <Message.Item key={idx} content={line} />)}
				</Message.List>
			</Message.Content>
		</Message>
	);
}

ErrorMessage.displayName = 'ErrorMessage';

export default ErrorMessage;
