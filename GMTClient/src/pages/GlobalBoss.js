import React, { Component } from 'react';
import '../css/App.css';
import ReactTable from 'react-table'
import 'react-table/react-table.css'

//import Button from 'react-bootstrap/lib/Button';

import {Button, ButtonToolbar, DropdownButton, MenuItem, Glyphicon} from 'react-bootstrap';

import 'bootstrap/dist/css/bootstrap.min.css';
var PacketConfig = require('../Config/PacketConfig');

class GlobalBoss extends Component {
    constructor(props) {
        super(props);
        this.Action = this.props.Action;

        this.state = {
            Responsed: false,
            Data: {
                Result: [],
                PreData: []
            }
        };

        this.OnInitData();
    }

    OnInitData() {
        this.Action = 8;
        this.OnExecute(this.Action, {});
    }

    OnUpdateState(Data) {

        //for(var i = 0; i < Data.Result.length; i++){
        //    var _Data = Data.Result[i];
        //    _Data.TimeStart = this.FormatTime(_Data.TimeStart);
        //    _Data.TimeEnd = this.FormatTime(_Data.TimeEnd);
        //}

        this.setState({
            Responsed: true,
            Data: Data
        })
    }

    FormatTime(time){
        var Result = "";

        var minute = this.pad(time%60, 2);
        var hour = Math.floor(time/60) % 24;


        hour = this.pad(hour, 2);

        Result = hour + ":" + minute;
        console.log("time:", time, "Result:", Result);
        return Result;
    }

    pad(num, size) {
        var s = num + "";
        while (s.length < size) s = "0" + s;
        return s;
    }

    render() {
        //BossID, KindID, FishKind, MaxHp, RoundTime, RoundCount, Delay, BossCount, TotalGoldHit, GoldHitMultiple, GoldHitRatio, LastHitGold, DayStart, DayEnd, TimeStart, TimeEnd

        var bgColors = {
            "Default": "#81b71a",
            "Blue": "#00B1E1",
            "Cyan": "#37BC9B",
            "Green": "#8CC152",
            "Red": "#E9573F",
            "Yellow": "#F6BB42",
        };

        //style={{backgroundColor: bgColors.Yellow}}

        return (
            <div>
                <div className="layout">
                    <h1 id="dataTitle">Global Boss: </h1>
                    <Button onClick={this.OnAddGlobalBoss.bind(this)} className="glyphicon glyphicon-plus" bsStyle="success">Thêm</Button>


                    <div className="box">
                        <div className="box-body table-striped">
                            <table className="table table-striped">
                                <thead>
                                <tr>
                                    <th>BossID</th>
                                    <th >Loại phòng</th>
                                    <th >Loại cá</th>
                                    <th >Max Hp</th>
                                    <th >Thời gian 1 vòng</th>
                                    <th >Số vòng đi</th>
                                    <th >Delay</th>
                                    <th >Số lượng boss</th>
                                    <th >Tổng tiền thưởng bắn boss</th>
                                    <th >Tỷ lệ thưởng</th>
                                    <th >Tỷ lệ trúng</th>
                                    <th >Tiền Lasthit</th>
                                    <th >Ngày bắt đầu</th>
                                    <th >Ngày kết thúc</th>
                                    <th >Giờ bắt đầu</th>
                                    <th >Giờ kết thúc</th>

                                </tr>
                                </thead>
                                <tbody>
                                {
                                    this.state.Data.Result.map(function (globalboss, index) {
                                        var TimeStart = this.FormatTime(globalboss.TimeStart);
                                        var TimeEnd = this.FormatTime(globalboss.TimeEnd);
                                        return <tr key={index}>
                                            <td>{globalboss.BossID}</td>
                                            <td>{globalboss.KindID}</td>
                                            <td>{globalboss.FishKind}</td>
                                            <td>{globalboss.MaxHp}</td>
                                            <td>{globalboss.RoundTime}</td>
                                            <td>{globalboss.RoundCount}</td>
                                            <td>{globalboss.Delay}</td>
                                            <td>{globalboss.BossCount}</td>
                                            <td>{globalboss.TotalGoldHit}</td>
                                            <td>{globalboss.GoldHitMultiple}</td>
                                            <td>{globalboss.GoldHitRatio}</td>
                                            <td>{globalboss.LastHitGold}</td>
                                            <td>{globalboss.DayStart}</td>
                                            <td>{globalboss.DayEnd}</td>
                                            <td>{TimeStart}</td>
                                            <td>{TimeEnd}</td>
                                            <td>
                                                <span className="glyphicon glyphicon-trash" onClick={this.OnDeleteGlobalBoss.bind(this, globalboss.BossID)}></span>
                                            </td>
                                            <td>
                                                <span className="glyphicon glyphicon-pencil" onClick={this.OnUpdateGlobalBoss.bind(this, globalboss)}></span>
                                            </td>
                                        </tr>
                                    }.bind(this))
                                }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    FormatTime(time) {
        var Result = "";

        var minute = this.pad(time % 60, 2);
        var hour = Math.floor(time / 60) % 24;

        hour = this.pad(hour, 2);

        Result = hour + ":" + minute;
        return Result;
    }


    OnDeleteGlobalBoss(BossID){
        var del = window.confirm('Chắc chắn muốn xóa?');

        if(del) {
            var data = {
                BossID: BossID
            };

            var currAction = PacketConfig.DeleteGlobalBoss;
            this.props.OnExecute(currAction, data);
        }
    }

    OnUpdateGlobalBoss(GlobalBossInfo){
        this.props.OnRedirect(PacketConfig.UpdateGlobalBoss, GlobalBossInfo);
    }

    OnAddGlobalBoss(){
        this.props.OnRedirect(PacketConfig.AddGlobalBoss, {});
    }

    OnExecute() {
        var data = {};

        this.props.OnExecute(this.Action, data);
    }
}

export default GlobalBoss;
