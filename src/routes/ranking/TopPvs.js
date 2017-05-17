import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from "./TopPvs.css";
import RankingNav from "./RankingNav";
import DropToDo from '../../components/DropToDo/DropToDo';
import Link from '../../components/Link';
import history from '../../history';
import config from '../../config';
import bgtopImg from "../../../public/bgtop.png";
import commentsImg from "../../../public/comments.png";
import playtimesImg from "../../../public/playtimes.png";
import toponeborderImg from "./toponeborder.png";
import top1Img from "./top1.png";
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
async function getTopSongs(nowpage) {
    const resp = await fetch(config.serverHost + 'song/songtop?page=' + nowpage + '', {
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
class TopPvs extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            loadFinsh: false,
            finshRender: false,
            TopPvsData: [],
        }
        this.loadTopPvByPage = (e) => {
            getTopSongs(e).then((data) => {
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
        this.loadTopPvByPage(1)
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
        let TopPvDom = [];
        if (this.state.TopPvsData.length != 0) {
            TopPvDom.push(<div key="TopPvOne" className={s.TopPvOne} style={{
                backgroundImage: "url(" + config.serverHost + this.state.TopPvsData[0].songcover.cover_cover + ")"
            }}>
            <div className={s.imgborder}>
                <div className={s.TopOnePvImg} style={{
                backgroundImage: "url(" + config.serverHost + this.state.TopPvsData[0].songcover.cover_cover + ")"
            }}>
            </div>
            <Link to={"/play?id=" + this.state.TopPvsData[0].pk}><img src={toponeborderImg}/></Link>
            </div>
            <img src={top1Img} className={s.toponeIcon}/>
            <div className={s.usernameGroup}>
                <div className={s.headImg} style={{
                backgroundImage: "url(" + config.serverHost + this.state.TopPvsData[0].songcover.myuser.headimg + ")"
            }}></div>
                <div className={s.username}>{this.state.TopPvsData[0].songcover.myuser.realname}</div>
            </div>
            <div className={s.mvname}>{this.state.TopPvsData[0].songcover.cover_name}</div>
                </div>)
            let tempno = 1;
            let tempNavdom = []
            for ( let item of this.state.TopPvsData ) {
                if (tempno <= 3) {
                    tempNavdom = <div className={s.topchart}><img src={mvtopArray[tempno].url}/>{tempno}</div>
                } else {
                    tempNavdom = <div className={s.topchart}><span>TOP </span>{tempno}</div>
                }
                tempdom.push(<div key={item.pk} className={s.group}>
                    <Link to={"/play?id=" + item.pk}>
                        <div className={s.left}>
                            {tempNavdom}
                            <div className={s.mvimg} style={{
                    backgroundImage: "url(" + config.serverHost + item.songcover.cover_cover + ")"
                }}></div>
                        </div>
                    </Link>
                    <div className={s.right}>
                        <div className={s.title}>{item.songcover.cover_name}</div>
                        <div className={s.viewscomment}>
                            <div className={s.comment}>
                                <img src={commentsImg}/>
                                {item.songcover.remarker_count}
                            </div>
                            <div className={s.playtimes}>
                                <img src={playtimesImg}/>
                                {item.songcover.playtimes}
                            </div>
                        </div>
                        <div className={s.user}>
                            <div className={s.userimg} style={{
                    backgroundImage: "url(" + config.serverHost + item.songcover.myuser.headimg + ")"
                }}></div>
                            <div className={s.name}>{item.songcover.myuser.realname}</div>
                        </div>
                    </div>
                    </div>)
                tempno++;
            // <div className={s.TopPvInfo}>
            //     <div></div>
            //     <div>{item.songcover.cover_maker}</div>
            //     <div>{}</div>
            //     <div></div>
            //     <div>{item.songcover.myuser.pk}</div>
            // </div>
            }
        }
        return (
            <div className={s.root}>
                <div className={s.TopPvDomContainer}>
                {TopPvDom}
                </div>
                <div className={s.TopPvList} style={{
                backgroundImage: "url(" + bgtopImg + ")"
            }}>
                    <RankingNav index={0} onChosen={(e) => {
                this.props.onChosen(e)
            }}/>
                    <DropToDo loadByPage={(e) => {
                this.loadTopPvByPage(e)
            }} loadFinsh={this.state.loadFinsh} refresh={this.state.finshRender}>
                        <div className={s.TopPvList} key="TopPvList">
                            {tempdom}
                        </div>
                    </DropToDo>
                </div>
            </div>
        )
    }
}
export default withStyles(s)(TopPvs);