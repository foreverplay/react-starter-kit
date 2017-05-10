/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-2016 Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Ranking.css';
import Ad from '../../components/Ad/Ad';
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
class Ranking extends React.Component {
    constructor(props) {
        super(props)
        this.onChosen = (e) => {
            switch (e) {
            case 0:
                history.push("/")
                break;
            case 1:
                history.push("/recent")
                break;
            case 2:
                history.push("/ranking")
                break;
            }
        }
    }
    componentDidMount() {
        getTopSongs(1).then((e) => {
            console.log(e)
        })
    }
    render() {
        return (
            <div className={s.root}>
              <div className={s.container}>
              <Nav index={2} onChosen={(e) => {
                this.onChosen(e)
            }}/>
            <TopPv/>
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
        return (
            <div className={s.navroot}>
                <div className={s.navitem}>
                作品榜
                </div>
                <div className={s.navitem}>
                巨星榜
                </div>
            </div>
        )
    }
}
class TopPv extends React.Component {
    constructor(props) {
        super(props)
    }
    render() {
        return (
            <div>
                <div className={s.TopPvOne}></div>
                <div className={s.TopPvList}>
                    <RankingNav/>
                </div>
            </div>
        )
    }
}
export default withStyles(s)(Ranking);
