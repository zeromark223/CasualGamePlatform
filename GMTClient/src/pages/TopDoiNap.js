import React, { Component } from 'react';
import '../css/App.css';
import ReactTable from 'react-table'
import 'react-table/react-table.css'
import Chart from 'chart.js';

import {Table, Label, Button, ButtonToolbar, DropdownButton, MenuItem, Glyphicon, Dropdown, OverlayTrigger, Tooltip, Popover} from 'react-bootstrap';
import Datetime from 'react-datetime'
import ClickAwayListener from '@material-ui/core/ClickAwayListener';

var LineChart = require("react-chartjs").Line;

class GameStatus extends Component {
    constructor(props) {
        super(props);
        this.Action = this.props.Action;
        var now = new Date();

        this.state = {
            Responsed: false,
            Data: {
                TopDoi: [],
                TopNap: [],
            },
            DateRequest: {
                DateFrom: now,
                DateTo: now,
                Top: 50
            },
            Popup: {
                charge: 69,
                reward: 782
            }
        };

        var yyyy = now.getFullYear();
        var mm = this.pad(now.getMonth() + 1, 2);
        var dd = this.pad(now.getDate(), 2);
        var value = yyyy + '-' + mm + '-' + dd;

        this.DateByValue = {
            DateFrom: value,
            DateTo: value
        };

        this.OnExecute();
    }

    OnUpdateState(Data) {
        if (this.props.PacketID == this.Action) {
            this.state.Responsed = true;
            this.state.Data = Data;
            this.state.Responsed = true;
        }
        else {
            if (this.props.PacketID == 45) {
                this.state.Popup = Data.Result;
            }
        }

        this.setState(this.state);
    }

    OnChangeFormat(event, ID) {
        var Value = event.target.value;

        if(ID == "Top"){
            if(Value > 5000){
                window.alert("Số quá lớn");
                return;
            }
        }
        this.state.DateRequest[ID] = Value;
        this.setState(this.state);
    }

