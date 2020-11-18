import { h, Component, createRef } from 'preact';
import {useEffect, useState} from "preact/hooks";
import style from './style.css';

export default class Anim extends Component {

// Note: `user` comes from the URL, courtesy of our router
// const Anim = ({ user='def' }) => {
// 	const [time, setTime] = useState(Date.now());
// 	const [count, setCount] = useState(10);
// 	// const [rotation] = useState(0)

	

	// useEffect(() => {
	// 	let timer = setInterval(() => setTime(Date.now()), 1000);
	// 	return () => clearInterval(timer);
	// }, []);

	canvasRef = createRef();

	constructor(props) {
		super()
		this.props = props
		this.student = ''
		this.state = {rotation:0, time:Date.now(), mounted:false}
	}

	componentDidMount() {
		console.log('componentDidMount')

		// update time every second
	    this.timer = setInterval(() => {
	      this.setState({ time: Date.now() });
	    }, 1000);

	    this.state.mounted = true
        this.updateCanvas();
    }


    componentWillUnmount(){
    	console.log('componentWillUnmount')
    	this.state.mounted = false
    	// cancelAnimationFrame(this.updateCanvas.bind(this))
    	clearInterval( this.timer )
    }

    updateCanvas(){
    	// console.log('updateCanvas')
    	if( !this.state.mounted ) return

    	requestAnimationFrame(this.updateCanvas.bind(this))

    	const width = 600
		const height = 300
		
    	this.state.rotation += Math.PI/180

		const context = this.canvasRef.current.getContext("2d");
	    context.clearRect(0, 0, width, height);
	    context.save();
	    context.translate(100, 100);
	    context.rotate(this.state.rotation, 100, 100);
	    context.fillStyle = "#F00";
	    context.fillRect(-50, -50, 100, 100);
	    context.restore();

	    context.font = "20px Georgia";
		context.fillText("Hello student "+ this.student, 10, 50);
    }

    render(props){
    	this.student = props?.student || 'none'
    	console.log('this.student', this.student)
		return (
			<div class={style.wrapper}>
				<h1>Animation: {this.student}</h1>

				<div>Current time: {new Date(this.state.time).toLocaleString()}</div>
				<div>Current rotation: {this.state.rotation}</div>

				<canvas ref={this.canvasRef} width="600" height="300"></canvas>
			</div>
		);
	}
}


