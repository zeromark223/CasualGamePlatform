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

class TX_Info extends Component {
    constructor(props) {
        super(props);
        this.Action = this.props.Action;
        var now = new Date();

        this.state = {
            Responsed: false,
            Data: {
                BetLogWithWin: []
            },
            ChartData: {},
            Request: {
                Date: now,
                RequestInfo: '',
                Filter: 0
            }
        };

        this.Pagination = {
            BetLogWithWin: {
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

    OnUpdateState(Data) {
        var PacketID = this.props.PacketID;

        if (PacketID == this.Action) {
            this.state.Data = Data;
            this.setState(this.state);
        }
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

    RenderSummaryInfo() {
        var TotalBetCount = this.state.Data.BetLogWithWin.length;
        var TotalBetGold = 0;
        var TotalWinGold = 0;
        var TotalWinGoldWithTax = 0;

        for (var i = 0; i < this.state.Data.BetLogWithWin.length; i++) {
            TotalBetGold += this.state.Data.BetLogWithWin[i].BetGold;
            TotalWinGold += this.state.Data.BetLogWithWin[i].WinGold;
            TotalWinGoldWithTax += this.state.Data.BetLogWithWin[i].WinGoldWithTax;
        }

        return <div>
            <h2><Label>Thông tin tổng hợp: </Label></h2>

        </div>
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

    RenderBetLog() {
        var ResultPagination = this.RenderPagination("BetLogWithWin");
        var ResultFrom = (this.Pagination.BetLogWithWin.activePage - 1) * this.Pagination.ItemPerPage;
        var ResultTo = (this.Pagination.BetLogWithWin.activePage) * this.Pagination.ItemPerPage;


        var BetLogTable = <div>
            <h2><Label>Danh sách cược: </Label></h2>
            {ResultPagination}
            <div className="box-body table-striped">
                <Table striped bordered condensed hover>
                    <thead>
                    <tr>
                        <th>STT</th>
                        <th>MatchID</th>
                        <th>UserID</th>
                        <th>Cửa cược</th>
                        <th>Tiền cược</th>
                        <th>Tiền thắng</th>
                        <th>Tiền thắng (ko thuế)</th>
                        <th>Thuế (%)</th>
                        <th>Thời gian</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        this.state.Data.BetLogWithWin.map(function (Element, index) {
                            if (index >= ResultFrom && index < ResultTo) {
                                return <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{Element.MatchID}</td>
                                    <td>{Element.UserID}</td>
                                    <td>{Element.BetID}</td>
                                    <td>{Element.BetGold}</td>
                                    <td>{Element.WinGold}</td>
                                    <td>{Element.WinGoldWithTax}</td>
                                    <td>{Element.Tax}</td>
                                    <td>{Element.CreateDate}</td>
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
        var RenderBetLog = this.RenderBetLog();
        //var SummaryInfo = this.RenderSummaryInfo();
        //var JackpotWin = this.RenderJackpotWin();
        //var JackpotsValue = this.RenderJackpotsValue();
        return (
            <div>
                <div>
                    <h1><Label>Thông tin Tài xỉu: </Label></h1>
                    {RequestTable}
                    <br></br>
                    <br></br>
                    {RenderBetLog}
                    <br></br>
                    <br></br>


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

    FormatNumber(num) {
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
        var Date = this.DateByValue.Date;
        var RequestInfo = this.state.Request.RequestInfo;
        var Filter = this.state.Request.Filter;


        var data = {
            Date: Date,
            RequestInfo: RequestInfo,
            Filter: Filter
        };

        this.props.OnExecute(this.Action, data);
    }

    OnChangeOption(value) {
        this.state.Request.RequestOption = value;
        this.setState(this.state);
    }
}

export default TX_Info;