    render() {

        this.state.Data.TopDoi = this.state.Data.TopDoi.sort(function (a, b) {
            return a.SumMoney - b.SumMoney;
        }.bind(this));

        this.state.Data.TopNap = this.state.Data.TopNap.sort(function (a, b) {
            return b.SumMoney - a.SumMoney;
        }.bind(this));


        return (
            <div>
                <div>
                    <br></br>

                    <div className="row">
                        <div className="col-sm-1">
                            <label className="paddingTop3"> Ngày: </label>
                        </div>

                        <div className="col-sm-2">
                            <Datetime onChange={(e) => this.OnDayChange(e, "DateFrom")} id="dateFrom"
                                      viewDate={this.state.DateRequest.DateFrom}
                                      value={this.state.DateRequest.DateFrom} timeFormat={false}/>
                        </div>

                        <div className="col-sm-2">
                            <Datetime onChange={(e) => this.OnDayChange(e, "DateTo")} id="dateTo"
                                      viewDate={this.state.DateRequest.DateTo}
                                      value={this.state.DateRequest.DateTo} timeFormat={false}/>
                        </div>
                    </div>

                    <br></br>

                    <div className="row">
                        <div className="col-sm-1">
                            <label className="paddingTop3"> Top: </label>
                        </div>

                        <div className="col-sm-2">
                            <input id="Top" className="form-control"
                                   type="number"
                                   value={this.state.DateRequest.Top}
                                   onChange={(e) => this.OnChangeFormat(e, "Top")}
                                ></input>
                        </div>
                    </div>

                    <br></br>

                    <div className="row">
                        <div className="col-md-12">
                            <Button onClick={this.OnExecute.bind(this)}> Xem </Button>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <div className="box-body table-striped">
                                <br></br>
                                <Table striped bordered condensed hover>
                                    <thead>
                                    <tr>
                                        <th>STT</th>
                                        <th>UserID</th>
                                        <th>AccountID</th>
                                        <th>Tên</th>
                                        <th>Gold đổi</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {
                                        this.state.Data.TopDoi.map(function (element, index) {
                                            return <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{element.UserID}</td>
                                                <td>{element.AccountID}</td>
                                                <td>{element.Name}</td>
                                                <td>
                                                    {this.FormatNumber(-element.SumMoney)}
                                                    {this.RenderToolTip1(element, 0)}
                                                </td>
                                            </tr>
                                        }.bind(this))
                                    }
                                    </tbody>
                                </Table>
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="box-body table-striped">
                                <br></br>
                                <Table striped bordered condensed hover>
                                    <thead>
                                    <tr>
                                        <th>STT</th>
                                        <th>UserID</th>
                                        <th>AccountID</th>
                                        <th>Tên</th>
                                        <th>Gold nạp</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {
                                        this.state.Data.TopNap.map(function (element, index) {
                                            return <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{element.UserID}</td>
                                                <td>{element.AccountID}</td>
                                                <td>{element.Name}</td>
                                                <td>
                                                    {this.FormatNumber(element.SumMoney)}
                                                    {this.RenderToolTip1(element, 1)}
                                                </td>
                                            </tr>
                                        }.bind(this))
                                    }
                                    </tbody>
                                </Table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    RenderToolTip1(element, Kind) {
        var popover = this.RenderPopover(element, Kind);


        return (<OverlayTrigger
                trigger="click"
                rootClose
                placement="right"
                overlay={popover}>
                <Button className="glyphicon glyphicon-plus-sign detail" onClick={this.OnGetUserDetail.bind(this, element.AccountID, Kind)}></Button>
                </OverlayTrigger>
        );
    }

    RenderPopover(element, Kind){
        var UserData = this.state.Popup;
        var popover = (
            <Popover id="mytoolTip" className="toolTip" title={<Label bsStyle="info">{"Bảng chi tiết (VND)"}</Label>}>
                <Table striped bordered condensed hover>
                    <thead>
                    <tr>
                        <th>Tổng nạp</th>
                        <th>Tổng dổi</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>{this.FormatNumber(UserData.charge)}</td>
                        <td>{this.FormatNumber(UserData.reward)}</td>
                    </tr>
                    </tbody>
                </Table>
            </Popover>
        );

        return popover;
    }

    OnGetUserDetail(AccountID, Kind) {
        //Kind: 0 => Đổi
        //Kind: 1 => Nạp
        console.log("OnGetUserDetail", AccountID, Kind);
        var Action = 45; //GetChargeInfo
        var data = {
            AccountID: AccountID
        };
        this.props.OnExecute(Action, data);
        return null;
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

        this.DateByValue[ID] = value;
        //
        //var RedirectData = this.state.RedirectData;
        //RedirectData[ID] = value;
        this.UpdateDateRequest(ID, GDate);
    }

    UpdateDateRequest(ID, value) {
        var DateRequest = this.state.DateRequest;
        DateRequest[ID] = value;

        this.setState({
            Data: this.state.Data,
            DateRequest: DateRequest
        })
    }

    FormatNumber(num) {
        num = Math.round(num * 100) / 100;
        if (num >= 1000 || num * (-1) >= 1000) {
            return '' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        } else {
            return '' + num;
        }
    }

    OnExecute() {
        // format: dd/mm/yyyy
        var DateFrom = this.DateByValue.DateFrom;
        var DateTo = this.DateByValue.DateTo;

        if (DateFrom == '') {
            DateFrom = "2018-06-04";
            this.UpdateDateRequest("DateFrom", DateFrom);
            //this.state.DateRequest.DateFrom = DateFrom;
        }

        if (DateTo == '') {
            DateTo = "2018-06-08";
            this.UpdateDateRequest("DateTo", DateTo);
        }

        var data = {
            DateFrom: DateFrom,
            DateTo: DateTo,
            Top: this.state.DateRequest.Top
        };

        this.props.OnExecute(this.Action, data);
    }
}

export default GameStatus;
