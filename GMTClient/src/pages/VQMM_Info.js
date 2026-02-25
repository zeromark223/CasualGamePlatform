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

class VQMM_Info extends Component {
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
                Filter: 0,
                Add_UserID: '',
                Add_FreeTicket: 0,
                Add_DailyTicket: 0,
                Add_Notice: ""
            },
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

        if(PacketID == PacketConfig.VQMM_AddFreeTicket){
            var notice = "User " + Data.UserID + " hiện có " + Data.DailyData + " lượt quay hằng ngày và " + Data.FreeData + " lượt quay free!!!";

            this.state.Request.Add_UserID = "";
            this.state.Request.Add_FreeTicket = 0;
            this.state.Request.Add_DailyTicket = 0;

            this.OnSetNotice(notice);
            //setTimeout(function(){
            //    this.state.Request.Add_Notice = "";
            //    this.setState(this.state);
            //}.bind(this), 3000)
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

    RenderAddFreeTicket(){
        return <div>
            <h1><Label bsStyle="success">Thêm lượt quay: </Label></h1>
            <div className="row">
                <div className="col-sm-2">
                    <Label>UserID:</Label>
                </div>

                <div className="col-sm-2">
                    <Label>Lượt quay hằng ngày:</Label>
                </div>

                <div className="col-sm-2">
                    <Label>Lượt quay free:</Label>
                </div>

                <div className="col-sm-2">

                </div>
            </div>

            <div className="row">
                <div className="col-sm-2">
                    <input id="RequestInfo"
                           className="form-control"
                           value={this.state.Request.Add_UserID}
                           onChange={(e) => this.OnChangeRequest(e, "Add_UserID")}
                        ></input>
                </div>

                <div className="col-sm-2">
                    <input id="RequestInfo"
                           className="form-control"
                           type="number"
                           min="0"
                           value={this.state.Request.Add_DailyTicket}
                           onChange={(e) => this.OnChangeRequest(e, "Add_DailyTicket")}
                        ></input>
                </div>

                <div className="col-sm-2">
                    <input id="RequestInfo"
                           className="form-control"
                           type="number"
                           min="0"
                           value={this.state.Request.Add_FreeTicket}
                           onChange={(e) => this.OnChangeRequest(e, "Add_FreeTicket")}
                        ></input>
                </div>

                <div className="col-sm-1">
                    <Button onClick={this.OnAddFreeTicket.bind(this)}> Thêm </Button>
                </div>
            </div>

            <Label bsStyle="danger">{this.state.Request.Add_Notice}</Label>
        </div>
    }

    RenderBetLog() {
        var ResultPagination = this.RenderPagination("BetLogWithWin");
        var ResultFrom = (this.Pagination.BetLogWithWin.activePage - 1) * this.Pagination.ItemPerPage;
        var ResultTo = (this.Pagination.BetLogWithWin.activePage) * this.Pagination.ItemPerPage;

        /*
         UserID: 2533,
         BetGold: 2000,
         Result: '7,3',
         CurrentStock: 1,
         Tax: 0,
         BeforeMoney: 0,
         TotalReward: 20000,
         AfterMoney: 20000,
         MatchID: 7,
         CreateDate: 2019-02-27T09:08:38.000Z,
         BeforeFreeSpin: 32,
         AfterFreeSpin: 37,
         KindID: 10001,
         RoomID: 162019,
         */

        var BetLogTable = <div>
            <h2><Label bsStyle="info">Danh sách ván: </Label></h2>
            {ResultPagination}
            <div className="box-body table-striped">
                <Table striped bordered condensed hover>
                    <thead>
                    <tr>
                        <th>STT</th>
                        <th>MatchID</th>
                        <th>UserID</th>
                        <th>Kết quả</th>
                        <th>Stock</th>
                        <th>Tiền cược</th>
                        <th>Tiền trước</th>
                        <th>Tổng thưởng</th>
                        <th>Tiền sau</th>
                        <th>FreeSpin trước</th>
                        <th>FreeSpin sau</th>
                        <th>Thuế</th>
                        <th>Loại</th>
                        <th>KindID</th>
                        <th>RoomID</th>
                        <th>ChannelID</th>
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
                                    <td>{Element.Result}</td>
                                    <td>{Element.CurrentStock}</td>
                                    <td>{Element.BetGold}</td>
                                    <td>{Element.BeforeMoney}</td>
                                    <td>{Element.TotalReward}</td>
                                    <td>{Element.AfterMoney}</td>
                                    <td>{Element.BeforeFreeSpin}</td>
                                    <td>{Element.AfterFreeSpin}</td>
                                    <td>{Element.Tax}</td>
                                    <td>{Element.SpinKind}</td>
                                    <td>{Element.KindID}</td>
                                    <td>{Element.RoomID}</td>
                                    <td>{Element.ChannelID}</td>
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
        var RenderAddFreeTicket = this.RenderAddFreeTicket();
        //var SummaryInfo = this.RenderSummaryInfo();
        //var JackpotWin = this.RenderJackpotWin();
        //var JackpotsValue = this.RenderJackpotsValue();
        return (
            <div>
                <div>
                    {RenderAddFreeTicket}
                    <h1><Label bsStyle="warning">Thông tin VQMM: </Label></h1>
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
        this.state.Request.Add_Notice = "";

        this.props.OnExecute(this.Action, data);
    }

    OnChangeOption(value) {
        this.state.Request.RequestOption = value;
        this.setState(this.state);
    }

    OnSetNotice(message){
        this.state.Request.Add_Notice = message;
        this.setState(this.state);
    }

    OnAddFreeTicket(){
        var UserID = this.state.Request.Add_UserID;
        var DailyTicket = this.state.Request.Add_DailyTicket;
        var FreeTicket = this.state.Request.Add_FreeTicket;
        var Action = PacketConfig.VQMM_AddFreeTicket;

        var data = {
            UserID: UserID,
            DailyTicket: DailyTicket,
            FreeTicket: FreeTicket
        };

        if(UserID == "" || (DailyTicket == 0 && FreeTicket == 0)){
            this.OnSetNotice("Sai thông tin!!!");
            return;
        }

        this.props.OnExecute(Action, data);
    }
}

export default VQMM_Info;
