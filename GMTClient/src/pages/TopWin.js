import React, { Component } from 'react';
import '../css/App.css';
import ReactTable from 'react-table'
import 'react-table/react-table.css'

import {Table, Label, Button, ButtonToolbar, DropdownButton, MenuItem, Glyphicon, Dropdown} from 'react-bootstrap';
import Datetime from 'react-datetime'
import Pagination from "react-js-pagination";

class TopWin extends Component {
    constructor(props) {
        super(props);
        this.Action = this.props.Action;

        var nowfrom = new Date();
        var nowto = new Date();

        nowfrom.setHours(0);
        nowfrom.setMinutes(0);

        nowto.setHours(23);
        nowto.setMinutes(59);

        this.Pagination = {
            TopWin: {
                activePage: 1,
            },
            TopLose: {
                activePage: 1
            },
            ItemPerPage: 50,
            pageRangeDisplayed: 5

        };

        this.state = {
            Responsed: false,
            Data: {
                TopWinFinal: [],
                TopLoseFinal: [],
                SummaryData: {
                    UserWinCount: 0,
                    UserLoseCount: 0,
                    UserWinSum: 0,
                    UserLoseSum: 0,
                    Diff: 0
                }
            },
            Request: {
                DateFrom: nowfrom,
                DateTo: nowto,
                Top: 500
            },
            Display: {
                TopWinFinalTable: true,
                TopLoseFinalTable: true
            }
        };

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

        this.OnExecute();
    }

    CalculateSummaryData(Data) {
        //var SummaryData = {
        //    UserWinCount: 0,
        //    UserLoseCount: 0,
        //    UserWinSum: 0,
        //    UserLoseSum: 0,
        //    Diff: 0
        //};

        var SummaryData = Data.SummaryData;

        //SummaryData.UserWinCount = Data.TopWinFinal.length;
        //for(var i = 0; i < Data.TopWinFinal.length; i++){
        //    SummaryData.UserWinSum+= Data.TopWinFinal[i].MoneyWin;
        //}
        //
        //SummaryData.UserLoseCount = Data.TopLoseFinal.length;
        //for(var i = 0; i < Data.TopLoseFinal.length; i++){
        //    SummaryData.UserLoseSum+= Data.TopLoseFinal[i].MoneyWin;
        //}

        SummaryData.Diff = this.FormatNumber(SummaryData.UserWinSum + SummaryData.UserLoseSum);
        SummaryData.UserWinSum = this.FormatNumber(SummaryData.UserWinSum);
        SummaryData.UserLoseSum = this.FormatNumber(SummaryData.UserLoseSum);

        return SummaryData;
    }

    OnUpdateState(Data) {
        Data.SummaryData = this.CalculateSummaryData(Data);
        this.state.Data = Data;
        this.setState(this.state);
    }

    handleToggleTable(e) {
        var id = e.target.id;
        var currState = this.state;
        var text = "Ẩn";

        currState.Display[id] = !currState.Display[id];

        if (currState.Display[id] == false) {
            text = "Hiện";
        }

        document.getElementById(e.target.id).innerHTML = text;

        this.setState(currState);
    }

    handlePageChange(ID, pageNumber) {
        this.Pagination[ID].activePage = pageNumber;
        this.setState(this.state);
    }

    OnChange(event) {
        var ID = event.target.id;
        var value = event.target.value;

        this.UpdateRequest(ID, value);
    }

    HandleChangeTop(event, ID) {
        var Value = event.target.value;
        this.state.Request[ID] = Value;
        this.setState(this.state);
    }

