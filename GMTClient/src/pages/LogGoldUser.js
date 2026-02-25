import React, { Component } from 'react';
import '../css/App.css';
import ReactTable from 'react-table'
import 'react-table/react-table.css'

import {Table, Label, Button, ButtonToolbar, DropdownButton, MenuItem, Glyphicon, Dropdown} from 'react-bootstrap';
import Datetime from 'react-datetime'

class TotalSystemGold extends Component {
    constructor(props) {
        super(props);
        this.Action = this.props.Action;

        var now = new Date();
        var timeFrom = new Date(2018,1,1,0,0,0,0);
        var timeTo = new Date(2018,1,1,23,59,0,0);

        this.state = {
            Responsed: false,
            Data: {
                Result: [],
                GameNameConfig: []
            },
            Request: {
                UserID: '',
                DateFrom: now,
                DateTo: now,
                TimeFrom: timeFrom,
                TimeTo: timeTo,
                Nick: '',
                Error: ''
            }
        };

        var yyyy = now.getFullYear();
        var mm = this.pad(now.getMonth() + 1, 2);
        var dd = this.pad(now.getDate(), 2);
        var value = yyyy + '-' + mm + '-' + dd;

        this.DateByValue = {
            DateFrom: value,
            DateTo: value,
            TimeFrom: "00:00:00",
            TimeTo: "23:59:00"
        }
    }

    OnUpdateState(Data) {

        if (Object.keys(Data).length === 0 && Data.constructor === Object) {
            return;
        }

        var Result = Data.Result;

        for(var i = 0; i < Result.length; i++){
            var GameName = this.GetGameNameByGameID(Data.GameNameConfig, Result[i].GameID);
            Result[i].GameName = GameName;
        }

        this.setState({
            Responsed: true,
            Data: Data,
            Request: this.state.Request
        })

    }

    render() {

        return (

            <div>
                <div className="layout">
                    <h1><Label>Log Gold User: </Label></h1>

                    <Label bsStyle="danger">{this.state.Request.Error}</Label>
                    <Table>
                        <tbody>
                        <tr>
                            <td>
                                <div className="form-group">
                                    <label className="col-sm-1 control-label">Ngày: </label>

                                    <div className="col-sm-2">
                                        <Datetime onChange={(e) => this.OnDayChange(e, "DateFrom")} id="dateFrom"
                                                  viewDate={this.state.Request.DateFrom}
                                                  value={this.state.Request.DateFrom} timeFormat={false}/>
                                    </div>

                                    <div className="col-sm-2">
                                        <Datetime onChange={(e) => this.OnDayChange(e, "DateTo")} id="dateFrom"
                                                  viewDate={this.state.Request.DateTo}
                                                  value={this.state.Request.DateTo} timeFormat={false}/>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="form-group">
                                    <label className="col-sm-1 control-label">Giờ: </label>

                                    <div className="col-sm-2">
                                        <Datetime onChange={(e) => this.OnTimeChange(e, "TimeFrom")} id="TimeFrom"
                                                  viewDate={this.state.Request.TimeFrom}
                                                  value={this.state.Request.TimeFrom} dateFormat={false}/>
                                    </div>

                                    <div className="col-sm-2">
                                        <Datetime onChange={(e) => this.OnTimeChange(e, "TimeTo")} id="TimeTo"
                                                  viewDate={this.state.Request.TimeTo}
                                                  value={this.state.Request.TimeTo} dateFormat={false}/>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="form-group">
                                    <label className="col-sm-1 control-label">UserID: </label>

                                    <div className="col-sm-6">
                                        <input type="text" id="UserID" value={this.state.Request.UserID}
                                               onChange={this.OnChange.bind(this)}></input>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="form-group">
                                    <label className="col-sm-1 control-label">Nick: </label>

                                    <div className="col-sm-6">
                                        <input id="Nick" value={this.state.Request.Nick}
                                               onChange={this.OnChange.bind(this)}></input>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="form-group">
                                    <Button onClick={this.OnExecute.bind(this)}>
                                        Xem </Button>
                                </div>
                            </td>
                        </tr>
                        </tbody>
                    </Table>

                    <div className="box-body table-striped">
                        <Table striped bordered condensed hover>
                            <thead>
                            <tr>
                                <th>UserID</th>
                                <th>Nick</th>
                                <th>ServerID</th>
                                <th>ServerTrackID</th>
                                <th>Tiền trước</th>
                                <th>Tiền thay đổi</th>
                                <th>Tiền sau</th>
                                <th>Thời gian từ</th>
                                <th>Thời gian đến</th>
                                <th>Mô tả</th>
                                <th>Game</th>
                            </tr>
                            </thead>
                            <tbody>
                            {
                                this.state.Data.Result.map(function (UserData, index) {
                                    return <tr key={index}>
                                        <td>{UserData.UserID}</td>
                                        <td>{UserData.Nick}</td>
                                        <td>{UserData.ServerID}</td>
                                        <td>{UserData.ServerTrackID}</td>
                                        <td>{this.FormatNumber(UserData.MoneyBefore)}</td>
                                        <td>{this.FormatNumber(UserData.MoneyTransfer)}</td>
                                        <td>{this.FormatNumber(UserData.MoneyAfter)}</td>
                                        <td>{UserData.UpdateTimeFrom}</td>
                                        <td>{UserData.UpdateTime}</td>
                                        <td>{UserData.Description}</td>
                                        <td>{UserData.GameName}</td>
                                    </tr>
                                }.bind(this))
                            }
                            </tbody>
                        </Table>
                    </div>
                </div>
            </div>
        );
    }

