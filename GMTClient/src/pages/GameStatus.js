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
                GameStatusArray: [],
                ChannelName: []
            },
            DateRequest: {
                DateFrom: now,
                DateTo: now
            },
            Filter: 0
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
        //GameStatusArray_ForChart
        this.setState({
            Responsed: true,
            Data: Data,
            DateRequest: this.state.DateRequest
        })
    }

    render() {
        var Sum_DAU = 0;
        var Sum_NAU = 0;
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
                            <label className="paddingTop3"> Channel: </label>
                        </div>
                        <div className="col-sm-2">
                            {
                                <select className="form-control" defaultValue={this.state.Filter} onChange={(e) => this.HandleChangeFilter(e, "Filter")} id="Filter">
                                    {
                                        this.state.Data.ChannelName.map(function (Element, index) {
                                            return <option
                                                key={index}
                                                value={Element.ChannelID}
                                                >{Element.Name}</option>
                                        }.bind(this))
                                    }
                                </select>
                            }
                        </div>
                    </div>
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
                                        <th>Date</th>
                                        <th>DAU</th>
                                        <th>NAU</th>
                                        <th>A1</th>
                                        <th>A3</th>
                                        <th>A7</th>
                                        <th>A15</th>
                                        <th>A30</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {
                                        this.state.Data.GameStatusArray.map(function (DateStatus, index) {
                                            var DAU = 0;
                                            var A_Result = {
                                                "1": 0,
                                                "3": 0,
                                                "7": 0,
                                                "15": 0,
                                                "30": 0
                                            };

                                            for(var i = 0; i < DateStatus.DAU.length; i++){
                                                if(DateStatus.DAU[i].ChannelID == this.state.Filter
                                                || this.state.Filter == 0){
                                                    DAU += DateStatus.DAU[i].DAU;
                                                }
                                            }

                                            for(var i = 0; i < DateStatus.A_Result.length; i++){
                                                if(DateStatus.A_Result[i].ChannelID == this.state.Filter){
                                                    A_Result["1"] += DateStatus.A_Result[i].A_Result["1"];
                                                    A_Result["3"] += DateStatus.A_Result[i].A_Result["3"];
                                                    A_Result["7"] += DateStatus.A_Result[i].A_Result["7"];
                                                    A_Result["15"] += DateStatus.A_Result[i].A_Result["15"];
                                                    A_Result["30"] += DateStatus.A_Result[i].A_Result["30"];
                                                }
                                            }

                                            Sum_DAU += DAU;
                                            Sum_NAU += DateStatus.NAU;
                                            return <tr key={index}>
                                                <td>{DateStatus.Date}</td>
                                                <td>{DAU}</td>
                                                <td>{DateStatus.NAU}</td>
                                                <td>{A_Result["1"]}</td>
                                                <td>{A_Result["3"]}</td>
                                                <td>{A_Result["7"]}</td>
                                                <td>{A_Result["15"]}</td>
                                                <td>{A_Result["30"]}</td>
                                            </tr>
                                        }.bind(this))
                                    }
                                    <tr>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td style={{fontWeight: "bold"}}> Tổng</td>
                                        <td>{Sum_DAU}</td>
                                        <td>{Sum_NAU}</td>
                                    </tr>

                                    <tr>
                                        <td style={{fontWeight: "bold"}}> Trung Bình</td>
                                        <td>{this.state.Data.GameStatusArray.length > 0 ? Sum_DAU / this.state.Data.GameStatusArray.length : 0}</td>
                                        <td>{this.state.Data.GameStatusArray.length > 0 ? Sum_NAU / this.state.Data.GameStatusArray.length : 0}</td>
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

    HandleChangeFilter(event, ID) {
        var Value = event.target.value;
        this.state[ID] = Value;

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
        };

        this.props.OnExecute(this.Action, data);
    }
}

export default GameStatus;
