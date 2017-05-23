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

    }
    componentDidMount() {}
    componentWillUnmount() {}
    render() {
        console.log(12)
        return (
            <div className={s.root}>
                <div className={s.footer} style={{
                backgroundImage: "url(" + footerbgImg + ")"
            }}>
                    <div className={s.footerbefore} style={{
                backgroundImage: "url(" + footerlImg + ")"
            }}></div>
                    <div className={s.back} onClick={this.handleGoPrevious}>
                        <div className={s.backbefore} style={{
                backgroundImage: "url(" + footercImg + ")"
            }}></div>
                        上一步
                    </div>
                   <div className={s.foreward} onClick={this.handleGoNext}>
                        下一步
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
