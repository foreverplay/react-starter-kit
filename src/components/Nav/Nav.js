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
import s from './Nav.css';
import hotImg from './hot.png';
import jingxuanImg from './jingxuan.png';
import newImg from './new.png';
// import { connect } from 'react-redux';
// import logoUrl from './logo.png';
class Nav extends React.Component {
    static propTypes = {
        index: PropTypes.number.isRequired,
        onChosen: PropTypes.func.isRequired,
    }
    constructor(props) {
        super(props);
    }
    componentDidMount() {}
    componentWillUnmount() {}
    render() {
        let style0 = {
            backgroundColor: "#fff"
        }
        let style1 = {
            backgroundColor: "#fff"
        }
        let style2 = {
            backgroundColor: "#fff"
        }
        switch (this.props.index) {
        case 0:
            style0 = {
                backgroundColor: "#f5f5f5"
            }
            break;
        case 1:
            style1 = {
                backgroundColor: "#f5f5f5"
            }
            break;
        case 2:
            style2 = {
                backgroundColor: "#f5f5f5"
            }
            break;
        }
        return (
            <div className={s.root}>
            <div className={s.NavPlaceholder}></div>
              <div className={s.homeNav} key="hotManu">
              <div className={s.homeNavItem}  onClick={() => {
                this.props.onChosen(0)
            }}  style={style0}><img src={jingxuanImg}/> 精    选</div>
              <div className={s.homeNavItem} onClick={() => {
                this.props.onChosen(1)
            }} style={style1}><img src={newImg}/> 最    新</div>
              <div className={s.homeNavItem} onClick={() => {
                this.props.onChosen(2)
            }}  style={style2}><img src={hotImg}/> 热门榜</div>
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
