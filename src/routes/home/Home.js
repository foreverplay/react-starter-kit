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
import s from './Home.css';
import Ad from '../../components/Ad/Ad';
import PvList from '../../components/PvList/Pvlist';
import Nav from '../../components/Nav/Nav';

import bgimg from '../../../public/bgimg.jpg';
import searchImg from '../../../public/search.png';

class Home extends React.Component {
    constructor(props) {
        super()
        this.showList = 1;
    }
    componentDidMount() {}
    render() {
        return (
            <div className={s.root}>
            <div className={s.bg} style={{backgroundImage:'url('+bgimg+')'}}></div>
              <div className={s.container}>
                <div className={s.search}>
                  <span className={s.title}>首页</span>
                  <img src={searchImg}/>
                </div>
               <Nav index={0} />
              <Ad></Ad>
              <PvList key="newList" type="hot"></PvList>
              </div>
            </div>
        );
    }
}
export default withStyles(s)(Home);
