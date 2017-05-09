import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './list.sass';
import Link from '../Link';
import fetch from '../../core/fetch';
import config from '../../config';

async function getfeature(nowpage) {
    const resp = await fetch(config.serverHost + 'song/newsong?page=' + nowpage + '', {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
    })
    const data = await resp.json();
    if (!data)
        throw new Error('Failed to load the Ad.');
    return data;
}
class List extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            doms: []
        }
        this.lefttime = 1;
    }
    componentDidMount() {
        let This = this
        getfeature(This.props.showpage).then(function(v) {
            if (v.length < 20) {
                This.lefttime = 0
                This.forceUpdate()
                return
            }
            // if(v.length===0){
            // 	This.lefttime = 0
            // 	This.forceUpdate()
            // 	return
            // }
            This.setState({
                doms: This.state.doms.concat(v)
            });
        })
    }
    componentDidUpdate() {
        this.props.updatefinsh(this.lefttime)
    // this.lefttime--;
    }
    shouldComponentUpdate(nextProps, nextState) {
        return true;
    }
    componentWillReceiveProps(nextProps) {
        if (this.state.doms != "" && nextProps.showpage === this.props.showpage) {
            return
        }
        let This = this
        getfeature(nextProps.showpage).then(function(v) {
            if (v.length === 0) {
                This.lefttime = 0
                This.forceUpdate()
                return
            }
            This.setState({
                doms: This.state.doms.concat(v)
            });
        })
    }
    render() {
        let doms = [];
        for ( let value of this.state.doms ) {
            let random = parseInt(Math.random() * 1000000)
            doms.push(<div key={"newSong" + value.pk}>
				<Link to={"/play?id=" + value.pk}>
			      <img height="50" src={config.serverHost + value.cover_cover}/>
			    </Link>
				<br/>{value.cover_name}</div>)
        }
        return (
            <div>
				{doms}
			</div>
        );
    }
}
export default List;