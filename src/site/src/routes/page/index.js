import { h } from 'preact';
import {useEffect, useState} from "preact/hooks";
import style from './style.css';

const Page = ({ page }) => {
	
	return (
		<div class={style.page}>
			<h1>Page: {page}</h1>
		</div>
	);
}

export default Page;
