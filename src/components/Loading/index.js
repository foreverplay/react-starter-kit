import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Loading.css';

class Loading extends React.Component {
	constructor(props){
		super(props)
	}
	render() {
		return (
			<div className={s.loadingText} style={{color:this.props.color}}>
			  <span>L</span>
			  <span>O</span>
			  <span>A</span>
			  <span>D</span>
			  <span>I</span>
			  <span>N</span>
			  <span>G</span>
			</div>
		);
	}
}
export default withStyles(s)(Loading);