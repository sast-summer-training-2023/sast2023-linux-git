import { createElement } from 'react';

interface ProgressGradientProps {
	readonly content: string;
	readonly cur: number;
	readonly max: number;
}

const ProgressGradient: React.FC<ProgressGradientProps> = props => {
	const progress = props.cur >= props.max ? 10 : props.cur <= 0 ? 0 : Math.floor(10 * props.cur / props.max)
	return <span className={`progress-${progress}`}>{props.content}</span>;
}

export default ProgressGradient;
