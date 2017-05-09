/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-2016 Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Pv.css';
import fetch from '../../core/fetch';
import config from '../../config';
import DropToDo from '../../components/DropToDo/DropToDo';
import Link from '../../components/Link/Link';
import { GetQueryString, getUserToken } from '../../commonFunc/';
import Loader from '../../components/Loading';
import history from '../../history';
import moreImg from './more.png';


async function getInitSamplePvs(id, token) {
    let t = (token) ? token : "";
    const resp = await fetch(config.serverHost + 'makesong/setcover/' + id, {
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
async function getAllInfo(id, token) {
    let t = (token) ? token : "";
    const resp = await fetch(config.serverHost + 'PictureMovie/songpv/updates/' + id, {
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

async function generateAudio(pk, oldpk, title, lyrics, token) {
    // oldpk 
    let t = (token) ? token : "";
    const resp = await fetch(config.serverHost + 'makesong/generatemp3', {
        method: 'post',
        headers: {
            'Authorization': 'Bearer ' + t,
            "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        // 'Content-Type': 'application/json'
        },
        body: "cm_pk=" + pk + "&s_pk=" + oldpk + "&cover_name=" + title + "&lyric_list=" + lyrics,
    })
    const data = await resp.json();
    if (!data)
        throw new Error('Failed to load the listen.');
    return data;
}
async function changeCover(pk, img, token) {
    // oldpk 
    let t = (token) ? token : "";
    const resp = await fetch(config.serverHost + 'makesong/savecover/' + pk, {
        method: 'post',
        headers: {
            'Authorization': 'Bearer ' + t,
            "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
        body: "cover_cover=" + img,
    })
    const data = await resp.json();
    if (!data)
        throw new Error('Failed to load the listen.');
    return data;
}
async function changeLine(pk, index, img, token) {
    // oldpk 
    let t = (token) ? token : "";
    const resp = await fetch(config.serverHost + 'PictureMovie/add', {
        method: 'post',
        headers: {
            'Authorization': 'Bearer ' + t,
            "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
        body: "pk=" + pk + "&index=" + index + "&picture=" + img,
    })
    const data = await resp.json();
    if (!data)
        throw new Error('Failed to load the listen.');
    return data;
}
async function publishPvs(pk, tempintroduce, token) {
    let t = (token) ? token : "";
    const resp = await fetch(config.serverHost + 'makesong/pushmp3pv/' + pk, {
        method: 'post',
        headers: {
            'Authorization': 'Bearer ' + t,
            "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
        body: "tempintroduce=" + tempintroduce,
    })
    const data = await resp.json();
    if (!data)
        throw new Error('Failed to load the listen.');
    return data;
}
function resolveAfter2Seconds(x) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(x);
        }, 2000);
    });
}
function readFile(input) {
    return new Promise((resolve, reject) => {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = (e) => {
                resolve(e.target.result)
            }
            reader.readAsDataURL(input.files[0]);
        } else {
            reject("Sorry - you're browser doesn't support the FileReader API")
        // alert("Sorry - you're browser doesn't support the FileReader API");
        }
    })
}

class Pv extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            displayLoader: "flex",
            sampleCover: {},
            dom: [],
            introduce: "",
            editDisplay: "none",
        }
        this.uploadIndex = 0;
        this.uploadContainer = "";
        this._inputElement = "";
        this.handleInputChange = (e) => {
            this.setState({
                introduce: e.target.value
            })
        }
        this.handlePublish = () => {
            // history.push("/play")
            let c = window.confirm('确定要发布了？')
            if (!c) {
                return
            }
            publishPvs(localStorage.getItem("histroyPvPk"), this.state.introduce, this.token).then((e) => {
                console.log(e)
                history.push("/play?id=" + localStorage.getItem("histroyPvPk"))
                try {
                    localStorage.setItem("histroyPvPk", "")
                    localStorage.setItem("histroyDom", "")
                    localStorage.setItem("histroySamplePk", "")
                } catch ( e ) {
                    console.log(e)
                }
            })
        }
        this.handleGoPrevious = () => {
            history.goBack()
        }
        this.imgUpload = (e) => {
            readFile(this._inputElement).then((e) => {
                // console.log(e)
                this.uploadContainer.bind({
                    url: e
                });
            }, (e) => {
                console.log(e)
            })
        }
        this.openEdit = (e) => {
            // this._inputElement.click()
            // this.refs.CroppieContent.click()
            // document.querySelector(".upload").click()

            this.setState({
                editDisplay: "block"
            })
            if (typeof e == "number") {
                this.uploadIndex = e;
            } else {
                this.uploadIndex = 0;
            }
        }
        this.hideEdit = (e) => {
            if (e.target.className != 'preview' && e.target.className != 'cr-viewport cr-vp-square' && e.target.className != 'cr-vp-square' && e.target.className != 'upload' && e.target.className != '') {
                this.setState({
                    editDisplay: "none"
                })
            }
        }
        this.handlCroppieImg = () => {
            let windowwidth = document.documentElement.clientWidth;
            windowwidth -= 24
            if (windowwidth > 768) {
                windowwidth = 768
            }
            this.uploadContainer.result({
                ype: 'canvas',
                size: {
                    width: windowwidth,
                    height: windowwidth
                },
            }).then((blob) => {
                this.setState({
                    editDisplay: "none",
                })
                if (this.uploadIndex == 0) {
                    changeCover(localStorage.getItem("histroyPvPk"), encodeURIComponent(blob), this.token).then((e) => {
                        console.log(e)
                        this.setState({
                            sampleCover: blob
                        })
                    })
                } else {
                    changeLine(localStorage.getItem("histroyPvPk"), this.uploadIndex, encodeURIComponent(blob), this.token).then((e) => {
                        let dom = this.state.dom
                        if (e && e.order_index) {
                            dom[e.order_index].backgroundImage = config.serverHost + e.picture
                            localStorage.setItem("histroyDom", JSON.stringify(dom))
                            this.setState({
                                dom: dom
                            })
                        }
                    })
                }
            });

        }
    }
    componentDidMount() {
        let Croppie = require('./Croppie')
        let windowwidth = document.documentElement.clientWidth;
        windowwidth -= 24
        if (windowwidth > 768) {
            windowwidth = 768
        }
        setTimeout(() => {
            this.uploadContainer = new Croppie(this.refs.CroppieContent, {
                viewport: {
                    width: windowwidth - 4,
                    height: windowwidth - 4
                },
                boundary: {
                    width: windowwidth,
                    height: windowwidth
                }
            });
        })
        this.forceUpdate()
        this.token = getUserToken()
        let id = GetQueryString("id")
        if (id == undefined || id == "") {
        }

        if (localStorage.getItem("histroySamplePk") != "" && localStorage.getItem("histroyDom") != "") {
            let sampleid = localStorage.getItem("histroySamplePk")
            let dom = JSON.parse(localStorage.getItem("histroyDom"))
            let lyrics = []
            let tempBlock = 1;
            let tempstring = [];
            for (var i = 1; i < dom.length; i++) {
                if (tempBlock == dom[i].block) {
                    tempstring.push(dom[i].data)
                } else {
                    lyrics.push(tempstring.join(","))
                    tempstring = [];
                    tempBlock = dom[i].block
                    tempstring.push(dom[i].data)
                }
            }
            lyrics.push(tempstring.join(","))
            lyrics = JSON.stringify(lyrics)
            let pvid = "";
            let oldpk = ""
            if (localStorage.getItem("histroyPvPk") != "" && localStorage.getItem("histroyPvPk") != null) {
                oldpk = localStorage.getItem("histroyPvPk")
            }
            generateAudio(sampleid, oldpk, dom[0].data, lyrics, this.token).then((e) => {
                if (e && e[0].sc_pk) {
                    try {
                        pvid = e[0].sc_pk
                        localStorage.setItem("histroyPvPk", e[0].sc_pk)
                    } catch ( e ) {
                        console.log(e)
                    }
                    getAllInfo(pvid, this.token).then((e) => {
                        if (e && e.picturemovies) {
                            for (var i = 0; i < e.picturemovies.length; i++) {
                                dom[e.picturemovies[i].order_index].backgroundImage = config.serverHost + e.picturemovies[i].picture
                            }
                        }
                        if (e && e.cover_cover) {
                            dom[0].backgroundImage = config.serverHost + e.cover_cover
                        }
                        localStorage.setItem("histroyDom", JSON.stringify(dom))
                        this.setState({
                            dom: dom
                        })
                    })
                    getInitSamplePvs(sampleid, this.token).then((e) => {
                        this.setState({
                            displayLoader: "none",
                            sampleCover: config.serverHost + e.mv_cover,
                        })
                    })
                }
            })
        } else {
            history.go("lyrics")
        }
    }
    render() {
        let tpdom = [];
        if (this.state.dom.length != 0) {
            let tempBlock = 1;
            let startBlock = true;
            let no = 0;
            for ( let item of this.state.dom ) {
                let tempno = no
                switch (item.type) {
                case "mainLyrics":
                    if (tempBlock != item.block) {
                        startBlock = true
                        tempBlock = item.block
                    }
                    if (startBlock) {
                        let t = tempBlock
                        tpdom.push(
                            <div key={"block" + tempBlock}>mainLyrics</div>
                        )
                        startBlock = false
                    }
                    tpdom.push(
                        <div key={"input" + no} className={s.pvLine} style={{
                            backgroundImage: "url(" + item.backgroundImage + ")"
                        }} onClick={() => {
                            this.openEdit(tempno)
                        }}>{item.data}</div>
                    )
                    break;
                case "refrainLyrics":
                    if (tempBlock != item.block) {
                        startBlock = true
                        tempBlock = item.block
                    }
                    if (startBlock) {
                        let t = tempBlock
                        tpdom.push(
                            <div key={"block" + tempBlock}>refrainLyrics</div>
                        )
                        startBlock = false
                    }
                    tpdom.push(
                        <div key={"input" + no} className={s.pvLine} style={{
                            backgroundImage: "url(" + item.backgroundImage + ")"
                        }} onClick={() => {
                            this.openEdit(tempno)
                        }}>{item.data}</div>
                    )
                    break;
                }
                no++
            }
        }
        return (
            <div className={s.root}>
                <div style={{
                backgroundImage: "url(" + this.state.sampleCover + ")"
            }} className={s.songcover}>
            <img src={moreImg} className={s.openEditBtn} onClick={this.openEdit}/>
            </div>
                <input className={s.introduce} placeholder={"请输入更多作品简介"} onChange={this.handleInputChange} value={this.state.introduce}/>
                <div className={s.loader} style={{
                display: this.state.displayLoader
            }}><Loader color="#ff6600"/></div>
            <div className={s.pvlineContainer}>
            {tpdom}
            </div>
            <div ref="CroppieContent" className={s.uploadContainer} style={{
                display: this.state.editDisplay
            }} onClick={this.hideEdit}>
                <input type="file" ref={input => this._inputElement = input} onChange={this.imgUpload} className="upload" accept="image/png,image/jpg,image/jpeg,imge/bmp,image/gif"/>
                <button onClick={this.handlCroppieImg}>生成</button>
            </div>
                <button onClick={this.handleGoPrevious}>上一步</button>
                <button onClick={this.handlePublish}>发布</button>
            </div>
        );
    }
}
const mapState = (state) => ({
    store: state,
})
export default connect(mapState)(withStyles(s)(Pv));
