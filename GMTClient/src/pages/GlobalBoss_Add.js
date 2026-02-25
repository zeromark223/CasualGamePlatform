import React, { Component } from 'react';
import '../css/App.css';
import ReactTable from 'react-table'
import 'react-table/react-table.css'

//import Button from 'react-bootstrap/lib/Button';

import {Label, Button, ButtonToolbar, DropdownButton, MenuItem, Glyphicon, Dropdown} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import Datetime from 'react-datetime'
import 'react-datetime/css/react-datetime.css'

var PacketConfig = require('../Config/PacketConfig');

class GlobalBoss_Add extends Component {
    constructor(props) {
        super(props);
        this.Action = this.props.Action;

        var now = new Date();

        this.state = {
            Data: [],
            RedirectData: {
                BossID: 0,
                KindID: 0,
                FishKind: 0,
                MaxHp: 0,
                RoundTime: 0,
                RoundCount: 0,
                Delay: 0,
                BossCount: 0,
                TotalGoldHit: 0,
                GoldHitMultiple: 0,
                GoldHitRatio: 0.1,
                DayStart: now,
                DayEnd: now,
                TimeStart: now,
                TimeEnd: now,
                LastHitGold: 0
            },
            Error: ""
        };

        var yyyy = now.getFullYear();
        var mm = this.pad(now.getMonth() + 1, 2);
        var dd = this.pad(now.getDate(), 2);
        var hh = this.pad(now.getHours(), 2);
        var min = this.pad(now.getMinutes(), 2);
        var value = hh + ":" + min;
        var value_Day = yyyy + "-" + mm + "-" + dd;

        this.TempTime = {
            DayStart: value_Day,
            DayEnd: value_Day,
            TimeStart: value,
            TimeEnd: value
        };

        setTimeout(function () {
            this.OnInitData();
        }.bind(this), 500);
    }

    OnInitData() {
        //var RediectData = this.props.RedirectData;
        //RediectData.TimeStart = this.FormatTime(RediectData.TimeStart);
        //RediectData.TimeEnd = this.FormatTime(RediectData.TimeEnd);
        //this.setState({
        //    Data: [],
        //    RedirectData: RediectData,
        //    Error: ""
        //});

        //Get Init data from server
        var currAction = PacketConfig.GetGlobalBossName;
        this.props.OnExecute(currAction, {});
        //setTimeout(function () {
        //    //this.Action = 10;
        //    this.OnUpdateState(this.props.Data);
        //}.bind(this), 500);
    }

    OnUpdateState(Data) {
        this.state.Data = Data.Result;
        this.setState(this.state);
    }

