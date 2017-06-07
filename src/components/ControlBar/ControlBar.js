import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './ControlBar.css';

class ControlBar extends React.Component{
	constructor(props){
		super(props)
		this.state={
			barBottom: 105,
            barTop: 30,
		}
		this.tempBarTopH = 0;
		this.tempBarBottomH = 0;
		this.tempbarBottom = 0;
		this.tempbarTop = 0;
		this.indexGroup=[];
		this.onTouchStartUp = this.onTouchStartUp.bind(this)
		this.onTouchMoveUp = this.onTouchMoveUp.bind(this)
		this.onTouchEndUp = this.onTouchEndUp.bind(this)
		this.onTouchStartDown = this.onTouchStartDown.bind(this)
		this.onTouchMoveDown = this.onTouchMoveDown.bind(this)
		this.onTouchEndDown = this.onTouchEndDown.bind(this)
		this.getLineByH = this.getLineByH.bind(this)
	}
	getLineByH(height){
		let temph = 0;
		let data = {
			"index" : 0,
			"height":0,
		}
		for (var i = 1; i < this.props.dom.length; i++) {
			if (this.props.dom[i].block>this.props.dom[i - 1].block) {
				temph+=55+50
			}else{
				temph+=50
			}
			if (temph>height) {
				return {
					"index" : i,
					"height": temph,
				}
			}
		}
	}
	onTouchStartUp(event){
		this.tempBarTopH = event.touches[0].pageY
		this.tempbarTop = this.state.barTop
		// this.tempBarTopH = event.touches[0].pageY
	}
	onTouchMoveUp(event){
		    event.preventDefault()
    		event.stopPropagation();
	        let canmove = true
	        let tempTop = event.touches[0].pageY - this.tempBarTopH + this.tempbarTop;
		    if (tempTop < 30) {
		    	tempTop = 30
		    }
		    if (this.state.barBottom - tempTop <= 80) {
		    	tempTop = this.state.barBottom - 80
		    }
	        this.setState({
	        	barTop:tempTop,
	        })
		    return
	}
	onTouchEndUp(){
		let data = this.getLineByH(this.state.barTop+40)
			this.setState({
	        	barTop:data.height - 30 - 45,
	        })
	        let a = [];
	        for (var i = data.index; i <= this.props.barInLine; i++) {
	        	a.push(i)
	        }
	        console.log(a)
	        this.props.finshChose(a)
	}
	onTouchStartDown(event){
		this.tempBarBottomH = event.touches[0].pageY
		this.tempbarBottom = this.state.barBottom
	}
	onTouchMoveDown(event){
		    event.preventDefault()
    		event.stopPropagation();
	        let tempottom = event.touches[0].pageY - this.tempBarBottomH + this.tempbarBottom;
		    if (tempottom < 115) {
		    	tempottom = 115
		    }
		    if (tempottom - this.state.barTop <= 80) {
		    	tempottom = this.state.barTop + 80
		    }
	        this.setState({
	        	barBottom:tempottom,
	        })
		    return
	}
	onTouchEndDown(){
		let data = this.getLineByH(this.state.barBottom - 20)
			this.setState({
	        	barBottom:data.height,
	        })
	         let a = [];
	        for (var i = this.props.barInLine; i <= data.index; i++) {
	        	a.push(i)
	        }
	        console.log(a)
	        this.props.finshChose(a)
	}
	componentDiemounted(){

	}
	componentWillReceiveProps(preProps) {
        if (preProps.barInLine && preProps.dom.length> 0) {
	        let tempBtm = 0;
            tempBtm+=preProps.dom[preProps.barInLine].block*55
            tempBtm+=50*preProps.barInLine
            this.setState({
            	barBottom:tempBtm,
            	barTop:tempBtm-75
            })
        }
    }
	render(){
		return (
			<div className={s.barControl} ref='root' style={{display : this.props.showTool}}>
                <div className={s.barTop}  style={{top:''+this.state.barTop+'px'}} onTouchStart={this.onTouchStartUp} onTouchMove={this.onTouchMoveUp} onTouchEnd ={this.onTouchEndUp}>v</div>
                <div className={s.barBottom} style={{top:this.state.barBottom+'px'}} onTouchStart={this.onTouchStartDown} onTouchMove={this.onTouchMoveDown} onTouchEnd ={this.onTouchEndDown}>v</div>
            </div>)
	}
}
export default withStyles(s)(ControlBar);