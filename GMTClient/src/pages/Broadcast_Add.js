import React, { Component } from 'react';
import '../css/App.css';
import ReactTable from 'react-table'
import 'react-table/react-table.css'

//import Button from 'react-bootstrap/lib/Button';

import {Label, Button, ButtonToolbar, DropdownButton, MenuItem, Glyphicon, Dropdown} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import Datetime from 'react-datetime'
import 'react-datetime/css/react-datetime.css'

class Broadcast_Add extends Component {
    constructor(props) {
        super(props);
        this.Action = this.props.Action;

        /*
         ID: r[i].ID,
         Text: r[i].Text,
         URL: r[i].Url,
         LangCode: r[i].LangCode,
         Priority: r[i].Priority,
         Interval: r[i].Interval,
         StartTime: FormatDateTime(r[i].StartTime),
         EndTime: FormatDateTime(r[i].EndTime)
         */


        var now = new Date();

        this.state = {
            Data: [],
            RedirectData: {
                Text: "",
                URL: "",
                LangCode: 0,
                Priority: 0,
                Interval: 60,
                StartTime: now,
                EndTime: now
            },
            Error: ""
        };

        var yyyy = now.getFullYear();
        var mm = this.pad(now.getMonth() + 1, 2);
        var dd = this.pad(now.getDate(), 2);
        var hh = this.pad(now.getHours(), 2);
        var min = this.pad(now.getMinutes(), 2);
        var value = yyyy + '-' + mm + '-' + dd + " " + hh + ":" + min;

        this.TempTime = {
            StartTime: value,
            EndTime: value
        };

        this.Language = [
            {
                LangCode: 0,
                LangName: 'Tiếng Việt'
            },
            {
                LangCode: 1,
                LangName: 'Tiếng Anh'
            }
        ];

    }

