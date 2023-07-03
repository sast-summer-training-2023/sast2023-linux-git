import { createElement, Fragment, type ReactNode } from 'react';

interface WithCodeProps {
	readonly content: string;
}

const WithCode: React.FC<WithCodeProps> = props => {
	const nodes: ReactNode[] = [], { content } = props;
	let last = 0;
	for (const { 1: match, indices } of content.matchAll(/`(.*?)`/dg)) {
		const [l, r] = indices![0];
		nodes.push(content.substring(last, l), <code>{match}</code>);
		last = r;
	}
	nodes.push(content.substring(last));
	return <>{...nodes}</>;
}

WithCode.displayName = 'WithCode';

export default WithCode;
