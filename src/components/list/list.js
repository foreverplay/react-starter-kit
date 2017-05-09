import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './list.css';
import Link from '../Link';
import config from '../../config';
import newImg from './new.png';
import hotImg from './hots.png';
import commentsImg from '../../../public/comments.png';
import playtimesImg from '../../../public/playtimes.png';
import appletouchiconImg from '../../../public/apple-touch-icon.png';
import bgtopImg from '../../../public/bgtop.png';



class List extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidUpdate() {
        // console.log("componentDidUpdate")
        // this.props.finshRender()
    }
    render() {
        let doms = [];
        if (this.props.type == "hot") {
            doms.push(<div key="0001" className={s.newIcon}><img src={hotImg}/>最热</div>)
        } else {
            doms.push(<div key="0002" className={s.newIcon}><img src={newImg}/>最新</div>)
        }
        if (typeof this.props.store !== undefined) {
            let no = 0;
            let tempclass = s.indexmvEven
            for ( let value of this.props.store ) {
                if (no % 2 == 0) {
                    tempclass = s.indexmvEven

                } else {
                    tempclass = s.indexmvOdd
                }
                let initUserImg = appletouchiconImg;
                if (value.myuser.headimg != "" && value.myuser.headimg != null && value.myuser.headimg != undefined) {
                    initUserImg = config.serverHost + value.myuser.headimg
                }
                doms.push(<div key={"newSong" + value.pk} className={tempclass}>
                        <Link to={"/play?id=" + value.pk}>
                        <div className={s.mvcover} style={{
                    backgroundImage: "url(" + config.serverHost + value.cover_cover + ")"
                }}>
                        <div className={s.userInfoGroup}>
                        <div className={s.iconGroup}>
                        <div className={s.smallInfoGroup}>
                        <img src={commentsImg}/>
                        <span>{value.remarker_count}</span>
                        </div>
                        <div className={s.smallInfoGroup}>
                        <img src={playtimesImg}/>
                        <span>{value.playtimes}</span>
                        </div>
                        </div>
                        <div className={s.pvname}>{value.cover_name}</div>
                        <div className={s.user}><span>{value.myuser.realname}</span><div style={{
                    backgroundImage: "url(" + initUserImg + ")"
                }}></div></div>
                        </div>
                     </div>
                   </Link>
                </div>)
                no++;
            }
        }
        return (
            <div className={s.root} style={{
                backgroundImage: "url(" + bgtopImg + ")"
            }}>
                {doms}
            </div>
        );
    }
}
export default withStyles(s)(List);