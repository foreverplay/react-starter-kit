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
import { connect } from 'react-redux';
import fetch from '../../core/fetch';
import Player from '../../components/Player/Player';
import CommentUnit from '../../components/CommentUnit';
import DropToDo from '../../components/DropToDo/DropToDo';
import Sing from '../../components/Sing/Sing';

import config from '../../config';
import { GetQueryString, getUserToken } from '../../commonFunc/';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './play.css';
import Loader from '../../components/Loading';
import Share from '../../components/Share';

import commentsImg from "./comments.png";
import playtimesImg from "./playtimes.png";
import sendImg from './send.png'
import sendbgcImg from './sendbgc.png'
import sendbglImg from './sendbgl.png'
import yximg from "../../../public/tile.png"


async function getVideoInfo(pk, token) {
    let t = (token) ? token : "";
    const resp = await fetch(config.serverHost + 'song/play/' + pk, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + t,
        },
    })
    const data = await resp.json();
    if (!data)
        throw new Error('Failed to load the Ad.');
    return data;
}
async function getNewDm(pk, token, page) {
    let t = (token) ? token : "";
    const resp = await fetch(config.serverHost + 'song/cmsnew?pk=' + pk + '&page=' + page, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + t,
        },
    })
    const data = await resp.json();
    if (!data)
        throw new Error('Failed to load the Ad.');
    return data;
}
async function getHotDm(pk, token) {
    let t = (token) ? token : "";
    const resp = await fetch(config.serverHost + 'song/cmshot?pk=' + pk, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + t,
        },
    })
    const data = await resp.json();
    if (!data)
        throw new Error('Failed to load the Ad.');
    return data;
}
async function getVideoUrl(pk) {
    const resp = await fetch(config.serverHost + 'makesong/obtainmp3?pk=' + pk, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    const data = await resp.json();
    if (!data)
        throw new Error('Failed to load the Ad.');
    return data;
}
let dislikeone = 0
async function dislikethis(pk, token) {
    if (dislikeone) {
        return false
    }
    dislikeone = 1
    let t = (token) ? token : "";
    const resp = await fetch(config.serverHost + 'song/cmslove', {
        method: 'POST',
        headers: {
            "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            'Authorization': 'Bearer ' + t,
        },
        body: 'pk=' + pk,
    });
    const data = await resp.json();
    if (!data)
        throw new Error('Failed to load the Ad.');
    return data;
}
async function fetchToSendDm(pk, token, content, st) {
    let t = (token) ? token : "";
    const resp = await fetch(config.serverHost + 'song/songcms?pk=' + pk, {
        method: 'post',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Authorization': 'Bearer ' + t,
        },
        body: 'pk=' + pk + '&content=' + content + '&st=' + st,
    })
    const data = await resp.json();
    if (!data)
        throw new Error('Failed to load the Ad.');
    return data;
}
async function lovePv(pk, token) {
    let t = (token) ? token : "";
    let timesss = new Date().getTime();
    const resp = await fetch(config.serverHost + 'song/loveit/' + pk + '/?t=' + timesss, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + t,
        },
    })
    const data = await resp.json();
    if (!data)
        throw new Error('Failed to load the Ad.');
    return data;
}
// ----------------------------------------
function customImgArray(cover, imgs) {
    var images = []
    images.push({
        timer: 0,
        url: config.serverHost + cover
    })
    for (var i = 0; i < imgs.length; i++) {
        images.push({
            timer: imgs[i].longtime,
            url: config.serverHost + imgs[i].picture
        })
    }
    return images
}
function timerForAudio(time, cal) {
    let timeout = setInterval(function() {
        cal()
    }, time);
    return timeout
}
//sync hotdm and newdm
// ----------------------------------------
class Play extends React.Component {
    constructor(props) {
        super(props)
        this.timeOut = "";
        this.textInput = "";
        this.state = {
            videoInfo: {
                cover_howlong: 0,
                picturemovies: [],
                myuser: {
                    "headimg": "",
                },
            },
            videoUrl: "",
            hotDms: [],
            newDms: [],
            loadFinsh: false,
            userToken: this.props.store.user,
            finshRender: false,
            transferData: "",
            inputValue: "",
            likePvStatue: 0
        }
        this.dislike = (e) => (dislikethis(this.state.hotDms[e].pk, getUserToken()).then(() => {
            for ( let item of this.state.newDms ) {
                if (this.state.hotDms[e].pk == item.pk) {
                    let tempe = this.state.newDms.indexOf(item)
                    if (this.state.newDms[tempe].ding == 1) {
                        this.state.newDms[tempe].ding = 0
                        this.state.newDms[tempe].comment_lovecount -= 1
                    } else {
                        this.state.newDms[tempe].ding = 1
                        this.state.newDms[tempe].comment_lovecount += 1
                    }
                }
            }
            if (this.state.hotDms[e].ding == 1) {
                this.state.hotDms[e].ding = 0
                this.state.hotDms[e].comment_lovecount -= 1
            } else {
                this.state.hotDms[e].ding = 1
                this.state.hotDms[e].comment_lovecount += 1
            }
            this.forceUpdate()
            dislikeone = 0
        }))
        this.dislikeNew = (e) => (dislikethis(this.state.newDms[e].pk, getUserToken()).then(() => {
            for ( let item of this.state.hotDms ) {
                if (this.state.newDms[e].pk == item.pk) {
                    let tempe = this.state.hotDms.indexOf(item)
                    if (this.state.hotDms[tempe].ding == 1) {
                        this.state.hotDms[tempe].ding = 0
                        this.state.hotDms[tempe].comment_lovecount -= 1
                    } else {
                        this.state.hotDms[tempe].ding = 1
                        this.state.hotDms[tempe].comment_lovecount += 1
                    }
                }
            }
            if (this.state.newDms[e].ding == 1) {
                this.state.newDms[e].ding = 0
                this.state.newDms[e].comment_lovecount -= 1
            } else {
                this.state.newDms[e].ding = 1
                this.state.newDms[e].comment_lovecount += 1
            }
            this.forceUpdate()
            dislikeone = 0
        }))
        this.loadNewDmByPage = function(page) {
            getNewDm(this.state.videoInfo.pk, getUserToken(), page).then((e) => {
                if (e.length < 10) {
                    this.state.loadFinsh = true
                }
                if (page != 1) {
                    this.state.newDms = this.state.newDms.concat(e)
                    this.forceUpdate()
                } else {
                    this.state.newDms = e
                }
            })
        }
        let This = this
        this.sendDm = function(argument) {
            This.setState({
                transferData: This.state.inputValue,
                inputValue: "",
            });
            This.state.transferData = "";
        }
        this.handleInputChange = function(event) {
            This.setState({
                inputValue: event.target.value,
            });
        }
        this.likePv = function(e) {
            this.state.videoInfo.lovecount = e
            lovePv(this.state.videoInfo.pk, getUserToken()).then((e) => {
                this.state.videoInfo.lovecount = e.lovecount
            })
        }
    }
    componentDidMount() {
        this.textInput.onkeyup = (event) => {
            if (event.keyCode == 13) {
                this.sendDm()
            }
        }
        let This = this
        if (GetQueryString("id") != "") {
            getVideoInfo(GetQueryString("id"), getUserToken()).then((e) => {
                This.state.videoInfo = e;
                This.forceUpdate()
                let imgs = customImgArray(e.cover_cover, e.picturemovies)
                if (e.love_status != undefined) {
                    this.setState({
                        likePvStatue: e.love_status,
                    })
                }
            }).then(() => {
                getHotDm(This.state.videoInfo.pk, getUserToken()).then((e) => {
                    this.state.hotDms = e
                })
            }).then(() => {
                this.loadNewDmByPage(1)
            })
            This.timeOut = timerForAudio(1000, () => {
                getVideoUrl(GetQueryString("id")).then((e) => {
                    if (e.cover_addr != null && e.cover_addr != "") {
                        This.state.videoUrl = e.cover_addr
                        if (e.local_xmlpath != "" && e.local_xmlpath != null && e.local_xmlpath != undefined) {
                            This.state.videoInfo.cover_xmlpath = config.serverHost + e.local_xmlpath
                        } else {
                            This.state.videoInfo.cover_xmlpath = e.cover_xmlpath
                        }
                        // This.state.videoInfo.local_xmlpath = e.local_xmlpath
                        This.state.videoInfo.cover_addr = e.cover_addr
                        This.refs.playLoading.style.display = "none"
                        clearInterval(This.timeOut)
                        This.forceUpdate()
                        return
                    }
                })
            // clearInterval(This.timeOut)
            })
        }
    }
    componentDidUpdate() {
        if (!this.state.finshRender) {
            this.setState({
                finshRender: true
            });
        }
    }
    componentWillUnmount() {
        if (this.textInput.onkeyup) {
            this.textInput.onkeyup = null;
        }
        clearInterval(this.timeOut)
    }
    render() {
        console.log("render")
        let hotdms = []
        if (this.state.hotDms.length > 0) {
            for ( let item of this.state.hotDms ) {
                hotdms.push(<CommentUnit key={item.pk} dmInfo={item} like={() => {
                    this.dislike(this.state.hotDms.indexOf(item))
                }}></CommentUnit>)
            }
        }
        let newdms = []
        if (this.state.newDms.length > 0) {
            for ( let item of this.state.newDms ) {
                newdms.push(<CommentUnit key={item.pk} dmInfo={item} like={() => {
                    this.dislikeNew(this.state.newDms.indexOf(item))
                }}></CommentUnit>)
            }
        }
        return (
            <div className={s.root}>
            <div ref="playLoading" className={s.playLoading}><Loader color='#ff6600'></Loader></div>
            <div className={s.container}>
              <Player className={s.Player} videoInfo={this.state.videoInfo} videoUrl={this.state.videoUrl} transferData={this.state.transferData} sendDmToServe={(audioTime) => {
                fetchToSendDm(this.state.videoInfo.pk, getUserToken(), this.state.transferData, audioTime)
            }}></Player>
                  <div className={s.inputGroup} style={{
                backgroundImage: "url(" + sendbgcImg + ")"
            }}>
                <div className={s.inputGroupBefore} style={{
                backgroundImage: "url(" + sendbglImg + ")"
            }}>
                </div>
                    <div className={s.dmInput} ><input type="text" ref={(input) => {
                this.textInput = input
            }} name="" value={this.state.inputValue} onChange={this.handleInputChange} placeholder="说点什么" /></div>
                    <img className={s.dmSend} onClick={this.sendDm} src={sendImg}/>
                  </div>
              <div className={s.infoPannel}>
                <div className={s.videoInfoTitle}>
                  视频信息
                </div>
                <div className={s.title}>
                  {this.state.videoInfo.cover_name}
                </div>
                <div className={s.shareGroup}>
                  <Share videoInfo={this.state.videoInfo} likeThisPv={(e) => {
                this.likePv(e)
            }} likePvStatue = {this.state.likePvStatue}>
                    
                  </Share>                  
                </div>
                  <div className={s.infoIcon}>
                    <img src={commentsImg}/>
                    <div>{this.state.videoInfo.remarker_count}</div>
                  </div>
                  <div className={s.infoIcon}>
                    <img src={playtimesImg}/>
                    <div>{this.state.videoInfo.playtimes}</div>
                  </div>
                  <div className={s.date}>
                    {this.state.videoInfo.cover_howlong}天前投递 
                  </div>
                  <div className={s.introduce}>
                    {this.state.videoInfo.cover_intro} 
                  </div>
                  <div className={s.sectiongroup}>
                    <div className={s.section}>
                      <div>演唱：</div>
                      <div className={s.headergroup}>
                        <div className={s.headicon} style={{
                backgroundImage: "url(" + yximg + ")"
            }}></div>
                        <span className={s.playmvsinger}>嫣汐</span>
                      </div>
                    </div>
                     <div className={s.section}>
                      <div>制作人&经纪人：</div>
                      <div className={s.headergroup}>
                        <div className={s.headicon} style={{
                backgroundImage: "url(" + config.serverHost + this.state.videoInfo.myuser.headimg + ")"
            }}></div>
                        <span className={s.playmvmaker}>
                        {this.state.videoInfo.myuser.realname}</span>
                      </div>
                    </div>
                  </div>
                  <div className={s.videoInfoTitle}>
                    热门弹幕
                  </div>
                  <div className={s.hotsdmgroups}>
                    {hotdms}
                  </div>
                  <div className={s.videoInfoTitle}>
                    最新弹幕
                  </div>
                  <div>
                  <DropToDo loadByPage={(e) => {
                this.loadNewDmByPage(e)
            }} loadFinsh={this.state.loadFinsh} refresh={this.state.finshRender}>
                      {newdms}
                  </DropToDo>
                  </div>
              </div>
              <div className={s.singEntry}>
                <Sing/>
              </div>
            </div>
          </div>
        );
    }
}
const mapState = (state) => ({
    store: state,
})

export default connect(mapState)(withStyles(s)(Play));