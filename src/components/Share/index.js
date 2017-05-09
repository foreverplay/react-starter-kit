import React, { PropTypes } from 'react';
import fetch from '../../core/fetch';
import config from '../../config';

import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './share.css';
import liked from './liked.png';
import like from './like.png';
import share from './share.png';
import other from './other.png';

import weiboImg from './weibo.png';
import qzomeImg from './qzome.png';
import tiebaImg from './tieba.png';
import urlImg from './url.png';
import closeImg from './close1.png';
import sharetextImg from './sharetext.png';
import reportImg from './report.png';
import messageImg from './message.png';

async function reportPv(pk) {
    const resp = await fetch(config.serverHost + 'song/report/' + pk, {
        method: 'post',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        body: 'pk=' + pk,
    })
    const data = await resp.json();
    if (!data)
        throw new Error('Failed to load the Ad.');
    return data;
}

class Share extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            showShare: "none",
            showMore: "none",
            likeimg: like,
        }
        this.handleLike = () => {
            let num = 0;
            if (this.state.likeimg == like) {
                num = this.props.videoInfo.lovecount + 1
                this.setState({
                    likeimg: liked,
                })
            } else {
                num = this.props.videoInfo.lovecount - 1
                this.setState({
                    likeimg: like,
                })
            }
            this.props.likeThisPv(num)
        }
        this.handleSharePage = () => {
            if (this.state.showShare == "none") {
                this.setState({
                    showShare: "block",
                })
            } else {
                this.setState({
                    showShare: "none",
                })
            }
        }
        this.handleHideSharePage = () => {
            this.setState({
                showShare: "none",
            })
        }
        this.handleMore = () => {
            if (this.state.showMore == "none") {
                this.setState({
                    showMore: "block",
                })
            } else {
                this.setState({
                    showMore: "none",
                })
            }
        }
        this.handleHideMore = () => {
            this.setState({
                showMore: "none",
            })
        }
        this.showQQ = () => {
            alert('嫣汐讨论Q群：326766734')
            this.handleHideMore()
        }
        this.reportThisPv = () => {
            reportPv(this.props.videoInfo.pk).then((e) => {
                if (e && e.ok == "ok") {
                    alert('举报成功!')
                    this.handleHideMore()
                }
            })
        }
    }
    componentDidMount() {
        let mvTitle = '《' + this.props.videoInfo.cover_name + '》制作人：' + this.props.videoInfo.cover_maker + '  演唱：嫣汐 - MUTA虚拟歌姬'
        document.title = mvTitle
        let shareObj = {
            title: mvTitle,
            content: this.props.videoInfo.cover_name,
            href: config.serverHost + 'play.html?id=' + this.props.videoInfo.pk,
            thumbs: 'http://star-fans.com/favicon.ico',
            pictures: 'http://star-fans.com/favicon.ico',
        }
        let shareObjJson = {
            content: this.props.videoInfo.cover_intro,
            href: config.serverHost + 'play.html?id=' + this.props.videoInfo.pk,
            pictures: 'http://star-fans.com/favicon.ico',
            thumbs: 'http://star-fans.com/favicon.ico',
            title: mvTitle,
        }
    // window._bd_share_config = {
    //     common: {
    //         bdText: this.props.videoInfo.cover_name, //'自定义分享内容' + 
    //         bdDesc: this.props.videoInfo.cover_intro, // '自定义分享摘要' + 
    //         bdUrl: config.serverHost + 'play.html?id=' + this.props.videoInfo.pk,
    //         bdPic: '', //'自定义分享图片'
    //     },
    //     share: [{
    //         'bdSize': 16
    //     }],
    // }[(document.getElementsByTagName('head')[0] || document.body).appendChild(document.createElement('script')).src = 'http://bdimg.share.baidu.com/static/api/js/share.js?cdnversion=' + ~(-new Date() / 36e5)];
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.likePvStatue == 1) {
            this.setState({
                likeimg: liked,
            })
        } else {
            this.setState({
                likeimg: like,
            })
        }
        let mvTitle = '《' + nextProps.videoInfo.cover_name + '》制作人：' + nextProps.videoInfo.cover_maker + '  演唱：嫣汐 - MUTA虚拟歌姬'
        document.title = mvTitle
        if (nextProps.videoInfo.lovecount != this.props.videoInfo.lovecount || nextProps.videoInfo.cover_sharecount != this.props.videoInfo.cover_sharecount) {
            this.forceUpdate()
        }
    }
    render() {
        return (
            <div className={s.root}>
              <div className={s.main}>
                <div className={s.dmsharegroup}>
                  <div className={s.group} onClick={this.handleLike} data-cmd="tsina">
                    <img src={this.state.likeimg} className={s.img}/>
                    <span className={s.playmvlike}>{this.props.videoInfo.lovecount}</span>
                  </div>
                  <div className={s.group} onClick={this.handleSharePage} data-cmd="qzone">
                    <img src={share} className={s.img}/>
                    <span className={s.playmvshare}>{this.props.videoInfo.cover_sharecount}</span>
                  </div>
                  <div className={s.group} onClick={this.handleMore} data-cmd="tieba">
                    <img src={other} className={s.img}/>
                  </div>
                </div>
              </div>
                <div className={s.sharePage} style={{
                display: this.state.showShare
            }}>
                  <img src={sharetextImg} className={s.sharetext}/>
                  <div className={s.sharegroup}>
                    <div className={s.bdsharebuttonbox} data-tag="share_1" data-bd-bind="1489554824163">
                      <div className={s.shareicon}>
                        <a className={s.bds_tsina} data-cmd="tsina"><img src={weiboImg}/></a>
                        <span>新浪微博</span>
                      </div>
                      <div className={s.shareicon}>
                        <a className={s.bds_qzone} data-cmd="qzone"> <img src={qzomeImg}/></a>
                        <span>QQ空间</span>
                      </div>
                      <div className={s.shareicon}>
                        <a className={s.bds_tieba} data-cmd="tieba"><img src={tiebaImg}/></a>
                        <span>贴吧</span>
                      </div>
                     </div>
                    </div>
                  <div className={s.sharepageclose}>
                    <img src={closeImg} className={s.sharepagecloseimg} onClick={this.handleHideSharePage}/>
                  </div>
                </div>

                <div className={s.sharePage} style={{
                display: this.state.showMore
            }}>
                  <div className={s.reportgroup}>
                      <div className={s.reporticon} onClick={this.reportThisPv}>
                        <img src={reportImg}/>
                        <span>举报</span>
                      </div>
                      <div className={s.reporticon} onClick={this.showQQ}>
                        <img src={messageImg}/>
                        <span>意见反馈</span>
                      </div>
                    </div>
                  <div className={s.sharepageclose}>
                    <img src={closeImg} className={s.sharepagecloseimg} onClick={this.handleHideMore}/>
                  </div>
                </div>
            </div>
        // <div className={s.shareicon}>
        //   <img src={urlImg} className={s.clipboardimg}/>
        //   <span>复制链接</span>
        // </div>
        );
    }
}
export default withStyles(s)(Share);
