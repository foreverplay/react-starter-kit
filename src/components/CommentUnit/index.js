import React from 'react';
import PropTypes from 'prop-types';
import config from '../../config';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './CommentUnit.css'

import likedthisImg from "./likedthis.png";
import likethisImg from "./likethis.png";

// import yximg from "../../../public/tile.png"
function getDateTimeStamp(dateStr) {
    var time = new Date(dateStr * 1000)
    return time.getTime();
}

function getDateDiff(dateTimeStamp) {
    var minute = 1000 * 60;
    var hour = minute * 60;
    var day = hour * 24;
    var halfamonth = day * 15;
    var month = day * 30;
    var year = month * 12;
    var now = new Date().getTime();
    var diffValue = now - dateTimeStamp;
    var result = '刚刚';
    if (diffValue < 0) {
        return result;
    }
    var yearC = diffValue / year;
    var monthC = diffValue / month;
    var weekC = diffValue / (7 * day);
    var dayC = diffValue / day;
    var hourC = diffValue / hour;
    var minC = diffValue / minute;
    if (yearC >= 1) {
        result = '' + parseInt(yearC) + '年前';
    } else if (monthC >= 1) {
        result = '' + parseInt(monthC) + '月前';
    } else if (weekC >= 1) {
        result = '' + parseInt(weekC) + '周前';
    } else if (dayC >= 1) {
        result = '' + parseInt(dayC) + '天前';
    } else if (hourC >= 1) {
        result = '' + parseInt(hourC) + '小时前';
    } else if (minC >= 1) {
        result = '' + parseInt(minC) + '分钟前';
    } else
        result = '刚刚';
    return result;
}
class CommentUnit extends React.Component {
    constructor(props) {
        super(props)
    }
    render() {
        let Props = this.props
        let PropsInfo = this.props.dmInfo
        let time = getDateDiff(getDateTimeStamp(PropsInfo.comment_create))
        let like = <div className={s.likedthis, s.likeicon}><img src={likethisImg} onClick={Props.like}/></div>;
        if (typeof PropsInfo.ding != undefined && PropsInfo.ding === 1) {
            like = <div className={s.likethis, s.likeicon}><img src={likedthisImg} onClick={Props.like}/></div>
        }
        return <div>
            <div className={s.commondmgroup}>
                <div className={s.titlegroup}>
              <a href="other.html?id=50"><div className={s.left} style={{
                backgroundImage: "url(" + PropsInfo.comment_user.headimg + ")"
            }}></div></a>
              <div className={s.center}><div className={s.username}>{PropsInfo.comment_user.realname}</div><div className={s.pubtime}>{time}</div></div>
              <div className={s.right}><div className={s.likenumber}>{PropsInfo.comment_lovecount}</div>{like}</div>
            </div>
              <div className={s.textgroup}>{PropsInfo.comment}</div>
          </div>
        </div>
    }
}
export default withStyles(s)(CommentUnit)