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
import s from './FooterNav.css';

import history from '../../history';

import footerlImg from "./footerl.png"
import footercImg from "./footerc.png"
import footerrImg from "./footerr.png"
import footerbgImg from "./footerbg.png"
// import { connect } from 'react-redux';
// import logoUrl from './logo.png';
class FooterNav extends React.Component {
    // static propTypes = {
    //     index: PropTypes.number.isRequired,
    // }
    constructor(props) {
        super(props);
        this.handleLeft = () => {
            this.props.handleLeft()
        }
        this.handleRight = () => {
            this.props.handleRight()
        }
    }
    componentDidMount() {}
    componentWillUnmount() {}
    render() {
        let tempL = "上一步"
        let tempR = "下一步"
        if (typeof this.props.textL != "undefined") {
            tempL = this.props.textL
        }
        if (typeof this.props.textR != "undefined") {
            tempR = this.props.textR
        }
        return (
            <div className={s.root}>
            <div className={s.block}></div>
                <div className={s.footer} style={{
                backgroundImage: "url(" + footerbgImg + ")"
            }}>
                    <div className={s.footerbefore} style={{
                backgroundImage: "url(" + footerlImg + ")"
            }}></div>
                    <div className={s.back} onClick={this.handleLeft}>
                        <div className={s.backbefore} style={{
                backgroundImage: "url(" + footercImg + ")"
            }}></div>
                       {tempL}
                    </div>
                   <div className={s.foreward} onClick={this.handleRight}>
                        {tempR}
                    </div>
                     <div className={s.footerafter} style={{
                backgroundImage: "url(" + footerrImg + ")"
            }}></div>
                </div>
            </div>
        );
    }
}
// const mapState = (state) => ({
//     store: state,
// })

// export default connect(mapState, "")(withStyles(s)(FooterNav));
export default withStyles(s)(FooterNav);
