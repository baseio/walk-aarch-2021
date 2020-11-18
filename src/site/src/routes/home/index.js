import { h } from 'preact';
import { Link } from 'preact-router/match';
import style from './style.css';
import Anim from '../../components/anim'

const Home = ({student='def'}) => (
	<div class={style.home}>
		<h1>Home</h1>
		<p>This is the Home component student: {student}</p>
		<p>
			<Link activeClassName={style.active} href="/ole">/ole</Link><br />
			<Link activeClassName={style.active} href="/per">/per</Link><br />
			<Link activeClassName={style.active} href="/pages/about">about</Link><br />
			<Link activeClassName={style.active} href="/pages/creds">creds</Link><br />

		</p>
		<Anim student={student} />
	</div>
);

export default Home;
