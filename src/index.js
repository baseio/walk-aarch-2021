import {isMobile, importModule} from './lib/utils.js'

// const script = isMobile() ? './index.mobile.js' : './index.main.js'
const script = isMobile() ? './index.mobile.js' : './bundle.js'

importModule(script)
	.then( module => console.log('module', module) )
	.catch(e => console.error('error', e) )
