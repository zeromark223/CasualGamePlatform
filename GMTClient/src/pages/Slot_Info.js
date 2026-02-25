import React, { Component } from 'react';
import '../css/App.css';
import ReactTable from 'react-table'
import 'react-table/react-table.css'
import Chart from 'chart.js';

import {Table, Label, Button, ButtonToolbar, DropdownButton, MenuItem, Glyphicon, Dropdown} from 'react-bootstrap';
import Datetime from 'react-datetime'

var LineChart = require("react-chartjs").Line;
var PacketConfig = require('../Config/PacketConfig');

class Slot_Info extends Component {
    constructor(props) {
        super(props);
        this.Action = this.props.Action;
        var now = new Date();

        this.state = {
            Responsed: false,
            Data: {
                Summary: [],
                JackpotWin: [],
                JackpotValueArray: [],
                JackpotRatio: {},
                DiffMoney: 0,
                SlotNameArr: []
            },
            ChartData: {},
            Request: {
                Date: now,
                RequestInfo: '',
                RequestOption: 0
            },
            Filter: 0
        };

        var yyyy = now.getFullYear();
        var mm = this.pad(now.getMonth() + 1, 2);
        var dd = this.pad(now.getDate(), 2);

        var valuefrom = yyyy + '-' + mm + '-' + dd;


        this.DateByValue = {
            Date: valuefrom,
        };

        this.FirstFilter = true;

        this.OnExecute();
    }

    OnUpdateState(Data) {
        var PacketID = this.props.PacketID;

        if(PacketID == this.Action) {

            this.state.Data = Data;

            if(this.FirstFilter) {
                this.state.Filter = this.state.Data.SlotNameArr[0].KindID;
                this.FirstFilter = false;
            }

            this.setState(this.state);
        }
    }

    CalculateRealDiffMoney() {
        var TotalBet = 0;
        var MoneyForJackpot = 0;

        for (var i = 0; i < this.state.Data.Summary.length; i++) {
            TotalBet += this.state.Data.Summary[i].TotalBet;
        }

        MoneyForJackpot = TotalBet * (this.state.Data.JackpotRatio.Jackpot + this.state.Data.JackpotRatio.PiggyBank)

        var Result = (-this.state.Data.DiffMoney - MoneyForJackpot) || 0;
        return Result;
    }

    HandleChangeFilter(event, ID) {
        var Value = event.target.value;
        this.state[ID] = Value;

        this.setState(this.state);
    }

    RenderRequestTable() {
        return <div>
            <div className="col-sm-1">
                <label className="paddingTop3"> Ngày: </label>
            </div>

            <div className="col-sm-2">
                <Datetime onChange={(e) => this.OnDayChange(e, "Date")} id="dateFrom"
                          viewDate={this.state.Request.Date}
                          value={this.state.Request.Date}
                          timeFormat={false}/>
            </div>

            <div className="col-sm-1">
                <Button onClick={this.OnExecute.bind(this)}> Xem </Button>
            </div>

            <div className="col-sm-2">
                {
                    <select className="form-control" defaultValue={this.state.Filter} onChange={(e) => this.HandleChangeFilter(e, "Filter")} id="Filter">
                        {
                            this.state.Data.SlotNameArr.map(function (Element, index) {
                                return <option
                                    key={index}
                                    value={Element.KindID}
                                    >{Element.Name}</option>
                            }.bind(this))
                        }
                    </select>
                }
            </div>
        </div>
    }