    render() {
        //BossID, KindID, FishKind, MaxHp, RoundTime, RoundCount, Delay, BossCount, TotalGoldHit, GoldHitMultiple, GoldHitRatio, LastHitGold, DayStart, DayEnd, TimeStart, TimeEnd

        /*
         return this.state.RedirectData.FishKind == GlobalBoss.FishKind ?
         <MenuItem onClick={this.OnChange.bind(this)} key={"FishKind" + index} eventKey={GlobalBoss.FishKind} active>{GlobalBoss.FishName}</MenuItem>
         : <MenuItem onClick={this.OnChange.bind(this)} key={"FishKind" + index} eventKey={GlobalBoss.FishKind}>{GlobalBoss.FishName}</MenuItem>
         }.bind(this))
         */
        return (
            <div>
                <div className="layout">
                    <h1 id="dataTitle">Thêm Boss Thế Giới: </h1>
                    <Label bsStyle="danger" id="ErrorLabel">{this.state.Error}</Label>

                    <table className="table table-striped">

                        <tbody>
                        <tr>
                            <td>
                                <div className="form-group">
                                    <label className="col-sm-2">Loại Phòng:</label>

                                    <div className="col-sm-6">
                                        <input type="number" id="KindID" className="form-control"
                                               value={this.state.RedirectData.KindID}
                                               onChange={this.OnChange.bind(this)}></input>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="form-group">
                                    <label id="FishKind" className="col-sm-2">Loại cá:</label>

                                    <div className="col-sm-6">
                                        <Dropdown id="dropdown-custom-1" bsStyle="success">
                                            <Dropdown.Toggle>
                                                {
                                                    this.state.Data.map(function (GlobalBoss, index) {
                                                    if (this.state.RedirectData.FishKind == GlobalBoss.FishKind) {
                                                        return GlobalBoss.FishName;
                                                    }
                                                }.bind(this))
                                                }
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu className="text-primary">
                                                {
                                                    this.state.Data.map(function (GlobalBoss, index) {
                                                        return this.state.RedirectData.FishKind == GlobalBoss.FishKind ?
                                                            <MenuItem
                                                                onClick={this.OnChangeFishKind.bind(this, GlobalBoss.FishKind)}
                                                                id={"FishKind" + GlobalBoss.FishKind}
                                                                key={"FishKind" + index}
                                                                active>{GlobalBoss.FishName}</MenuItem>
                                                            : <MenuItem
                                                            onClick={this.OnChangeFishKind.bind(this, GlobalBoss.FishKind)}
                                                            id={"FishKind" + GlobalBoss.FishKind}
                                                            key={"FishKind" + index}>{GlobalBoss.FishName}</MenuItem>
                                                    }.bind(this))
                                                }
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="form-group">
                                    <label className="col-sm-2">MaxHp:</label>

                                    <div className="col-sm-6">
                                        <input type="number" id="MaxHp" className="form-control"
                                               value={this.state.RedirectData.MaxHp}
                                               onChange={this.OnChange.bind(this)}></input>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="form-group">
                                    <label className="col-sm-2">Thời gian đi 1 vòng:</label>

                                    <div className="col-sm-6">
                                        <input type="number" id="RoundTime" className="form-control"
                                               value={this.state.RedirectData.RoundTime}
                                               onChange={this.OnChange.bind(this)}></input>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="form-group">
                                    <label className="col-sm-2">Số vòng:</label>

                                    <div className="col-sm-6">
                                        <input type="number" id="RoundCount" className="form-control"
                                               value={this.state.RedirectData.RoundCount}
                                               onChange={this.OnChange.bind(this)}></input>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="form-group">
                                    <label className="col-sm-2">Delay:</label>

                                    <div className="col-sm-6">
                                        <input type="number" id="Delay" className="form-control"
                                               value={this.state.RedirectData.Delay}
                                               onChange={this.OnChange.bind(this)}></input>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="form-group">
                                    <label className="col-sm-2">Số lượng boss:</label>

                                    <div className="col-sm-6">
                                        <input type="number" id="BossCount" className="form-control"
                                               value={this.state.RedirectData.BossCount}
                                               onChange={this.OnChange.bind(this)}></input>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="form-group">
                                    <label className="col-sm-2">Tổng tiền thưởng bắn boss:</label>

                                    <div className="col-sm-6">
                                        <input type="number" id="TotalGoldHit" className="form-control"
                                               value={this.state.RedirectData.TotalGoldHit}
                                               onChange={this.OnChange.bind(this)}></input>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="form-group">
                                    <label className="col-sm-2">Tỷ lệ thưởng:</label>

                                    <div className="col-sm-6">
                                        <input type="number" id="GoldHitMultiple" className="form-control"
                                               value={this.state.RedirectData.GoldHitMultiple}
                                               onChange={this.OnChange.bind(this)}></input>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="form-group">
                                    <label className="col-sm-2">Tỷ lệ trúng:</label>

                                    <div className="col-sm-6">
                                        <input type="number" id="GoldHitRatio" className="form-control"
                                               value={this.state.RedirectData.GoldHitRatio}
                                               onChange={this.OnChange.bind(this)}></input>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="form-group">
                                    <label className="col-sm-2">Tiền lasthit:</label>

                                    <div className="col-sm-6">
                                        <input type="number" id="LastHitGold" className="form-control"
                                               value={this.state.RedirectData.LastHitGold}
                                               onChange={this.OnChange.bind(this)}></input>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="form-group">
                                    <label className="col-sm-2">Ngày:</label>

                                    <div className="col-sm-2">
                                        <Datetime onChange={(e) => this.OnDayChange(e, "DayStart")} id="DayStart"
                                                  viewDate={this.state.RedirectData.DayStart}
                                                  value={this.state.RedirectData.DayStart} timeFormat={false}/>
                                    </div>

                                    <div className="col-sm-2">
                                        <Datetime onChange={(e) => this.OnDayChange(e, "DayEnd")} id="DayEnd"
                                                  viewDate={this.state.RedirectData.DayEnd}
                                                  value={this.state.RedirectData.DayEnd} timeFormat={false}/>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="form-group">
                                    <label className="col-sm-2">Khung Giờ:</label>

                                    <div className="col-sm-2">
                                        <Datetime timeFormat="hh:mm A"
                                                  onChange={(e) => this.OnTimeChange(e, "TimeStart")} id="TimeStart"
                                                  value={this.state.RedirectData.TimeStart} dateFormat={false}/>
                                    </div>

                                    <div className="col-sm-2">
                                        <Datetime timeFormat="hh:mm A" onChange={(e) => this.OnTimeChange(e, "TimeEnd")}
                                                  id="TimeEnd" value={this.state.RedirectData.TimeEnd}
                                                  dateFormat={false}/>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                    <table>
                        <tbody>
                        <tr>
                            <td>

                            </td>
                        </tr>
                        <tr>
                            <td>
                                <Button className="btn btn-success" onClick={this.OnExecute.bind(this)}>Add</Button>
                            </td>
                        </tr>
                        </tbody>
                    </table>


                </div>
            </div>
        );
    }

    OnChange(event) {
        console.log("OnChange", event.target);
        var ID = event.target.id;
        var value = event.target.value;
        var RedirectData = this.state.RedirectData;
        RedirectData[ID] = value;


        this.setState({
            Data: this.state.Data,
            RedirectData: RedirectData,
            Error: this.state.Error
        })
    }

