import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from "./TopUsers.css";
import RankingNav from "./RankingNav";
import DropToDo from '../../components/DropToDo/DropToDo';
import Link from '../../components/Link';
import history from '../../history';
import config from '../../config';
import topuserbgImg from "./topuserbg.png";
import oneImg from "./one.png";
import bgtopImg from "../../../public/bgtop.png";
import usertopbg2Img from "./usertopbg2.png";
import userhotsImg from "./userhots.png";
import mvtop1Img from "./mvtop1.png";
import mvtop2Img from "./mvtop2.png";
import mvtop3Img from "./mvtop3.png";


let mvtopArray = ["", {
    url: mvtop1Img,
    color: "#FCD23E"
}, {
    url: mvtop2Img,
    color: "#BFC8D1"
}, {
    url: mvtop3Img,
    color: "#915658"
}];
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
            TopUserDom.push(
                <div key="TopUserOne" className={s.TopUserOne} style={{
                    backgroundImage: "url(" + topuserbgImg + ")"
                }}>
                    <div className={s.bgimg}  style={{
                    backgroundImage: "url(" + usertopbg2Img + ")"
                }}>
                    </div>
                    <div className={s.TopUserImg}  style={{
                    backgroundImage: "url(" + config.serverHost + this.state.TopPvsData[0].user.headimg + ")"
                }}>
                        <div className={s.TopUserImgbefore} style={{
                    backgroundImage: "url(" + oneImg + ")"
                }}>
                        </div>
                    </div>
                    <div className={s.topusername}>{this.state.TopPvsData[0].user.realname}占领了这里</div>
                </div>
            )
            let tempno = 1;
            for ( let item of this.state.TopPvsData ) {
                var tempRanking = [];
                var tempUserImg = [];
                if (tempno <= 3) {
                    tempRanking.push(<div className={s.Ranking} key={"ranking" + tempno} style={{
                        color: mvtopArray[tempno].color
                    }}><img src={mvtopArray[tempno].url}/>{tempno}</div>)
                    tempUserImg.push(<div className={s.userImg} key={"userImg" + tempno} style={{
                        backgroundImage: "url(" + config.serverHost + item.user.headimg + ")",
                        border: "2px solid " + mvtopArray[tempno].color + "",
                    }}>
                        <div className={s.userImgbefore} style={{
                        backgroundImage: "url(" + mvtopArray[tempno].url + ")"
                    }}></div>
                        </div>)
                } else {
                    tempRanking.push(<div className={s.Ranking} key={"ranking" + tempno}>TOP.{tempno}</div>)
                    tempUserImg.push(<div className={s.userImg} key={"userImg" + tempno} style={{
                        backgroundImage: "url(" + config.serverHost + item.user.headimg + ")"
                    }}>
                        </div>)
                }
                tempdom.push(<div key={item.pk} className={s.group}>
                    <Link to="/play?id={item.pk}">
                        {tempUserImg}
                    </Link>
                    <div className={s.userInfoGroup}>
                        <div className={s.name}>{item.user.realname}</div>
                        <div className={s.userScore}><img src={userhotsImg}/>{item.score}</div>
                    </div>
                        {tempRanking}
                    </div>)
                tempno++;
            }
        }
        return (
            <div className={s.TopUser}>
                <div className={s.TopUserDomContainer}>
                    {TopUserDom}
                </div>
                <div className={s.TopUserList} style={{
                backgroundImage: "url(" + bgtopImg + ")"
            }}>
                     <RankingNav index={1} onChosen={(e) => {
                this.props.onChosen(e)
            }}/>
                    <div className={s.rule}>人气值与播放量+弹幕人数+喜欢数等相关</div>
                     <DropToDo loadByPage={(e) => {
                this.loadTopUserByPage(e)
            }} loadFinsh={this.state.loadFinsh} refresh={this.state.finshRender}>
                        <div className={s.TopPvList} key="TopPvList">
                            {tempdom}
                        </div>
                    </DropToDo>
                </div>
            </div>
        );
    }
}
export default withStyles(s)(TopUsers);