import React, { Component } from 'react';
import '../css/App.css';
import ReactTable from 'react-table'
import 'react-table/react-table.css'
import Chart from 'chart.js';

import {Table, Label, Button, ButtonToolbar, DropdownButton, MenuItem, Glyphicon, Dropdown} from 'react-bootstrap';
import Datetime from 'react-datetime'

var LineChart = require("react-chartjs").Line;

class GameStatus extends Component {
    constructor(props) {
        super(props);
        this.Action = this.props.Action;
        var now = new Date();

        this.state = {
            Responsed: false,
            Data: {
                UserTotalReCharge: [],
            },
            DateRequest: {
                DateFrom: now,
                DateTo: now,

            },
            Filter: {
                utm_source: ["Tất cả"],
                utm_medium: ["Tất cả"],
                utm_content: ["Tất cả"],
                utm_campaign: ["Tất cả"]
            },
            RequestFilter: {
                utm_source: "Tất cả",
                utm_medium: "Tất cả",
                utm_content: "Tất cả",
                utm_campaign: "Tất cả"
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

        this.state.Responsed = true;
        this.state.Data = Data;

        this.state.Filter = {
            utm_source: ["Tất cả"],
            utm_medium: ["Tất cả"],
            utm_content: ["Tất cả"],
            utm_campaign: ["Tất cả"]
        };

        this.state.Filter.utm_source = this.state.Filter.utm_source.concat(Data.UTMConfig.Source);
        this.state.Filter.utm_medium = this.state.Filter.utm_medium.concat(Data.UTMConfig.Medium);
        this.state.Filter.utm_content = this.state.Filter.utm_content.concat(Data.UTMConfig.Content);
        this.state.Filter.utm_campaign = this.state.Filter.utm_campaign.concat(Data.UTMConfig.Campaign);

        this.setState(this.state);
    }

    render() {
        var SumRecharge = 0;
        var SumNumber_Charged = 0;
        var SumNumber = 0;
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

                    <div className="row" style={{marginLeft: '3%'}}>
                        <div className="row">
                            <div className="col-sm-2"><Label>Source</Label></div>
                            <div className="col-sm-2"><Label>Medium</Label></div>
                            <div className="col-sm-2"><Label>Content</Label></div>
                            <div className="col-sm-2"><Label>Campaign</Label></div>
                        </div>
                        <div className="row">
                            <div className="col-sm-2">{this.RenderFiler("utm_source")}</div>
                            <div className="col-sm-2">{this.RenderFiler("utm_medium")}</div>
                            <div className="col-sm-2">{this.RenderFiler("utm_content")}</div>
                            <div className="col-sm-2">{this.RenderFiler("utm_campaign")}</div>
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
                                        <th>AccountID</th>
                                        <th>Tổng nạp</th>
                                        <th>Source</th>
                                        <th>Medium</th>
                                        <th>Content</th>
                                        <th>Campaign</th>
                                        <th>Thời gian đăng ký</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {
                                        this.state.Data.UserTotalReCharge.map(function(element, index){
                                            SumNumber++;
                                            SumRecharge+=element.TotalReCharge;
                                            if(element.TotalReCharge > 0){
                                                SumNumber_Charged++;
                                                return <tr key={index}>
                                                    <td>{element.UserID}</td>
                                                    <td>{element.AccountID}</td>
                                                    <td>{this.FormatNumber(element.TotalReCharge)}</td>
                                                    <td>{element.Source}</td>
                                                    <td>{element.Medium}</td>
                                                    <td>{element.Content}</td>
                                                    <td>{element.Campaign}</td>
                                                    <td>{this.FormatDateTime(element.UpdateTime)}</td>
                                                </tr>
                                            }
                                        }.bind(this))
                                    }
                                    <tr>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td style={{fontWeight: "bold"}}>Tổng hợp</td>
                                        <td style={{fontWeight: "bold"}}>Số lượng</td>
                                        <td style={{fontWeight: "bold"}}>Tổng tiền</td>
                                        <td style={{fontWeight: "bold"}}>Trung bình</td>

                                    </tr>
                                    <tr>
                                        <td>Tổng</td>
                                        <td>{SumNumber}</td>
                                        <td>{this.FormatNumber(SumRecharge)}</td>
                                        <td>{SumNumber == 0 ? 0 : this.FormatNumber(SumRecharge/SumNumber)}</td>
                                    </tr>
                                    <tr>
                                        <td>Nạp</td>
                                        <td>{SumNumber_Charged}</td>
                                        <td>{this.FormatNumber(SumRecharge)}</td>
                                        <td>{SumNumber_Charged == 0 ? 0 : this.FormatNumber(SumRecharge/SumNumber_Charged)}</td>
                                    </tr>
                                    </tbody>
                                </Table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    RenderFiler(prop) {

        return <select className="form-control" defaultValue={this.state.Filter[prop][0]}
                       onChange={(e) => this.HandleChangeFilter(e, prop)}>
            {
                this.state.Filter[prop].map(function (Element, index) {
                    return <option
                        key={index}
                        value={Element}>{Element}</option>
                }.bind(this))
            }
        </select>
    }

    HandleChangeFilter(event, ID) {
        var Value = event.target.value;
        this.state.RequestFilter[ID] = Value;

        this.setState(this.state);
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
        num = Math.floor(num);
        if (num >= 1000 || num * (-1) >= 1000) {
            return '' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        } else {
            return '' + num;
        }
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

    OnExecute() {
        // format: dd/mm/yyyy
        var DateFrom = this.DateByValue.DateFrom;
        var DateTo = this.DateByValue.DateTo;

        if (DateFrom == '') {
            DateFrom = "2018-06-04";
            this.UpdateDateRequest("DateFrom", DateFrom);
        }

        if (DateTo == '') {
            DateTo = "2018-06-08";
            this.UpdateDateRequest("DateTo", DateTo);
        }

        var data = {
            DateFrom: DateFrom,
            DateTo: DateTo,
            Filter: this.state.RequestFilter
        };

        this.props.OnExecute(this.Action, data);
    }
}

export default GameStatus;
