/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-2016 Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Header.css';
import Link from '../Link';
import Navigation from '../Navigation';
import { connect } from 'react-redux';
import logoUrl from './logo.png';
import userUrl from './yanxi.png';

class Header extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.imgUrl = userUrl;
    this.path = "/login";
  }
  componentDidMount() {
  }

  componentWillUnmount() {
  }
  render() {
    // const loginInfo = this.props.store.user.Login
    // if (loginInfo) {
    //   this.imgUrl = loginInfo
    //   this.path = "/user"
    // }
    return (
    <div className={s.root}>
      <div className={s.container}>
        <Link className={s.brand} to="/">
          <img src={logoUrl} height="27" alt="嫣汐LOGO"/>
        </Link>
        <Link className={s.brand} to={this.path}>
          <div className={s.userHeader} style={{backgroundImage:"url("+this.imgUrl+")"}}></div>
        </Link>
      </div>
    </div>
    );
  }
}
const mapState = (state) => ({
  store:state,
})

export default connect(mapState, "")(withStyles(s)(Header));
