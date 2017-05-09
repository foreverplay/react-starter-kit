/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-2016 Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './List.css';
import fetch from '../../core/fetch';
import config from '../../config';
import DropToDo from '../../components/DropToDo/DropToDo';
import Link from '../../components/Link/Link';
import { setTemplateID } from '../../actions/runtime';
import { getUserToken } from '../../commonFunc/';
import history from '../../history';


async function getPvList(page, token) {
    let t = (token) ? token : "";
    const resp = await fetch(config.serverHost + 'makesong/mvselect?cur_page=' + page, {
        method: 'get',
        headers: {
            'Authorization': 'Bearer ' + t,
        },
    })
    const data = await resp.json();
    if (!data)
        throw new Error('Failed to load the List.');
    if (data.detail != undefined) {
        history.push("/login")
        return
    }
    return data;
}

class List extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            loadFinsh: false,
            refresh: true,
        }
        this.ListDom = [];
        this.showpage = 1;
        this.loadListByPage = (page) => {
            getPvList(page, getUserToken()).then((e) => {
                if (e.length < 10) {
                    this.state.loadFinsh = true
                }
                if (page != 1) {
                    this.ListDom = this.ListDom.concat(e)
                } else {
                    this.ListDom = e
                }
                this.forceUpdate()
            })
        }
        this.saveTemplateId = (e) => {
            this.props.dispatch(setTemplateID(e))
        }
    }
    componentDidMount() {
        this.loadListByPage(this.showpage)

    }
    render() {
        console.log(this.ListDom)
        let tempdoms = []
        for ( let item of this.ListDom ) {
            tempdoms.push(<div key={item.pk}><img className={s.img} src={config.serverHost + item.mv_cover}/> {item.mv_name}<Link to={"/lyrics?id=" + item.pk} onClick={() => {
                this.saveTemplateId(item.pk)
            }}><button>选用</button></Link></div>)
        }
        return (
            <div className={s.root}>
                   <DropToDo loadByPage={(e) => {
                this.loadListByPage(e)
            }} loadFinsh={this.state.loadFinsh} refresh={this.state.refresh}>
                {tempdoms}
              </DropToDo>
            </div>
        );
    }
}
const mapState = (state) => ({
    store: state,
})
export default connect(mapState)(withStyles(s)(List));