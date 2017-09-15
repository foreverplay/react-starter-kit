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

function plusReady() {
    plus.key.addEventListener("backbutton", function() {
        history.go(-1)
    })
}
class Ad extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            url: null,
        }
    }
    componentDidMount() {
        let gd = localStorage.getItem("_globledata_adurl")
        this.setState({
            url: gd,
        })
        console.log(gd)

        if (window.plus) {
            plusReady();
        } else {
            document.addEventListener("plusready", plusReady, false);
        }
    }
    render() {
        const style = {
            width: "100%",
            height: "100%",
            position: "absolute",
            overflow: "auto",
            border: "none",
        }
        return (
            <div>
        <iframe src={this.state.url} style={style}  />
      </div>
        );
    }
}

export default Ad;


