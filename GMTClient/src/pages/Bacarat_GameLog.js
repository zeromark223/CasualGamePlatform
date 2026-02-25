import React, { Component } from 'react';
import '../css/App.css';
import ReactTable from 'react-table'
import 'react-table/react-table.css'
import Chart from 'chart.js';

import {Table, Label, Button, ButtonToolbar, DropdownButton, MenuItem, Glyphicon, Dropdown} from 'react-bootstrap';
import Datetime from 'react-datetime';
import Pagination from "react-js-pagination";

var LineChart = require("react-chartjs").Line;
var PacketConfig = require('../Config/PacketConfig');

class Bacarat_GameLog extends Component {
    constructor(props) {
        super(props);
        this.Action = "getGameLog";
        var now = new Date();

        this.state = {
            Responsed: false,
            Data: {
                GameLog: []
            },
            ChartData: {},
            Request: {
                Date: now,
                RequestInfo: '',
                Filter: 0
            }
        };

        this.Pagination = {
            GameLog: {
                activePage: 1,
            },
            ItemPerPage: 50,
            pageRangeDisplayed: 5

        };

        var yyyy = now.getFullYear();
        var mm = this.pad(now.getMonth() + 1, 2);
        var dd = this.pad(now.getDate(), 2);

        var valuefrom = yyyy + '-' + mm + '-' + dd;


        this.DateByValue = {
            Date: valuefrom,
        };

        this.OnExecute();
    }

    OnUpdateState(Response) {
        this.state.Data.GameLog = Response.Data;
        this.setState(this.state);
    }

    handlePageChange(ID, pageNumber) {
        this.Pagination[ID].activePage = pageNumber;
        this.setState(this.state);
    }

    RenderPagination(ID) {
        //TopWinFinal
        var TableName = ID;
        return <div>
            <Pagination
                activePage={this.Pagination[ID].activePage}
                itemsCountPerPage={this.Pagination.ItemPerPage}
                totalItemsCount={this.state.Data[TableName].length}
                pageRangeDisplayed={5}
                onChange={this.handlePageChange.bind(this, ID)}
                />
        </div>
    }

    OnChangeRequest(event, ID) {
        var Value = event.target.value;
        this.state.Request[ID] = Value;
        this.setState(this.state);
    }

    RenderRequestTable() {
        return <div>
            <div className="row">
                <div className="col-sm-2">
                    <Label>Ngày:</Label>
                </div>
            </div>

            <div className="row">
                <div className="col-sm-2">
                    <Datetime onChange={(e) => this.OnDayChange(e, "Date")} id="dateFrom"
                              viewDate={this.state.Request.Date}
                              value={this.state.Request.Date}
                              timeFormat={false}/>
                </div>

                <div className="col-sm-1">
                    <Button onClick={this.OnExecute.bind(this)}> Xem </Button>
                </div>
            </div>
        </div>
    }

    RenderLogTable() {
        var ResultPagination = this.RenderPagination("GameLog");
        var ResultFrom = (this.Pagination.GameLog.activePage - 1) * this.Pagination.ItemPerPage;
        var ResultTo = (this.Pagination.GameLog.activePage) * this.Pagination.ItemPerPage;

        var BetLogTable = <div>
            <h2><Label>Danh sách Log: </Label></h2>
            {ResultPagination}
            <div className="box-body table-striped">
                <Table striped bordered condensed hover>
                    <thead>
                    <tr>
                        <th>STT</th>
                        <th>Mã ván</th>
                        <th>Hệ thống thắng</th>
                        <th>Hệ thống thua</th>
                        <th>Thời gian</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        this.state.Data.GameLog.map(function (Element, index) {
                            if (index >= ResultFrom && index < ResultTo) {
                                return <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{Element.matchID}</td>
                                    <td>{this.FormatNumber(Element.systemWin)}</td>
                                    <td>{this.FormatNumber(Element.systemLose)}</td>
                                    <td>{Element.date}</td>
                                </tr>
                            }
                        }.bind(this))
                    }
                    </tbody>
                </Table>
            </div>
        </div>

        return BetLogTable;
    }

    render() {
        var RequestTable = this.RenderRequestTable();
        var LogTable = this.RenderLogTable();
        return (
            <div>
                <div>
                    <h1><Label>Log Game Bacarat: </Label></h1>
                    {RequestTable}
                    <br></br>
                    <br></br>
                    {LogTable}
                    <br></br>
                    <br></br>
                </div>
            </div>
        );
    }

    FormatNumber(num) {
        num = Math.floor(num);
        if (num >= 1000 || num * (-1) >= 1000) {
            return '' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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

        var value = yyyy + '-' + mm + '-' + dd;

        this.DateByValue[ID] = value;
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
        var Date = this.state.Request.Date;

        var year = Date.getFullYear();
        var month = this.pad(Date.getMonth() + 1, 2);
        var day = this.pad(Date.getDate(), 2);

        var data = {
            year: year,
            month: month,
            day: day
        };

        this.props.OnExecute_Bacarat(this.Action, data);
    }
}

export default Bacarat_GameLog;