    OnUpdateState(Data) {
        console.log("OnUpdateState", Data);
        this.setState({
            Responsed: true,
            Data: Data.Result,
            RedirectData: this.state.RedirectData,
            Error: this.state.Error
        })
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
                    <h1 id="dataTitle">Tạo Broadcast: </h1>
                    <Label bsStyle="danger" id="ErrorLabel">{this.state.Error}</Label>

                    <table className="table table-striped">

                        <tbody>
                        <tr>
                            <td>
                                <div className="form-group">
                                    <label className="col-sm-2">Text:</label>

                                    <div className="col-sm-6">
                                        <input id="Text" className="form-control"
                                               value={this.state.RedirectData.Text}
                                               onChange={this.OnChange.bind(this)}></input>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="form-group">
                                    <label className="col-sm-2">URL:</label>

                                    <div className="col-sm-6">
                                        <input id="URL" className="form-control"
                                               value={this.state.RedirectData.URL}
                                               onChange={this.OnChange.bind(this)}></input>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="form-group">
                                    <label id="Language" className="col-sm-2">Ngôn ngữ:</label>

                                    <div className="col-sm-6">
                                        <Dropdown id="dropdown-custom-1" bsStyle="success">
                                            <Dropdown.Toggle>
                                                { this.Language.map(function (Lang, index) {
                                                    if (this.state.RedirectData.LangCode == Lang.LangCode) {
                                                        return Lang.LangName;
                                                    }
                                                }.bind(this))}
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu className="text-primary">
                                                {
                                                    this.Language.map(function (Lang, index) {
                                                        return this.state.RedirectData.LangCode == Lang.LangCode ?
                                                            <MenuItem
                                                                onClick={this.OnChangeLangCode.bind(this, Lang.LangCode)}
                                                                id={"LangCode" + Lang.LangCode}
                                                                key={"LangCode" + index}
                                                                active>{Lang.LangName}</MenuItem>
                                                            : <MenuItem
                                                            onClick={this.OnChangeLangCode.bind(this, Lang.LangCode)}
                                                            id={"LangCode" + Lang.LangCode}
                                                            key={"LangCode" + index}>{Lang.LangName}</MenuItem>
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
                                    <label className="col-sm-2">Độ ưu tiên:</label>

                                    <div className="col-sm-6">
                                        <input type="number" id="Priority" className="form-control"
                                               value={this.state.RedirectData.Priority}
                                               onChange={this.OnChange.bind(this)}></input>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="form-group">
                                    <label className="col-sm-2">Thời gian lặp lại:</label>

                                    <div className="col-sm-6">
                                        <input type="number" id="Interval" className="form-control"
                                               value={this.state.RedirectData.Interval}
                                               onChange={this.OnChange.bind(this)}></input>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="form-group">
                                    <label className="col-sm-2">Thời gian:</label>

                                    <div className="col-sm-3">
                                        <Datetime
                                                  viewDate={this.state.RedirectData.StartTime}
                                                  onChange={(e) => this.OnTimeChange(e, "StartTime")} id="StartTime"
                                                  value={this.state.RedirectData.StartTime}/>
                                    </div>

                                    <div className="col-sm-3">
                                        <Datetime
                                                  viewDate={this.state.RedirectData.EndTime}
                                                  onChange={(e) => this.OnTimeChange(e, "EndTime")}
                                                  id="EndTime" value={this.state.RedirectData.EndTime}/>
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
                                <Button className="btn btn-success" onClick={this.OnExecute.bind(this)}>Tạo</Button>
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

    OnTimeChange(time, ID) {
        var GDate = new Date(time._d);
        var yyyy = GDate.getFullYear();
        var mm = this.pad(GDate.getMonth() + 1, 2);
        var dd = this.pad(GDate.getDate(), 2);
        var hh = this.pad(GDate.getHours(), 2);
        var min = this.pad(GDate.getMinutes(), 2);

        var value = yyyy + '-' + mm + '-' + dd + ' ' + hh + ':' + min;

        var RedirectData = this.state.RedirectData;
        this.TempTime[ID] = value;
        RedirectData[ID] = GDate;

        this.setState({
            Data: this.state.Data,
            RedirectData: RedirectData,
            Error: this.state.Error
        })
    }


    OnChangeLangCode(value) {
        var RedirectData = this.state.RedirectData;
        RedirectData.LangCode = value;

        this.setState({
            Data: this.state.Data,
            RedirectData: RedirectData,
            Error: this.state.Error
        })
    }

    CheckValidDateTime() {

        //var GTimeStart = new Date(this.state.RedirectData.TimeStart);
        //var hour = GTimeStart.getHours();
        //var min = GTimeStart.getMinutes();
        //var GTimeStart_Stamp = Date.parse("01/01/2018 " + hour + ":" + min);
        //
        //var GTimeEnd = new Date(this.state.RedirectData.TimeEnd);
        //hour = GTimeEnd.getHours();
        //min = GTimeEnd.getMinutes();
        //var GTimeEnd_Stamp = Date.parse("01/01/2018 " + hour + ":" + min);
        //
        //if (GTimeEnd_Stamp < GTimeStart_Stamp) {
        //    return 1;
        //}

        var GDayStart = +new Date(this.state.RedirectData.DayStart);
        var GDayEnd = +new Date(this.state.RedirectData.DayEnd);

        if (GDayStart > GDayEnd) {
            return 2;
        }

        return 0;
    }

    FormatTime(time){
        var Result = "";

        var minute = this.pad(time%60, 2);
        var hour = Math.floor(time/60) % 24;


        hour = this.pad(hour, 2);

        Result = hour + ":" + minute;
        return Result;
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

        /*
         ID: r[i].ID,
         Text: r[i].Text,
         URL: r[i].Url,
         LangCode: r[i].LangCode,
         Priority: r[i].Priority,
         Interval: r[i].Interval,
         StartTime: FormatDateTime(r[i].StartTime),
         EndTime: FormatDateTime(r[i].EndTime)
         */

        Result.ID = parseInt(this.state.RedirectData.ID);
        Result.Text = (this.state.RedirectData.Text);
        Result.URL = (this.state.RedirectData.URL);
        Result.LangCode = parseInt(this.state.RedirectData.LangCode);
        Result.Priority = parseInt(this.state.RedirectData.Priority);
        Result.Interval = parseInt(this.state.RedirectData.Interval);

        if(Result.Interval < 60){
            Result.Interval = 60;
        }

        Result.StartTime = this.TempTime.StartTime;
        Result.EndTime = this.TempTime.EndTime;
        Result.GameID = 0;

        return Result;
    };


    OnExecute() {
        var data = this.GatherData();

        var NotValid = this.CheckValidDateTime();

        if (NotValid == 0) {
            this.setState({
                Data: this.state.Data,
                RedirectData: this.state.RedirectData,
                Error: ""
            });
            this.props.OnExecute(this.Action, data);

            setTimeout(function () {
                this.props.OnRedirect(14, {});
            }.bind(this), 500);
        }
        else {
            var ErrorText = "Sai Ngày";

            if (NotValid == 1) {
                ErrorText = "Sai Giờ";
            }

            //document.getElementById("ErrorLabel").innerHTML = ErrorText;

            this.setState({
                Data: this.state.Data,
                RedirectData: this.state.RedirectData,
                Error: ErrorText
            })
        }

    }
}

export default Broadcast_Add;
