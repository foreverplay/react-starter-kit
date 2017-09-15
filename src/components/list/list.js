import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './list.css';
import Link from '../Link';
import config from '../../config';
import newImg from './new.png';
import hotImg from './hots.png';
import commentsImg from '../../../public/comments.png';
import playtimesImg from '../../../public/playtimes.png';
import appletouchiconImg from '../../../public/apple-touch-icon.png';
import goImg from './go.png';

class List extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidUpdate() {
        // console.log("componentDidUpdate")
        // this.props.finshRender()
    }
    // <div className={s.iconGroup}>
    // <div className={s.smallInfoGroup}>
    // <img src={commentsImg}/>
    // <span>{value.remarker_count}</span>
    // </div>
    // <div className={s.smallInfoGroup}>
    // <img src={playtimesImg}/>
    // <span>{value.playtimes}</span>
    // </div>
    // </div>
    render() {
        let doms = [];
        if (this.props.type == "hot") {
            doms.push(<div key="0001" className={s.newIcon}><img src={hotImg}/>推荐</div>)
        } else {
            doms.push(<div key="0002" className={s.newIcon}><img src={newImg}/>最新</div>)
        }
        if (typeof this.props.store !== undefined) {
            let no = 0;
            let tempclass = s.indexmv
            for ( let value of this.props.store ) {
                doms.push(<div key={"newSong" + value.pk + Math.random()} className={tempclass}>
                        <div className={s.mvcover} style={{
                    backgroundImage: "url(" + value.cover_cover + ")"
                }}>
                        <Link to={"/play?id=" + value.pk}>
                        <img className={s.go} src={goImg}/>
                   </Link>
                        <div className={s.userInfoGroup}>
                        <div className={s.pvname}>{value.cover_name}</div>
                        <div className={s.user}><span>{value.myuser.realname}</span></div>
                        </div>
                     </div>
                </div>)
                no++;
            }
        }
        return (
            <div className={s.root}>
                {doms}
            </div>
        );
    }
}
export default withStyles(s)(List);