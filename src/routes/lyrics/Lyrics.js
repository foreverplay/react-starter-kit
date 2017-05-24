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
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Lyrics.css';
import fetch from '../../core/fetch';
import config from '../../config';
import DropToDo from '../../components/DropToDo/DropToDo';
import FooterNav from '../../components/FooterNav/FooterNav';
import Link from '../../components/Link/Link';
import { GetQueryString, getUserToken } from '../../commonFunc/';
import Loader from '../../components/Loading';
import history from '../../history';
import playImg from "./play.png";
import playingImg from "./playing.png";
import resetImg from "./reset-lyric.png";


async function getInitLyrics(id, token) {
    let t = (token) ? token : "";
    const resp = await fetch(config.serverHost + 'makesong/inputlyric/' + id, {
        method: 'get',
        headers: {
            'Authorization': 'Bearer ' + t,
        },
    })
    const data = await resp.json();
    if (!data)
        throw new Error('Failed to load the Ad.');
    return data;
}
async function getListen(pk, block, lyrics) {
    const resp = await fetch(config.serverHost + 'makesong/prelisten', {
        method: 'post',
        headers: {
            "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
        body: 'pk=' + pk + '&lyric_list=' + lyrics + '&specified_section=' + block,
    })
    const data = await resp.json();
    if (!data)
        throw new Error('Failed to load the listen.');
    return data;
}


class Lyrics extends React.Component {
    constructor(props) {
        super(props)
        this.initDom = []
        this.listenState = {
            block: undefined,
            playing: false,
            tempdom: []
        }
        this.state = {
            dom: [],
            displayLoader: "none",
            trylistenIndex: 0,
        }
        this.token = "";
        this.handleInputChange = (e) => {
            let order = e.target.getAttribute("order")
            let t = this.state.dom
            t[order].data = e.target.value
            this.setState({
                dom: t,
            })
            try {
                localStorage.setItem("histroyDom", JSON.stringify(t))
                localStorage.setItem("histroySamplePk", GetQueryString("id"))
            } catch ( e ) {}
        }
        this.handleListen = (nowblock) => {
            console.log(nowblock)

            // this.forceUpdate()
            if (this.listenState.block != undefined && this.listenState.block == nowblock) {
                if (this.listenState.playing) { // playing
                    this.refs.audio.pause()
                    this.setState({
                        trylistenIndex: 0
                    })
                    this.listenState.playing = false
                    if (this.listenState.tempdom.length != 0) {
                        // chack temp lyrics
                        if (!this.lyricsIsDiff(this.listenState.tempdom, this.state.dom, nowblock)) { //same
                            return
                        }
                    }
                } else {
                    if (this.listenState.tempdom.length != 0) {
                        // chack temp lyrics
                        if (!this.lyricsIsDiff(this.listenState.tempdom, this.state.dom, nowblock)) { //same
                            this.refs.audio.play()
                            this.setState({
                                trylistenIndex: nowblock
                            })
                            this.listenState.playing = true
                            return
                        }
                    }
                }
            }
            try {
                this.refs.audio.load()
            } catch ( e ) {
                console.log(e)
            }
            this.setState({
                displayLoader: "flex",
            })
            let tempArray = []
            for ( let item of this.state.dom ) {
                if (item.block == nowblock) {
                    tempArray.push(item.data)
                }
            }
            getListen(GetQueryString("id"), (nowblock - 1), tempArray.join(",")).then((e) => {
                this.setState({
                    displayLoader: "none",
                })
                let url = "";
                if (typeof (e) !== "object") {
                    if (JSON.parse(e).errcode) {
                        alert("build error 60011")
                        return
                    }
                    url = JSON.parse(e).url_mp3
                } else {
                    url = e.url_mp3
                }
                this.refs.audio.src = url
                this.refs.audio.load()
                this.refs.audio.play()
                this.setState({
                    trylistenIndex: nowblock
                })
                this.listenState.playing = true
                this.listenState.block = parseInt(nowblock)
                this.listenState.tempdom = JSON.parse(JSON.stringify(this.state.dom))
            })
        }
        this.lyricsIsDiff = (tempdom, dom, block) => {
            let i = 0
            for ( let item of tempdom ) {
                if (item.block == block && item.data != dom[i].data) {
                    return true
                }
                i++;
            }
            return false
        }
        this.handleGoNext = () => {
            localStorage.setItem("histroyPvPk", "")
            history.push("/pv")
        }
        this.handleGoPrevious = () => {
            history.goBack()
        }
        this.InitLyrics = () => {
            this.token = getUserToken()
            let id = GetQueryString("id")
            if (id == undefined || id == "") {
                history.go(-1)
            }
            getInitLyrics(id, this.token).then((e) => {
                let templyrics = []
                templyrics.push(
                    {
                        type: "mainTitle",
                        block: 0,
                        backgroundImage: "",
                        data: e[0].mv_name,
                    })
                for (var i = 1; i < e.length; i++) {
                    if (e[i][1]) {
                        for (var j = 0; j < e[i][1].length; j++) {
                            templyrics.push(
                                {
                                    type: "mainLyrics",
                                    block: i,
                                    backgroundImage: "",
                                    data: e[i][1][j]
                                }
                            )
                        }
                    } else {
                        for (var j = 0; j < e[i][2].length; j++) {
                            templyrics.push(
                                {
                                    type: "refrainLyrics",
                                    block: i,
                                    backgroundImage: "",
                                    data: e[i][2][j]
                                }
                            )
                        }
                    }
                }
                this.setState({
                    dom: templyrics
                })
                try {
                    localStorage.setItem("histroyDom", JSON.stringify(templyrics))
                    localStorage.setItem("histroySamplePk", id)
                } catch ( e ) {}
            })
        }

    }
    componentDidMount() {
        let id = GetQueryString("id")
        if (id == undefined || id == "") {
            history.go(-1)
        }
        try {
            if (localStorage.getItem("histroySamplePk") == id && localStorage.getItem("histroyDom") != "") {
                this.setState({
                    dom: JSON.parse(localStorage.getItem("histroyDom"))
                })
            } else {
                this.InitLyrics()
            }
        } catch ( e ) {
            console.log(e)
        }
    }
    componentWillUnMount() {
        this.refs.audio.pause()
    }
    render() {
        // if (typeof this.props.store.runtime.templateId != undefined && this.props.store.runtime.templateId != undefined) {
        // }
        let tpdom = [];
        let tpmldom = [];
        let tprmdom = [];
        if (this.state.dom.length != 0) {
            let tempBlock = 1;
            let startBlock = true;
            let no = 0;
            for ( let item of this.state.dom ) {
                switch (item.type) {
                case "mainTitle":
                    tpdom.push(
                        <div className={s.container} key={"grouptitle"}>
                            <div className={s.title}>歌名
                             <img src={resetImg} className={s.resetImg} onClick={this.InitLyrics}/>
                            </div>
                            <div key={"input" + no}><input className={s.titleinput} placeholder={item.data} order={no} value={item.data} onChange={this.handleInputChange}/></div>
                        </div>
                    )
                    break;
                case "mainLyrics":
                    if (tempBlock != item.block) {
                        startBlock = true
                        tempBlock = item.block
                    }
                    if (startBlock) {
                        if (tpmldom.length != 0) {
                            tpdom.push(<div className={s.lyricsblock} key={"tempblock" + tempBlock}>{tpmldom}</div>)
                            tpmldom = []
                        }
                        if (tprmdom.length != 0) {
                            tpdom.push(<div className={s.lyricsblock} key={"tempblock" + tempBlock}>{tprmdom}</div>)
                            tprmdom = []
                        }
                        let t = tempBlock
                        let tempImgSrc = playImg
                        let tempImgCls = "trylisten"
                        if (this.state.trylistenIndex != 0 && t == this.state.trylistenIndex) {
                            tempImgSrc = playingImg
                            tempImgCls = "trylistening"
                        }
                        tpmldom.push(
                            <div key={"lyrictitle" + tempBlock} className={s.secondtitle}>主歌歌词
                            <img src={tempImgSrc} className={tempImgCls}
                            onClick={() => {
                                this.handleListen(t)
                            }}
                            />
                            </div>
                        )
                        startBlock = false
                    }
                    tpmldom.push(
                        <div key={"input" + no} className={s.singlegroup}><input placeholder={item.data} className={s.textinput} order={no} value={item.data} onChange={this.handleInputChange}/></div>
                    )

                    break;
                case "refrainLyrics":
                    if (tempBlock != item.block) {
                        startBlock = true
                        tempBlock = item.block
                    }
                    if (startBlock) {
                        if (tpmldom.length != 0) {
                            tpdom.push(<div className={s.lyricsblock} key={"tempblock" + tempBlock}>{tpmldom}</div>)
                            tpmldom = []
                        }
                        if (tprmdom.length != 0) {
                            tpdom.push(<div className={s.lyricsblock} key={"tempblock" + tempBlock}>{tprmdom}</div>)
                            tprmdom = []
                        }
                        let t = tempBlock
                        let tempImgSrc = playImg
                        let tempImgCls = "trylisten"
                        if (this.state.trylistenIndex != 0 && t == this.state.trylistenIndex) {
                            tempImgSrc = playingImg
                            tempImgCls = "trylistening"
                        }
                        tprmdom.push(
                            <div key={"lyrictitle" + tempBlock} className={s.secondtitle}>副歌歌词 
                            <img src={tempImgSrc} className={tempImgCls}
                            onClick={() => {
                                this.handleListen(t)
                            }}
                            />
                            </div>
                        )
                        startBlock = false
                    }
                    tprmdom.push(
                        <div key={"input" + no} className={s.singlegroup}><input placeholder={item.data} className={s.textinput} order={no} value={item.data} onChange={this.handleInputChange}/></div>
                    )
                    break;
                }
                no++
            }
            if (tpmldom.length != 0) {
                tpdom.push(<div className={s.lyricsblock} key={"tempblock" + tempBlock + 1}>{tpmldom}</div>)
                tpmldom = []
            }
            if (tprmdom.length != 0) {
                tpdom.push(<div className={s.lyricsblock} key={"tempblock" + tempBlock + 1}>{tprmdom}</div>)
                tprmdom = []
            }

        }
        return (
            <div className={s.root}>
                <div className={s.loader} style={{
                display: this.state.displayLoader
            }}><Loader color="#ff6600"/></div>
                {tpdom}
                <audio ref="audio">
                <source type='audio/mpeg' src=""/>
                </audio>
                <FooterNav handleLeft={() => {
                this.handleGoPrevious()
            }} handleRight = {() => {
                this.handleGoNext()
            }}/>
            </div>
        );
    }
}
const mapState = (state) => ({
    store: state,
})
export default connect(mapState)(withStyles(s)(Lyrics));