    RenderSummaryInfo() {
        var Sum_BetCount = 0;
        var Sum_TotalBet = 0;
        var Sum_TotalWin = 0;
        var Sum_Jackpot = 0;
        var Sum_MoneyToJackpot = 0;
        var Sum_MoneyToPiggyBank = 0;
        var Sum_Bonus = 0;
        var Sum_FreeWin = 0;
        var Sum_FreeBetCount = 0;
        var Sum_FreeBet = 0;


        return <div>
            <h4><Label>Thông tin tổng hợp: </Label></h4>

            <div className="box-body table-striped">
                <Table striped bordered condensed hover>
                    <thead>
                    <tr>
                        <th>Mức cược</th>
                        <th>Số phiên</th>
                        <th>Tổng tiền cược</th>
                        <th>Tổng tiền thắng</th>
                        <th>Nổ Jackpot</th>
                        <th>Tiền vào Jackpot</th>
                        <th>Tiền vào Quỹ</th>
                        <th>Triệt tiêu (Không Jackpot)</th>
                        <th>Triệt tiêu (Jackpot)</th>
                        <th>Tổng tiền Free Bet</th>
                        <th>Số lần Free Bet</th>
                        <th>Tổng thắng Free Bet</th>
                        <th>Bonus</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        console.log("Qui test", this.state.Data.Summary)
                    }
                    {
                        this.state.Data.Summary.map(function (Element, index) {

                            if (Element.KindID == this.state.Filter) {
                                var MoneyToJackpot = Element.TotalBet * this.state.Data.JackpotRatio.Jackpot;
                                var MoneyToPiggyBank = Element.TotalBet * this.state.Data.JackpotRatio.PiggyBank;
                                var DiffMoney_WithoutJP = Element.TotalBet - Element.TotalWin - Element.Bonus - Element.FreeWin;// - Element.Jackpot;
                                var DiffMoney = Element.TotalBet - Element.TotalWin - Element.Bonus - Element.FreeWin - MoneyToJackpot - MoneyToPiggyBank;// - Element.Jackpot;

                                Sum_BetCount += Element.BetCount;
                                Sum_TotalBet += Element.TotalBet;
                                Sum_TotalWin += Element.TotalWin;
                                Sum_Jackpot += Element.Jackpot;
                                Sum_MoneyToJackpot += MoneyToJackpot;
                                Sum_MoneyToPiggyBank += MoneyToPiggyBank;

                                Sum_FreeBet += Element.FreeBet;
                                Sum_Bonus += Element.Bonus;
                                Sum_FreeWin += Element.FreeWin;
                                Sum_FreeBetCount += Element.FreeBetCount;

                                return <tr key={index}>
                                    <td>{Element.BetID}</td>
                                    <td>{this.FormatNumber(Element.BetCount)}</td>
                                    <td>{this.FormatNumber(Element.TotalBet)}</td>
                                    <td>{this.FormatNumber(Element.TotalWin)}</td>
                                    <td>{this.FormatNumber(Element.Jackpot)}</td>
                                    <td>{this.FormatNumber(MoneyToJackpot)}</td>
                                    <td>{this.FormatNumber(MoneyToPiggyBank)}</td>
                                    <td>{this.FormatNumber(DiffMoney_WithoutJP)}</td>
                                    <td>{this.FormatNumber(DiffMoney)}</td>
                                    <td>{this.FormatNumber(Element.FreeBet)}</td>
                                    <td>{this.FormatNumber(Element.FreeBetCount)}</td>
                                    <td>{this.FormatNumber(Element.FreeWin)}</td>
                                    <td>{this.FormatNumber(Element.Bonus)}</td>
                                </tr>
                            }
                        }.bind(this))
                    }
                    

                    <tr>
                        <td></td>
                    </tr>
                    <tr>
                        <td style={{fontWeight: "bold"}}>Tổng</td>
                        <td>{this.FormatNumber(Sum_BetCount)}</td>
                        <td>{this.FormatNumber(Sum_TotalBet)}</td>
                        <td>{this.FormatNumber(Sum_TotalWin)}</td>
                        <td>{this.FormatNumber(Sum_Jackpot)}</td>
                        <td>{this.FormatNumber(Sum_MoneyToJackpot)}</td>
                        <td>{this.FormatNumber(Sum_MoneyToPiggyBank)}</td>
                        <td>{this.FormatNumber(Sum_TotalBet - Sum_TotalWin - Sum_Bonus - Sum_FreeWin)}</td>
                        <td>{this.FormatNumber(Sum_TotalBet - Sum_TotalWin - Sum_Bonus - Sum_FreeWin - Sum_MoneyToJackpot - Sum_MoneyToPiggyBank)}</td>
                        <td>{this.FormatNumber(Sum_FreeBet)}</td>
                        <td>{this.FormatNumber(Sum_FreeBetCount)}</td>
                        <td>{this.FormatNumber(Sum_FreeWin)}</td>
                        <td>{this.FormatNumber(Sum_Bonus)}</td>
                    </tr>
                    </tbody>
                </Table>

