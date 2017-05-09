/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-2016 Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './DropToDo.css';
import Loader from '../../components/Loading';


//文档高度
function getScrollTop() {
    var scrollTop = 0,
        bodyScrollTop = 0,
        documentScrollTop = 0;
    if (document.body) {
        bodyScrollTop = document.body.scrollTop;
    }
    if (document.documentElement) {
        documentScrollTop = document.documentElement.scrollTop;
    }
    scrollTop = (bodyScrollTop - documentScrollTop > 0) ? bodyScrollTop : documentScrollTop;
    return parseInt(scrollTop);
}

//可视窗口高度
function getWindowHeight() {
    var windowHeight = 0;
    if (document.compatMode == "CSS1Compat") {
        windowHeight = document.documentElement.clientHeight;
    } else {
        windowHeight = document.body.clientHeight;
    }
    return parseInt(windowHeight);
}

//滚动条滚动高度
function getScrollHeight() {
    var scrollHeight = 0,
        bodyScrollHeight = 0,
        documentScrollHeight = 0;
    if (document.body) {
        bodyScrollHeight = document.body.scrollHeight;
    }
    if (document.documentElement) {
        documentScrollHeight = document.documentElement.scrollHeight;
    }
    scrollHeight = (bodyScrollHeight - documentScrollHeight > 0) ? bodyScrollHeight : documentScrollHeight;
    return parseInt(scrollHeight);
}

var _touchStart = null
var _touchMove = null
var _touchEnd = null
var _start = 0,
    _end = 0;
function kt_touch(way, callback, cbTouchEnd) {
    return
    _touchStart = function(event) {
        if (!event.touches.length) return;
        var touch = event.touches[0];
        if (way == "x") {
            _start = touch.pageX;
        } else {
            _start = touch.pageY;
        }
    }
    _touchMove = function(event) {
        if (!event.touches.length) return;
        var touch = event.touches[0];

        if (way == "x") {
            _end = (_start - touch.pageX);
        } else {
            _end = (_start - touch.pageY);
            if (_end < 0) {
                callback(_end)
            }
        }
    }
    _touchEnd = function(event) {
        return cbTouchEnd()
        if (_end > 0) {
        } else {
        } //右滑下滑
    }
    document.addEventListener("touchstart", _touchStart, false);
    document.addEventListener("touchmove", _touchMove, false);
    document.addEventListener("touchend", _touchEnd, false);
}
function remover_kt_touch(argument) {
    return
    document.removeEventListener("touchstart", _touchStart, false);
    document.removeEventListener("touchmove", _touchMove, false);
    document.removeEventListener("touchend", _touchEnd, false);
}

class DropToDo extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loadfinsh: this.props.loadFinsh,
            showpage: 1,
            btmDom: <div className={s.Loading}><Loader color='#ff6600'></Loader></div>,
        }
        this.updateState = true
        this.initScrollTop = 0;
        this.loadLeft = 1;
        this.oncetime = 1;
        this.updatefinsh = (left) => {
            this.loadLeft = left
            this.updateState = true
            if (this.loadLeft == 0 && this.oncetime == 1) {
                this.oncetime = 0
                this.setState({
                    btmDom: <div></div>,
                })
            }
        }
    }
    static propTypes = {
        children: PropTypes.node.isRequired,
    };
    componentDidMount() {
        let This = this
        window.onscroll = function() {
            //监听事件内容
            if (getScrollTop() + 50 >= getScrollHeight() - getWindowHeight()) {
                //当滚动条到底时,这里是触发内容
                //异步请求数据,局部刷新dom
                if (This.loadLeft != 0) {
                    if (This.updateState) {
                        This.setState({
                            showpage: This.state.showpage + 1,
                        })
                        This.props.loadByPage(This.state.showpage)
                        This.updateState = false
                    }
                }
            }
            This.initScrollTop = getScrollTop()
            if (getScrollTop() == 0) {
                // console.log("top")
            }
        }
        kt_touch("y", (e) => {
            if (e < -60) {
                e = -60
            }
            var ctrans = 'translate(' + 0 + 'px, ' + (-e) + 'px)';
            var css = {
                transform: ctrans
            }
            this.refs.content.style.transform = ctrans;
        }, () => {
            this.refs.content.style.transform = "translate(0px, 0px)";
            this.refs.content.style.transition = "all 0.2s linear";
        })
    }
    componentDidUpdate() {
        // console.log("componentDidUpdate")
    }
    componentWillReceiveProps(preProps) {
        if (preProps.refresh) {
            this.updateState = true
        }
        if (preProps.loadFinsh) {
            this.updatefinsh(0)
        }
    }
    componentWillUnmount() {
        this.initScrollTop = 0
        window.onscroll = function() {}
        remover_kt_touch()
    }
    render() {
        return (
            <div ref="content">
            {this.props.children}
        {this.state.btmDom}
      </div>
        );
    }
}


export default withStyles(s)(DropToDo);
// {
//             React.cloneElement(this.props.children, {
//                 showpage: this.state.showpage,
//                 updatefinsh: this.updatefinsh
//             })
//             }