import React, { Component } from 'react';
import '../css/App.css';
import ReactTable from 'react-table'
import 'react-table/react-table.css'
import Chart from 'chart.js';

import {Table, Label, Button, ButtonToolbar, DropdownButton, MenuItem, Glyphicon, Dropdown} from 'react-bootstrap';
import Datetime from 'react-datetime'

var LineChart = require("react-chartjs").Line;

class LogUserKillBoss extends Component {
    constructor(props) {
        super(props);
        this.Action = this.props.Action;
        var nowfrom = new Date();
        var nowto = new Date();

        nowfrom.setHours(0);
        nowfrom.setMinutes(0);

        nowto.setHours(23);
        nowto.setMinutes(59);

        this.state = {
            Responsed: false,
            Data: {
                Result: [],
            },
            ChartData: {},
            Request: {
                DateFrom: nowfrom,
                DateTo: nowto,
                RequestInfo: '',
                RequestOption: 0
            }
        };

        this.RequestOptions = [
            {
                Name: 'UserID',
                Kind: 0
            },
            {
                Name: 'Nick',
                Kind: 1
            }
        ];

        var yyyy = nowfrom.getFullYear();
        var mm = this.pad(nowfrom.getMonth() + 1, 2);
        var dd = this.pad(nowfrom.getDate(), 2);
        var hh = this.pad(nowfrom.getHours(), 2);
        var min = this.pad(nowfrom.getMinutes(), 2);

        var valuefrom = yyyy + '-' + mm + '-' + dd + " " + hh + ":" + min;

        yyyy = nowto.getFullYear();
        mm = this.pad(nowto.getMonth() + 1, 2);
        dd = this.pad(nowto.getDate(), 2);
        hh = this.pad(nowto.getHours(), 2);
        min = this.pad(nowto.getMinutes(), 2);

        var valueto = yyyy + '-' + mm + '-' + dd + " " + hh + ":" + min;

        this.DateByValue = {
            DateFrom: valuefrom,
            DateTo: valueto
        };

        //this.OnExecute();
    }

    OnUpdateState(Data) {

        //GameStatusArray_ForChart
        this.setState({
            Responsed: true,
            Data: Data,
            Request: this.state.Request
        })
    }

