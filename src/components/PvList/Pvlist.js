import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import DropToDo from '../../components/DropToDo/DropToDo';
import List from '../../components/list/list';
import s from './PvList.css';
import fetch from '../../core/fetch';
// import { config.serverHost } from '../../config';
import config from '../../config';
async function getNewfeature(nowpage) {
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
async function getHtofeature(nowpage) {
    const resp = await fetch(config.serverHost + 'song/featured', {
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

class PvList extends React.Component {
    constructor(props) {
        super(props)
        this.unmoutStatus = false
        this.state = {
            loadFinsh: false,
            showPage: 1,
            pvArray: [],
            finshRender: false,
        }
        this.firstLoad = true

        if (this.props.type == "hot") {
            this.loadPvByPage = function(page) {
                let This = this
                getHtofeature(page).then(function(v) {
                    if (This.unmoutStatus) {
                        return
                    }
                    This.setState({
                        pvArray: This.state.pvArray.concat(v)
                    });
                    if (v.length < 20) {
                        This.setState({
                            loadFinsh: true
                        });
                        This.forceUpdate()
                    }
                })
            }
        } else {
            this.loadPvByPage = function(page) {
                let This = this
                getNewfeature(page).then(function(v) {
                    if (This.unmoutStatus) {
                        return
                    }
                    This.setState({
                        pvArray: This.state.pvArray.concat(v)
                    });
                    if (v.length < 20) {
                        This.setState({
                            loadFinsh: true
                        });
                        This.forceUpdate()
                    }
                })
            }
        }
        this.loadPvByPage(1)
    }
    componentDidUnMount() {
        console.log("unmoutn")
        this.unmoutStatus = true
    }
    componentDidUpdate() {
        if (!this.state.finshRender) {
            this.setState({
                finshRender: true
            });
        }
    }
    render() {
        return (
            <div>
           <DropToDo loadByPage={(e) => {
                this.loadPvByPage(e)
            }} loadFinsh={this.state.loadFinsh} refresh={this.state.finshRender}>
                <List store={this.state.pvArray} type={this.props.type} finshRender={() => {

            }}></List>
            </DropToDo>
            </div>
        )
    }
}

export default withStyles(s)(PvList);
