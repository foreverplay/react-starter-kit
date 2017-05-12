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
import Nav from '../../components/Nav/Nav';
import TopPvs from "./TopPvs";
import TopUsers from "./TopUsers";

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
            tempdom = <TopPvs onChosen={(e) => {
                this.onChosen(e)
            }}/>
        } else {
            tempdom = <TopUsers onChosen={(e) => {
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
export default withStyles(s)(Ranking);