    render() {
        return (
            <div>
                <div>
                    <h1><Label>Log User giết boss: </Label></h1>

                    <br></br>

                    <div className="row">
                        <div className="col-sm-2">
                            <label className="paddingTop3"> Thời gian: </label>
                        </div>

                        <div className="col-sm-2">
                            <Datetime onChange={(e) => this.OnDayChange(e, "DateFrom")} id="dateFrom"
                                      viewDate={this.state.Request.DateFrom}
                                      value={this.state.Request.DateFrom}/>
                        </div>
                        <div className="col-sm-2">
                            <Datetime onChange={(e) => this.OnDayChange(e, "DateTo")} id="dateFrom"
                                      viewDate={this.state.Request.DateTo}
                                      value={this.state.Request.DateTo}/>
                        </div>
                    </div>

                    <br></br>

                    <div className="row">
                        <div className="col-sm-2">
                            <label className="paddingTop3"> Thông tin tìm kiếm: </label>
                        </div>

                        <div className="col-sm-2">
                            <input className="form-control" id="RequestInfo" value={this.state.Request.UserID}
                                   onChange={this.OnChange.bind(this)}></input>
                        </div>

                        <div className="col-sm-2">
                            <Dropdown id="dropdown-custom-1" bsStyle="success">
                                <Dropdown.Toggle>
                                    {
                                        this.RequestOptions.map(function (Element, index) {
                                            if (this.state.Request.RequestOption == Element.Kind) {
                                                return Element.Name;
                                            }
                                        }.bind(this))
                                    }
                                </Dropdown.Toggle>
                                <Dropdown.Menu className="text-primary">
                                    {
                                        this.RequestOptions.map(function (Element, index) {
                                            return this.state.Request.RequestOption == Element.Kind ?
                                                <MenuItem
                                                    onClick={this.OnChangeOption.bind(this, Element.Kind)}
                                                    id={"OptionID" + Element.Kind}
                                                    key={"OptionID" + index}
                                                    active>{Element.Name}</MenuItem>
                                                : <MenuItem
                                                onClick={this.OnChangeOption.bind(this, Element.Kind)}
                                                id={"OptionID" + Element.Kind}
                                                key={"OptionID" + index}>{Element.Name}</MenuItem>
                                        }.bind(this))
                                    }
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                    </div>


                    <br></br>

                    <div className="row">
                        <div className="col-md-12">
                            <Button onClick={this.OnExecute.bind(this)}> Xem </Button>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-12">
                            <div className="box-body table-striped">
                                <br></br>
                                <Table striped bordered condensed hover>
                                    <thead>
                                    <tr>
                                        <th>UserID</th>
                                        <th>Nick</th>
                                        <th>Thưởng Lasthit</th>
                                        <th>Thời gian Lasthit</th>
                                        <th>Loại phòng</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {
                                        this.state.Data.Result.map(function (Element, index) {
                                            return <tr key={index}>
                                                <td>{Element.UserID}</td>
                                                <td>{Element.Nick}</td>
                                                <td>{this.FormatNumber(Element.LastHitAward)}</td>
                                                <td>{this.FormatDateTime(Element.LastHitTime)}</td>
                                                <td>{Element.GameName}</td>
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

    FormatDateTime(time) {
        var GDate = new Date(time);

        var yyyy = GDate.getFullYear();
        var mm = this.pad(GDate.getMonth() + 1, 2);
        var dd = this.pad(GDate.getDate(), 2);
        var hh = this.pad(GDate.getHours(), 2);
        var min = this.pad(GDate.getMinutes(), 2);

        var value = yyyy + "-" + mm + "-" + dd + " " + hh + ":" + min + ":00";

        return value;
    }

    /*
     UserID: 226,
     BossID: 22051517,
     TotalHit: 40,
     AwardMoney: 0,
     LastHitAward: 0,
     LastHitTime: 2018-09-13T07:47:42.000Z,
     CreateTime: 2018-09-13T07:47:44.000Z,
     KindID: 1,
     ServerID: 10001231
     */

    FormatNumber(num) {
        if (num >= 1000 || num * (-1) >= 1000) {
            return '' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        } else {
            return '' + num;
        }
    }

    OnChange(event) {
        var ID = event.target.id;
        var value = event.target.value;

        this.UpdateRequest(ID, value);
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
        var hh = this.pad(GDate.getHours(), 2);
        var min = this.pad(GDate.getMinutes(), 2);

        var value = yyyy + '-' + mm + '-' + dd + ' ' + hh + ":" + min;

        this.DateByValue[ID] = value;
        //
        //var RedirectData = this.state.RedirectData;
        //RedirectData[ID] = value;
        this.UpdateRequest(ID, GDate);
    }

    UpdateRequest(ID, value) {
        var Request = this.state.Request;
        Request[ID] = value;

        this.setState({
            Data: this.state.Data,
            Request: Request
        })
    }

    OnExecute() {
        // format: dd/mm/yyyy
        var DateFrom = this.DateByValue.DateFrom;
        var DateTo = this.DateByValue.DateTo;
        var UserID = this.state.Request.RequestInfo.split(',');
        var Nick = [];

        if(this.state.Request.RequestOption == 1){
            UserID = [];
            Nick = this.state.Request.RequestInfo.split(',');
        }

        var data = {
            DateFrom: DateFrom,
            DateTo: DateTo,
            UserID: UserID,
            Nick: Nick
        };

        this.props.OnExecute(this.Action, data);
    }

    OnChangeOption(value) {
        this.state.Request.RequestOption = value;
        this.setState(this.state);
    }
}

export default LogUserKillBoss;