    RenderPagination(ID) {
        //TopWinFinal
        var TableName = ID + "Final";
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

    render() {

        var topWin_from = (this.Pagination.TopWin.activePage - 1) * this.Pagination.ItemPerPage;
        var topLose_from = (this.Pagination.TopLose.activePage - 1) * this.Pagination.ItemPerPage;
        var topWin_to = (this.Pagination.TopWin.activePage) * this.Pagination.ItemPerPage;
        var topLose_to = (this.Pagination.TopLose.activePage) * this.Pagination.ItemPerPage;

        var TopWin_Pagination = this.RenderPagination("TopWin");
        var TopLose_Pagination = this.RenderPagination("TopLose");

        return (
            <div>
                <div className="layout">
                    <div className="row">
                        <div className="col-sm-2">
                            <label className="paddingTop5">Thời gian: </label>
                        </div>


                        <div className="col-sm-2">
                            <Datetime onChange={(e) => this.OnDayChange(e, "DateFrom")} id="dateFrom"
                                      viewDate={this.state.Request.DateFrom}
                                      value={this.state.Request.DateFrom}/>
                        </div>

                        <div className="col-sm-2">
                            <Datetime onChange={(e) => this.OnDayChange(e, "DateTo")} id="dateTo"
                                      viewDate={this.state.Request.DateTo}
                                      value={this.state.Request.DateTo}/>
                        </div>

                    </div>
                    <br></br>
                    <div className="row">
                        <div className="col-sm-2">
                            <label className="paddingTop3"> Lấy top: </label>
                        </div>

                        <div className="col-sm-2">
                            <select className="form-control" value={this.state.Request.Top} onChange={(e) => this.HandleChangeTop(e, "Top")} id="Top">
                                <option value="10">10</option>
                                <option value="100">100</option>
                                <option value="200">200</option>
                                <option value="300">300</option>
                                <option value="500">500</option>
                                <option value="1000">1000</option>
                            </select>
                        </div>

                        <Button className="col-sm-1" onClick={this.OnExecute.bind(this)}>
                            Xem </Button>
                    </div>

                    <div>
                        <div>
                            <br></br>
                            <Label>Tổng kết:</Label>
                            <br></br>

                            <div className="row">
                                <label className="paddingLeft10">Số user
                                    thắng: {this.state.Data.SummaryData.UserWinCount}</label>
                            </div>

                            <div className="row">
                                <label className="paddingLeft10">Tổng tiền
                                    thắng: {this.state.Data.SummaryData.UserWinSum}</label>
                            </div>

                            <div className="row">
                                <label className="paddingLeft10">Số user
                                    thua: {this.state.Data.SummaryData.UserLoseCount}</label>
                            </div>

                            <div className="row">
                                <label className="paddingLeft10">Tổng tiền
                                    thua: {this.state.Data.SummaryData.UserLoseSum}</label>
                            </div>

                            <div className="row">
                                <label className="paddingLeft10">Tổng tiền chênh
                                    lệch: {this.state.Data.SummaryData.Diff}</label>
                            </div>
                        </div>

                        <br></br>
                        <Button id="TopWinFinalTable" onClick={this.handleToggleTable.bind(this)}>Ẩn </Button>
                        <Label>Top thắng lớn: </Label>
                        <br></br>

                        {this.state.Display.TopWinFinalTable ?
                            <div className="box-body table-striped">
                                <Table striped bordered condensed hover>
                                    <thead>
                                    <tr>
                                        <th>STT</th>
                                        <th>UserID</th>
                                        <th>Nick</th>
                                        <th>Tiền Thắng</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {
                                        this.state.Data.TopWinFinal.map(function (User, index) {
                                            if (index >= topWin_from && index < topWin_to) {
                                                var MoneyWin = this.FormatNumber(User.MoneyWin);
                                                return <tr key={index}>
                                                    <td>{index + 1}</td>
                                                    <td>{User.UserID}</td>
                                                    <td>{User.Nick}</td>
                                                    <td>{MoneyWin}</td>
                                                </tr>
                                            }
                                        }.bind(this))
                                    }
                                    </tbody>
                                </Table>
                                {TopWin_Pagination}
                            </div>
                            : null
                        }

                        <br></br>
                        <Button id="TopLoseFinalTable" onClick={this.handleToggleTable.bind(this)}>Ẩn </Button>
                        <Label>Top thua lớn:</Label>
                        <br></br>

                        {this.state.Display.TopLoseFinalTable ?
                            <div className="box-body table-striped">
                                <Table striped bordered condensed hover>
                                    <thead>
                                    <tr>
                                        <th>STT</th>
                                        <th>UserID</th>
                                        <th>Nick</th>
                                        <th>Tiền Thua</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {
                                        this.state.Data.TopLoseFinal.map(function (User, index) {
                                            if (index >= topLose_from && index < topLose_to) {
                                                var MoneyWin = this.FormatNumber(User.MoneyWin);
                                                return <tr key={index}>
                                                    <td>{index + 1}</td>
                                                    <td>{User.UserID}</td>
                                                    <td>{User.Nick}</td>
                                                    <td>{MoneyWin}</td>
                                                </tr>
                                            }
                                        }.bind(this))
                                    }
                                    </tbody>
                                </Table>
                                {TopLose_Pagination}
                            </div>
                            : null
                        }

                    </div>
                </div>
            </div>
        );
    }

    FormatNumber(num) {
        if (num >= 1000 || num * (-1) >= 1000) {
            return '' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        } else {
            return '' + num;
        }
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
        this.state.Request[ID] = value;
        this.setState(this.state);
    }

    OnExecute() {
        // format: dd/mm/yyyy
        var DateFrom = this.DateByValue.DateFrom;
        var DateTo = this.DateByValue.DateTo;
        var Top = this.state.Request.Top;

        var data = {
            DateFrom: DateFrom,
            DateTo: DateTo,
            Top: Top
        };

        this.props.OnExecute(this.Action, data);
    }
}

export default TopWin;
