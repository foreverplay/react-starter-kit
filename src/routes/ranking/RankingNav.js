import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Ranking.css';
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
export default withStyles(s)(RankingNav);