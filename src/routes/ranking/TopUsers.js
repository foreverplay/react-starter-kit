import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from "./TopUsers.css";
import RankingNav from "./RankingNav";
import DropToDo from '../../components/DropToDo/DropToDo';
import Link from '../../components/Link';
import history from '../../history';
import config from '../../config';

async function getTopUsers(nowpage) {
    const resp = await fetch(config.serverHost + 'song/usertop?page=' + nowpage + '', {
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
class TopUsers extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            loadFinsh: false,
            finshRender: false,
            TopPvsData: [],
        }
        this.loadTopUserByPage = (e) => {
            getTopUsers(e).then((data) => {
                if (data.length == 10) {
                    this.setState({
                        TopPvsData: this.state.TopPvsData.concat(data),
                    })
                } else {
                    this.setState({
                        loadFinsh: true,
                        TopPvsData: this.state.TopPvsData.concat(data),
                    })
                }
            })
        }
    }
    componentDidMount() {
        this.loadTopUserByPage(1)
    }
    componentDidUpdate() {
        if (!this.state.finshRender) {
            this.setState({
                finshRender: true
            });
        }
    }
    render() {
        let tempdom = [];
        let TopUserDom = [];
        if (this.state.TopPvsData.length != 0) {
            TopUserDom.push(<div key="TopUserOne" className={s.TopUserOne}>
                <div className={s.TopPvImg} style={{
                backgroundImage: "url(" + config.serverHost + this.state.TopPvsData[0].user.headimg + ")"
            }}></div>
                <div>{this.state.TopPvsData[0].user.realname}</div>
                </div>)
            for ( let item of this.state.TopPvsData ) {
                tempdom.push(<div key={item.pk}>
                    <Link to="/play?id={item.pk}"><div className={s.TopPvImg} style={{
                    backgroundImage: "url(" + config.serverHost + item.user.headimg + ")"
                }}></div></Link>
                    <div className={s.TopPvInfo}>
                        <div>{item.user.realname}</div>
                        <div>{item.score}</div>
                    </div>
                    </div>)
            }
        }
        return (
            <div className={s.TopUser}>
            <div className={s.TopUserDomContainer}>
                {TopUserDom}
            </div>
             <RankingNav index={1} onChosen={(e) => {
                this.props.onChosen(e)
            }}/>
             <DropToDo loadByPage={(e) => {
                this.loadTopUserByPage(e)
            }} loadFinsh={this.state.loadFinsh} refresh={this.state.finshRender}>
                        <div className={s.TopPvList} key="TopPvList">
                            {tempdom}
                        </div>
                        </DropToDo>
            </div>
        );
    }
}
export default withStyles(s)(TopUsers);