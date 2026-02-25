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

class Bacarat_UserHistory extends Component {
    constructor(props) {
        super(props);
        this.Action = "userHistoryByUserID";
        var now = new Date();

        this.state = {
            Responsed: false,
            Data: {
                UserHistory: []
            },
            ChartData: {},
            Request: {
                Date: now,
                RequestInfo: '',
                Filter: 0
            }
        };

        this.Pagination = {
            UserHistory: {
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

        //this.OnExecute();
    }

    OnUpdateState(Response) {
        console.log("OnUpdateState", Response);
        this.state.Data.UserHistory = Response.Data;
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

                <div className="col-sm-2">
                    <Label>UserID:</Label>
                </div>
            </div>

            <div className="row">
                <div className="col-sm-2">
                    <Datetime onChange={(e) => this.OnDayChange(e, "Date")} id="dateFrom"
                              viewDate={this.state.Request.Date}
                              value={this.state.Request.Date}
                              timeFormat={false}/>
                </div>

                <div className="col-sm-2">
                    <input id="RequestInfo"
                           className="form-control"
                           value={this.state.Request.RequestInfo}
                           onChange={(e) => this.OnChangeRequest(e, "RequestInfo")}
                        ></input>
                </div>

                <div className="col-sm-1">
                    <Button onClick={this.OnExecute.bind(this)}> Xem </Button>
                </div>
            </div>
        </div>
    }

    RenderLogTable() {
        var ResultPagination = this.RenderPagination("UserHistory");
        var ResultFrom = (this.Pagination.UserHistory.activePage - 1) * this.Pagination.ItemPerPage;
        var ResultTo = (this.Pagination.UserHistory.activePage) * this.Pagination.ItemPerPage;

        var BetLogTable = <div>
            <h2><Label>Danh sách Log: </Label></h2>
            {ResultPagination}
            <div className="box-body table-striped">
                <Table striped bordered condensed hover>
                    <thead>
                    <tr>
                        <th>STT</th>
                        <th>UserID</th>
                        <th>Tổng cược</th>
                        <th>Tổng thắng</th>
                        <th>Thời gian</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        this.state.Data.UserHistory.map(function (Element, index) {
                            if (index >= ResultFrom && index < ResultTo) {
                                return <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{Element.userID}</td>
                                    <td>{this.FormatNumber(Element.totalBet)}</td>
                                    <td>{this.FormatNumber(Element.totalWin)}</td>
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
                    <h1><Label>Log User Bacarat: </Label></h1>
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
        var userid = this.state.Request.RequestInfo;

        var data = {
            year: year,
            month: month,
            day: day,
            userID: userid
        };

        this.props.OnExecute_Bacarat(this.Action, data);
    }
}

export default Bacarat_UserHistory;
