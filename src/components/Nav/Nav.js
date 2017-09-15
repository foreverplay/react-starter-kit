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
import s from './Nav.css';
import hotImg from './hot.png';
import jingxuanImg from './jingxuan.png';
import newImg from './new.png';
import homeImg from './home.png';
import rankingImg from './ranking.png';
import discoverImg from './discover.png';
import mineImg from './mine.png';

import history from '../../history';
// import { connect } from 'react-redux';
// import logoUrl from './logo.png';
class Nav extends React.Component {
    static propTypes = {
        index: PropTypes.number.isRequired,
    }
    constructor(props) {
        super(props);
        this.onChosen = (e) => {
            switch (e) {
            case 0:
                history.push("/")
                break;
            case 1:
                // history.push("/recent")
                history.push("/ranking")
                break;
            case 2:
                // history.push("/ranking")
                break;
            case 3:
                // history.push("/ranking")
                break;
            case 4:
                // history.push("/ranking")
                break;
            }
        }
    }
    componentDidMount() {}
    componentWillUnmount() {}
    render() {
        let style0 = {
            color: "#fff"
        }
        let style1 = {
            color: "#fff"
        }
        let style2 = {
            color: "#fff"
        }
        switch (this.props.index) {
        case 0:
            style0 = {
                color: "#ff6600"
            }
            break;
        case 1:
            style1 = {
                color: "#ff6600"
            }
            break;
        case 2:
            style2 = {
                color: "#ff6600"
            }
            break;
        }
        return (
            <div className={s.root}>
            <div className={s.NavPlaceholder}></div>
              <div className={s.homeNav} key="hotManu">
              <div className={s.homeNavItem}  onClick={() => {
                this.onChosen(0)
            }}  style={style0}><img src={homeImg}/>首页</div>
              <div className={s.homeNavItem} onClick={() => {
                this.onChosen(1)
            }} style={style1}><img src={rankingImg}/>榜单</div>
              <div className={s.homeNavCenter} onClick={() => {
                this.onChosen(2)
            }}  style={style2}>
                <div className={s.btn}>
                    <span></span>
                    <span></span>
                </div>
            </div>
            <div className={s.homeNavItem} onClick={() => {
                this.onChosen(3)
            }}  style={style2}><img src={discoverImg}/>发现</div>
            <div className={s.homeNavItem} onClick={() => {
                this.onChosen(4)
            }}  style={style2}><img src={mineImg}/>我的</div>
              </div>
            </div>
        );
    }
}
// const mapState = (state) => ({
//     store: state,
// })

// export default connect(mapState, "")(withStyles(s)(Nav));
export default withStyles(s)(Nav);
