import React from 'react';
import PropTypes from 'prop-types';
import fetch from '../../core/fetch';
import config from '../../config';
import { connect } from 'react-redux';
import { setUserToken } from '../../actions/user';
import { GetQueryString, getUserToken } from '../../commonFunc';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Player.css';

function loadhotsdm(argument) {
    $.ajax({
        url: config.serverHost + 'song/cmshot',
        headers: {
            'Authorization': 'Bearer ' + accesstoker,
        },
        data: {
            pk: argument,
        },
        method: 'get',
    }).done(function(e) {
        if (e.length > 0) {
            $('.hots-dmgroups').html('').append(setHtml(e))
        }
    }).fail(function(e) {
        console.log('获取异常' + e)
    })
}
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

function formatDm(text, ctime) {
    var absDan = {}; //用于存放弹幕属性
    absDan['mode'] = 1; //决定采取什么mode，比如1是普通滚动等等，详细请看 CommentCoreLibrary文档里面的弹幕类型介绍
    absDan['text'] = text //通过某种渠道获取文字
    absDan['color'] = 0xffffff; //获取颜色（为一个数字）
    absDan['size'] = 12; // 想办法获取字号
    absDan['stime'] = ctime;
    return absDan
}

class Player extends React.Component {
    constructor(props) {
        super(props)
        this.IMGplayer = {};
        this.audio = {};
        this.audioSrc = {};
        this.timeOut = "";
        this.loadFinsh = false;
        this.state = {
            userToken: "",
        }
    }
    componentDidMount() {
        console.log("componentDidMount")
        this.setState({
            userToken: getUserToken()
        })
        this.IMGplayer = require("./imgplayer").default
        let isNode = typeof window === 'undefined';
        let This = this
        // setTimeout(() => {
        //     This.audioSrc = document.getElementById('IMGplayerAudioSrc')
        //     This.audio = document.getElementById('IMGplayerAudio')
        // })
        if (This.loadFinsh) {
            return
        }
        if (this.state.userToken != "" && !isNode) {
            if (GetQueryString("id") != "") {
                if (this.props.videoInfo != "" && this.props.videoUrl != "") {
                    let e = this.props.videoInfo
                    let imgs = customImgArray(e.cover_cover, e.picturemovies)

                    // this.IMGplayer.init(imgs, e.cover_addr, e.cover_xmlpath, function(argument) {
                    //     this.loadFinsh = true
                    // })

                    this.IMGplayer.init(imgs, e.cover_addr + '?' + Math.random(), e.cover_xmlpath + '?' + Math.random(), function(argument) {
                        // console.log('canplay')
                        This.loadFinsh = true
                    // IMGplayer.onPlay = function() {
                    //     var interval = setTimeout(function() {
                    //         calculateplay(GetQueryString('id'))
                    //     }, 10000)
                    // }
                    })
                }
            }
        }
    }
    componentWillReceiveProps(nextProps) {
        let isNode = typeof window === 'undefined';
        let This = this
        if (This.loadFinsh) {
            if (nextProps.transferData != "") {
                if (This.IMGplayer.audio.seek() == 0) {
                    alert("请先播放!")
                    return
                }
                This.IMGplayer.CM.send(formatDm(nextProps.transferData, This.IMGplayer.audio.seek()))
                nextProps.sendDmToServe(This.IMGplayer.audio.seek())
            }
            return
        }
        if (GetQueryString("id") != "") {
            if (nextProps.videoInfo != "" && nextProps.videoUrl != "") {
                let e = nextProps.videoInfo
                let imgs = customImgArray(e.cover_cover, e.picturemovies)
                This.IMGplayer.init(imgs, e.cover_addr, e.cover_xmlpath + '?' + Math.random(), function(argument) {
                    This.loadFinsh = true
                })
            }
        }
    }
    componentWillUnmount() {
        try {
            this.IMGplayer.offLoad()
            this.IMGplayer.audio.pause();
        } catch ( e ) {
            console.log(e)
        }
    }
    render() {
        return (
            <div id="IMGplayer" className={s.IMGplayer}>
                <div className="component">
                    <div id="imgsContainer" className={s.imgsContainer} />
                    <div id="IMGplayerContainer" className={s.IMGplayerContainer} />
                </div>
            </div>
        );
    }
}

const mapState = (state) => ({
    store: state,
})

export default connect(mapState, "")(withStyles(s)(Player));
