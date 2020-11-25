import { h } from 'preact';
import { Link } from 'preact-router/match';
import style from './style.css';


import Config from '../../config.js'

import Anim from '../../components/anim'


const Home = ({student='def'}) => (
	
	
	<div class={style.home}>

		<div class="animation">		
			<Anim student={student} />
		</div>

		<div class="overlay">

			<h1 class="title" style="width: 0px; line-height: 100%;">{Config.title}</h1>

		</div>

		<h1>Home</h1>
		<p>This is the Home component student: {student}</p>
		<p>
			<Link activeClassName={style.active} href="/ole">/ole</Link><br />
			<Link activeClassName={style.active} href="/per">/per</Link><br />
			<Link activeClassName={style.active} href="/pages/about">about</Link><br />
			<Link activeClassName={style.active} href="/pages/creds">creds</Link><br />

		</p>
	</div>
);

export default Home;