    pad(num, size) {
        var s = num + "";
        while (s.length < size) s = "0" + s;
        return s;
    }

    OnDayChange(time, ID) {
        var GDate = new Date(time._d);

        var yyyy = GDate.getFullYear();
        var mm = this.pad(GDate.getMonth() + 1, 2);
        var dd = this.pad(GDate.getDate(), 2);
        var value = yyyy + '-' + mm + '-' + dd;

        var RedirectData = this.state.RedirectData;
        this.TempTime[ID] = value;
        RedirectData[ID] = value;

        this.setState({
            Data: this.state.Data,
            RedirectData: RedirectData,
            Error: this.state.Error
        })
    }

    OnTimeChange(time, ID) {
        var GDate = new Date(time._d);

        var hh = this.pad(GDate.getHours(), 2);
        var mm = this.pad(GDate.getMinutes(), 2);

        var value = hh + ':' + mm;

        var RedirectData = this.state.RedirectData;
        this.TempTime[ID] = value;
        RedirectData[ID] = GDate;

        this.setState({
            Data: this.state.Data,
            RedirectData: RedirectData,
            Error: this.state.Error
        })
    }


    OnChangeFishKind(value) {
        var RedirectData = this.state.RedirectData;
        RedirectData.FishKind = value;

        this.setState({
            Data: this.state.Data,
            RedirectData: RedirectData,
            Error: this.state.Error
        })
    }

    CheckValidDateTime() {

        var GTimeStart = new Date(this.state.RedirectData.TimeStart);
        var hour = GTimeStart.getHours();
        var min = GTimeStart.getMinutes();
        var GTimeStart_Stamp = Date.parse("01/01/2018 " + hour + ":" + min);

        var GTimeEnd = new Date(this.state.RedirectData.TimeEnd);
        hour = GTimeEnd.getHours();
        min = GTimeEnd.getMinutes();
        var GTimeEnd_Stamp = Date.parse("01/01/2018 " + hour + ":" + min);

        if (GTimeEnd_Stamp < GTimeStart_Stamp) {
            return 1;
        }

        var GDayStart = +new Date(this.state.RedirectData.DayStart);
        var GDayEnd = +new Date(this.state.RedirectData.DayEnd);

        if (GDayStart > GDayEnd) {
            return 2;
        }

        return 0;
    }

    TimeToMinute(time){
        var timeArr = time.split(':');
        var hour = parseInt(timeArr[0]);
        var min = parseInt(timeArr[1]);

        var minutePoint = hour * 60 + min;

        return minutePoint;
    }

    GatherData(){
        //BossID, KindID, FishKind, MaxHp, RoundTime, RoundCount, Delay, BossCount, TotalGoldHit, GoldHitMultiple, GoldHitRatio, LastHitGold, DayStart, DayEnd, TimeStart, TimeEnd
        var Result = {};

        Result.KindID = parseInt(this.state.RedirectData.KindID);
        Result.FishKind = parseInt(this.state.RedirectData.FishKind);
        Result.MaxHp = parseInt(this.state.RedirectData.MaxHp);
        Result.RoundTime = parseInt(this.state.RedirectData.RoundTime);
        Result.RoundCount = parseInt(this.state.RedirectData.RoundCount);
        Result.Delay = parseInt(this.state.RedirectData.Delay);
        Result.BossCount = parseInt(this.state.RedirectData.BossCount);
        Result.TotalGoldHit = parseInt(this.state.RedirectData.TotalGoldHit);
        Result.GoldHitMultiple = parseInt(this.state.RedirectData.GoldHitMultiple);
        Result.GoldHitRatio = parseFloat(this.state.RedirectData.GoldHitRatio);
        if(Result.GoldHitRatio >= 1){
            Result.GoldHitRatio = 0.99;
        }
        Result.LastHitGold = parseInt(this.state.RedirectData.LastHitGold);
        Result.DayStart = this.TempTime.DayStart;
        Result.DayEnd = this.TempTime.DayEnd;
        Result.TimeStart = this.TempTime.TimeStart;
        Result.TimeEnd = this.TempTime.TimeEnd;

        Result.TimeStart = this.TimeToMinute(Result.TimeStart);
        Result.TimeEnd = this.TimeToMinute(Result.TimeEnd);

        console.log("result", Result);
        return Result;
    };

    OnExecute() {
        var data = this.GatherData();
        var NotValid = this.CheckValidDateTime();
        this.Action = 11;

        if (NotValid == 0) {
            this.props.OnExecute(this.Action, data);
            setTimeout(function () {
                this.props.OnRedirect(8, {});
            }.bind(this), 500);
        }
        else {
            var ErrorText = "Sai ngÃ y";

            if (NotValid == 1) {
                ErrorText = "Sai giá»?";
            }

            document.getElementById("ErrorLabel").innerHTML = ErrorText;

            this.setState({
                Data: this.state.Data,
                RedirectData: this.state.RedirectData,
                Error: ErrorText
            })
        }

    }
}

export default GlobalBoss_Add;