    GetGameNameByGameID(GameNameConfig, GameID) {
        var GameName = 'Khác (' + GameID + ')';

        for (var i = 0; i < GameNameConfig.length; i++) {
            if (GameNameConfig[i].GameID == GameID) {
                GameName = GameNameConfig[i].GameName;
            }
        }

        return GameName;
    }

    pad(num, size) {
        var s = num + "";
        while (s.length < size) s = "0" + s;
        return s;
    }

    OnChange(event) {
        var ID = event.target.id;
        var value = event.target.value;

        this.UpdateRequest(ID, value);
    }

    OnDayChange(time, ID) {
        var GDate = new Date(time._d);

        var yyyy = GDate.getFullYear();
        var mm = this.pad(GDate.getMonth() + 1, 2);
        var dd = this.pad(GDate.getDate(), 2);
        var value = yyyy + '-' + mm + '-' + dd;

        this.DateByValue[ID] = value;
        //
        //var RedirectData = this.state.RedirectData;
        //RedirectData[ID] = value;
        this.UpdateRequest(ID, GDate);
    }

    OnTimeChange(time, ID){
        var GDate = new Date(time._d);

        var hh = this.pad(GDate.getHours(), 2);
        var mm = this.pad(GDate.getMinutes(), 2);
        var ss = "00";

        var value = hh + ":" + mm + ":" + ss;
        this.DateByValue[ID] = value;
        this.UpdateRequest(ID, GDate);
    }

    UpdateRequest(ID, value) {
        var Request = this.state.Request;
        Request[ID] = value;

        var currState = this.state;
        currState.Request = Request;

        this.setState(currState);
    }

    FormatNumber(num) {
        if (num >= 1000 || num * (-1) >= 1000) {
            return '' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        } else {
            return '' + num;
        }
    }

    OnExecute() {
        // format: dd/mm/yyyy
        var Request_DateFrom = this.DateByValue.DateFrom;
        var Request_DateTo = this.DateByValue.DateTo;
        var Request_UserID = this.state.Request.UserID;
        var Request_Nick = this.state.Request.Nick;
        var Request_TimeFrom = this.DateByValue.TimeFrom;
        var Request_TimeTo = this.DateByValue.TimeTo;

        if (Request_UserID == '' && Request_Nick == '') {
            var Error = "Thiếu thông tin";
            this.UpdateRequest("Error", Error);
        }
        else {

            this.UpdateRequest("Error", "");

            var UserID_Arr = [];
            var Nick_Arr = [];

            if (Request_UserID != '') {
                UserID_Arr = Request_UserID.split(',');
                UserID_Arr = UserID_Arr.map(function (UserID) {
                    return parseInt(UserID);
                }.bind(this));
            }

            if (Request_Nick != '') {
                Nick_Arr = Request_Nick.split(',');
            }

            var data = {
                DateFrom: Request_DateFrom,
                DateTo: Request_DateTo,
                TimeFrom: Request_TimeFrom,
                TimeTo: Request_TimeTo,
                UserID: UserID_Arr,
                Nick: Nick_Arr
            };

            this.props.OnExecute(this.Action, data);
        }
    }
}

export default TotalSystemGold;