                <div>
                    Tỷ lệ triệt tiêu: {((Sum_TotalBet - Sum_TotalWin) / Sum_TotalBet) || 0}
                </div>

                <div>
                    Tỷ lệ triệt tiêu
                    (Jackpot): {((Sum_TotalBet - Sum_TotalWin - Sum_MoneyToJackpot - Sum_MoneyToPiggyBank) / Sum_TotalBet) || 0}
                </div>
            </div>
        </div>
    }

    RenderJackpotWin() {
        return <div>
            <h4><Label>Danh sách thắng Jackpot: </Label></h4>

            <div className="box-body table-striped">
                <Table striped bordered condensed hover>
                    <thead>
                    <tr>
                        <th>UserID</th>
                        <th>Nick</th>
                        <th>Mức cược</th>
                        <th>Tiền Jackpot</th>
                        <th>Mã ván</th>
                        <th>Thời gian</th>
                        <th>Giá trị Jackpot mặc định</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        this.state.Data.JackpotWin.map(function (Element, index) {
                            if(Element.KindID == this.state.Filter) {
                                return <tr key={index}>
                                    <td>{(Element.UserID)}</td>
                                    <td>{(Element.GameName)}</td>
                                    <td>{Element.BetID}</td>
                                    <td>{this.FormatNumber(Element.JackpotValue)}</td>
                                    <td>{(Element.MatchID)}</td>
                                    <td>{this.FormatDateTime(Element.CreateDate)}</td>
                                    <td>{this.FormatNumber(Element.DefaultValue)}</td>
                                </tr>
                            }
                        }.bind(this))
                    }
                    </tbody>
                </Table>
            </div>
        </div>
    }

    RenderJackpotsValue() {
        var Sum_JackpotValue = 0;
        var Sum_DefaultValue = 0;
        var Sum_JackpotSave = 0;
        return <div>
            <h4><Label>Giá trị Jackpot hiện tại: </Label></h4>

            <div className="box-body table-striped">
                <Table striped bordered condensed hover>
                    <thead>
                    <tr>
                        <th>Jackpot</th>
                        <th>Tiền</th>
                        <th>Giá trị mặc định</th>
                        <th>Giá trị thực</th>
                        <th>Quỹ</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        this.state.Data.JackpotValueArray.map(function (Element, index) {
                            if(Element.KindID == this.state.Filter) {
                                Sum_JackpotValue += parseInt(Element.Value);
                                Sum_DefaultValue += Element.DefaultValue;
                                Sum_JackpotSave += Element.JackpotSave;
                                return <tr key={index}>
                                    <td>{(Element.Key)}</td>
                                    <td>{this.FormatNumber(Element.Value)}</td>
                                    <td>{this.FormatNumber(Element.DefaultValue)}</td>
                                    <td>{this.FormatNumber(Element.Value - Element.DefaultValue)}</td>
                                    <td>{this.FormatNumber(Element.JackpotSave)}</td>
                                </tr>
                            }
                        }.bind(this))
                    }

                    <tr>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>

                    <tr>
                        <td style={{fontWeight: "bold"}}>Tổng</td>
                        <td>{this.FormatNumber(Sum_JackpotValue)}</td>
                        <td>{this.FormatNumber(Sum_DefaultValue)}</td>
                        <td>{this.FormatNumber(Sum_JackpotValue - Sum_DefaultValue)}</td>
                        <td>{this.FormatNumber(Sum_JackpotSave)}</td>
                    </tr>
                    </tbody>
                </Table>
            </div>
        </div>
    }

    render() {
        var RequestTable = this.RenderRequestTable();
        var SummaryInfo = this.RenderSummaryInfo();
        var JackpotWin = this.RenderJackpotWin();
        var JackpotsValue = this.RenderJackpotsValue();
        return (
            <div>
                <div>
                    <h1><Label>Thông tin Slot: </Label></h1>

                    <br></br>
                    {RequestTable}
                    <br></br>
                    <br></br>
                    {SummaryInfo}
                    <br></br>
                    {JackpotWin}
                    <br></br>
                    {JackpotsValue}


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


        var data = {
            Date: Date
        };

        this.props.OnExecute(this.Action, data);
    }

    OnChangeOption(value) {
        this.state.Request.RequestOption = value;
        this.setState(this.state);
    }
}

export default Slot_Info;
