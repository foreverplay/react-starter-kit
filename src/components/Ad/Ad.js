import React from 'react';
import Slider from 'react-slick';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import slickmin from './slick.min.css';
import slick from './slick-theme.min.css';
import Adcss from './Ad.css';
import fetch from '../../core/fetch';
import config from '../../config'

async function getAds() {
    const resp = await fetch(config.serverHost + 'song/carouselpic?cur_page=1', {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        }
    })
    const data = await resp.json();
    if (!data)
        throw new Error('Failed to load the Ad.');
    return data;
}

function openUrl(url) {
    localStorage.setItem("_globledata_adurl", url)
    location.href = "/ad";
}
class Ad extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: "null"
        }
    }
    componentDidMount() {
        let tsd = this
        getAds().then(function(v) {
            tsd.setState({
                data: v
            });
        })
    }
    render() {
        let _data = this.state.data
        var settings = {
            dots: false,
            infinite: true,
            speed: 500,
            slidesToShow: 1,
            slidesToScroll: 1,
        };
        let _html = <div className="swiper-slide slider-bgitem"></div>;
        if (_data !== "null") {
            _html = []
            _data.map((v, i) => {
                _html.push(<div onClick={() => {
                    openUrl(v.url)
                }} className="swiper-slide slider-bgitem" key={"indexad" + i} style={{
                    backgroundImage: 'url(' + v.pic + ')'
                }}></div>)
            })
        }
        return (
            <div className={Adcss.root}>
        <Slider {...settings} className={Adcss.contain}>
          <div>{_html || <div></div>}</div>
        </Slider>
      </div>
        );
    }
}

export default withStyles(slickmin, slick, Adcss)(Ad);
