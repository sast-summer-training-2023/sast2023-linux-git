import { createElement, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Container } from 'semantic-ui-react';

import Header from './components/util/Header';
import Main from './pages/main';

import './styles/main.css';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<Header />
		<Container className="main">
			<Main />
		</Container>
	</StrictMode>
);
