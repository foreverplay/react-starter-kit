import React from 'react';
import Link from '../Link';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Sing.css';
import makeitImg from './makeit.png';


class Sing extends React.Component {
    render() {
        return <div className={s.root}>
        	<Link to="/list">
        		<img src={makeitImg}/>
	        </Link>
        </div>
    }
}
export default withStyles(s)(Sing);