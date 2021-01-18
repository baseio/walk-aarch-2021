export const render_hash = ( str='') => {
	return `<div>${HASH}<span style="
		position: relative;
    	top: -49px;
    	left: 39px;
    ">${str}</span></div>`
	
	// return `:<br />[#]<span class="spacer-hash">&nbsp;</span>`
}


const HASH = `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
		 viewBox="0 0 165 200" xml:space="preserve" style="
		left: -4px;
		top: 3px;
		position: relative;
		fill: #fff;
		width: 32px;
	">
	<g>
		<path d="M75.9,2h17.5L30.7,198H13L75.9,2z"/>
		<path d="M137.5,2H155L92.4,198H74.6L137.5,2z"/>
	</g>
	<rect x="1.8" y="121.6" width="144.5" height="17.5"/>
	<rect x="23.7" y="64.7" width="140.1" height="17.5"/>
</svg>`