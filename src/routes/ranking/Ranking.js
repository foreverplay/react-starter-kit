/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-2016 Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Ranking.css';
import DropToDo from '../../components/DropToDo/DropToDo';
import Nav from '../../components/Nav/Nav';
import Link from '../../components/Link';
import history from '../../history';
import config from '../../config';

async function getTopSongs(nowpage) {
    const resp = await fetch(config.serverHost + 'song/songtop?page=' + nowpage + '', {
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
async function getTopUsers(nowpage) {
    const resp = await fetch(config.serverHost + 'song/usertop?page=' + nowpage + '', {
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
class Ranking extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            nowindex: 0,
        }
        this.onChosen = (e) => {
            console.log(e)
            this.setState({
                nowindex: e
            })
        }
    }
    componentDidMount() {}
    render() {
        let tempdom = [];
        if (this.state.nowindex == 0) {
            tempdom = <TopPv onChosen={(e) => {
                this.onChosen(e)
            }}/>
        } else {
            tempdom = <TopUser onChosen={(e) => {
                this.onChosen(e)
            }}/>
        }
        return (
            <div className={s.root}>
              <div className={s.container}>
              <Nav index={2}/>
            {tempdom}
              </div>
            </div>
        );
    }
}
class RankingNav extends React.Component {
    constructor(props) {
        super(props)
    }
    render() {
        let style0 = {};
        let style1 = {};
        switch (this.props.index) {
        case 0:
            style0 = {
                borderBottom: "1px solid #000"
            };
            style1 = {};
            break;
        case 1:
            style0 = {};
            style1 = {
                borderBottom: "1px solid #000"
            };
            break;
        }
        return (
            <div className={s.navroot}>
                <div className={s.navitem} style={style0} onClick={() => {
                this.props.onChosen(0)
            }}>
                作品榜
                </div>
                <div className={s.navitem} style={style1} onClick={() => {
                this.props.onChosen(1)
            }}>
                巨星榜
                </div>
            </div>
        )
    }
}
class TopPv extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            loadFinsh: false,
            finshRender: false,
            TopPvsData: [],
        }
        this.loadTopPvByPage = (e) => {
            getTopSongs(e).then((data) => {
                if (data.length == 10) {
                    this.setState({
                        TopPvsData: this.state.TopPvsData.concat(data),
                    })
                } else {
                    this.setState({
                        loadFinsh: true,
                        TopPvsData: this.state.TopPvsData.concat(data),
                    })
                }
            })
        }
    }
    componentDidMount() {
        this.loadTopPvByPage(1)
    }
    componentDidUpdate() {
        if (!this.state.finshRender) {
            this.setState({
                finshRender: true
            });
        }
    }
    render() {
        let tempdom = [];
        if (this.state.TopPvsData.length != 0) {
            for ( let item of this.state.TopPvsData ) {
                tempdom.push(<div key={item.pk}>
                    <Link to="/play?id={item.pk}"><div className={s.TopPvImg} style={{
                    backgroundImage: "url(" + config.serverHost + item.songcover.cover_cover + ")"
                }}></div></Link>
                    <div className={s.TopPvInfo}>
                        <div>{item.songcover.cover_name}</div>
                        <div>{item.songcover.cover_name}</div>
                        <div>{item.songcover.remarker_count}</div>
                        <div>{item.songcover.playtimes}</div>
                        <div>{item.songcover.cover_maker}</div>
                        <div>{item.songcover.myuser.headimg}</div>
                        <div>{item.songcover.myuser.realname}</div>
                        <div>{item.songcover.myuser.pk}</div>
                    </div>
                    </div>)
            }
        }
        return (
            <div>
                <div className={s.TopPvOne}></div>
                <div className={s.TopPvList}>
                    <RankingNav index={0} onChosen={(e) => {
                this.props.onChosen(e)
            }}/>
                    <DropToDo loadByPage={(e) => {
                this.loadTopPvByPage(e)
            }} loadFinsh={this.state.loadFinsh} refresh={this.state.finshRender}>
                        <div className={s.TopPvList} key="TopPvList">
                            {tempdom}
                        </div>
                    </DropToDo>
                </div>
            </div>
        )
    }
}
class TopUser extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            loadFinsh: false,
            finshRender: false,
            TopPvsData: [],
        }
        this.loadTopUserByPage = (e) => {
            getTopUsers(e).then((data) => {
                if (data.length == 10) {
                    this.setState({
                        TopPvsData: this.state.TopPvsData.concat(data),
                    })
                } else {
                    this.setState({
                        loadFinsh: true,
                        TopPvsData: this.state.TopPvsData.concat(data),
                    })
                }
            })
        }
    }
    componentDidMount() {
        this.loadTopUserByPage(1)
    }
    componentDidUpdate() {
        if (!this.state.finshRender) {
            this.setState({
                finshRender: true
            });
        }
    }
    render() {
        let tempdom = [];
        if (this.state.TopPvsData.length != 0) {
            for ( let item of this.state.TopPvsData ) {
                tempdom.push(<div key={item.pk}>
                    <Link to="/play?id={item.pk}"><div className={s.TopPvImg} style={{
                    backgroundImage: "url(" + config.serverHost + item.user.headimg + ")"
                }}></div></Link>
                    <div className={s.TopPvInfo}>
                        <div>{item.user.realname}</div>
                        <div>{item.score}</div>
                    </div>
                    </div>)
            }
        }
        return (
            <div className={s.TopUser}>
                <div className={s.TopUserOne}></div>
             <RankingNav index={1} onChosen={(e) => {
                this.props.onChosen(e)
            }}/>
             <DropToDo loadByPage={(e) => {
                this.loadTopUserByPage(e)
            }} loadFinsh={this.state.loadFinsh} refresh={this.state.finshRender}>
                        <div className={s.TopPvList} key="TopPvList">
                            {tempdom}
                        </div>
                        </DropToDo>
            </div>
        );
    }
}
export default withStyles(s)(Ranking);
