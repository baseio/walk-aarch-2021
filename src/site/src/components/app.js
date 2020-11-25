import { h } from 'preact';
import { Router } from 'preact-router';

// Code-splitting is automated for `routes` directory
import Home from '../routes/home';
import Profile from '../routes/profile';
import Page from '../routes/page';

const App = () => (
	<div id="app">
		<Router>
			<Home path="/:student?" />
			<Profile path="/profile/" user="me" />
			<Profile path="/profile/:user" />
			<Page path="/pages/:page?" />
		</Router>
	</div>
)

export default App;
