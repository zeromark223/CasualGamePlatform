import React, { Component } from 'react';
import '../css/App.css';
import ReactTable from 'react-table'
import 'react-table/react-table.css'
//import Chart from 'chart.js';
import {Table, Label, Button, ButtonToolbar, DropdownButton, MenuItem, Glyphicon, Dropdown, OverlayTrigger, Tooltip, Popover} from 'react-bootstrap';
import Datetime from 'react-datetime';
import Clipboard from 'react-clipboard.js';

var LineChart = require("react-chartjs").Line;

class TotalSystemGold extends Component {
    constructor(props) {
        super(props);
        this.Action = this.props.Action;

        var now = new Date();
        var timeFrom = new Date(2018, 1, 1, 0, 0, 0, 0);
        var timeTo = new Date(2018, 1, 1, 23, 59, 59, 0);

        this.state = {
            Responsed: false,
            Data: [],
            //ChartData: {},
            DateRequest: {
                DateFrom: now,
                DateTo: now,
                TimeFrom: timeFrom,
                TimeTo: timeTo
            },
            GameNameConfig: [],
            GameIDFilter: 1,
            SlotFilter: 401,
            ChannelFilter: 0,
            ChannelName: []
        };

        var yyyy = now.getFullYear();
        var mm = this.pad(now.getMonth() + 1, 2);
        var dd = this.pad(now.getDate(), 2);
        var value = yyyy + '-' + mm + '-' + dd;

        this.DateByValue = {
            DateFrom: value,
            DateTo: value,
            TimeFrom: "00:00:00",
            TimeTo: "23:59:59"
        };

        this.ReportStatus = "";

        this.OnExecute();
    }

    CopyList() {
        var Result = "";
        var BreakLine = "\r\n";

        for (var i = 0; i < this.state.Data.length; i++) {
            var DateStatus = this.state.Data[i];

            var TX = {
                Win_Sum: 0,
                Lose_Sum: 0,
                Ratio: 0
            };

            var Slot = {
                Win_Sum: 0,
                Lose_Sum: 0,
                Ratio: 0
            };

            var BC = {
                Win_Sum: 0,
                Lose_Sum: 0,
                Ratio: 0
            };

            for (var j = 0; j < DateStatus.MoneyWinArray.length; j++) {
                var Win_Sum = DateStatus.MoneyWinArray[j].TotalMoneyWin;
                var GameID = DateStatus.MoneyWinArray[j].GameID;

                switch (GameID) {
                    case 1:
                        BC.Win_Sum += Win_Sum;
                        break;

                    case 2:
                        TX.Win_Sum += Win_Sum;
                        break;

                    case 4:
                        Slot.Win_Sum += Win_Sum;
                        break;
                    default:
                        break;
                }
            }

            for (var j = 0; j < DateStatus.MoneyLoseArray.length; j++) {
                var Lose_Sum = DateStatus.MoneyLoseArray[j].TotalMoneyLose;
                var GameID = DateStatus.MoneyLoseArray[j].GameID;

                switch (GameID) {
                    case 1:
                        BC.Lose_Sum += Lose_Sum;
                        break;

                    case 2:
                        TX.Lose_Sum += Lose_Sum;
                        break;

                    case 4:
                        Slot.Lose_Sum += Lose_Sum;
                        break;
                    default:
                        break;
                }
            }

            //Win_Sum = Tổng  thắng
            //Lose_Sum = Tổng thua
            var Win_Sum = this.FormatNumber(Math.abs(DateStatus.Win_Sum));
            var Lose_Sum = this.FormatNumber(Math.abs(DateStatus.Lose_Sum));
            var Ratio = Math.abs(DateStatus.Lose_Sum) > 0 ? Math.abs(DateStatus.Win_Sum / DateStatus.Lose_Sum) : 0;

            BC.Ratio = Math.abs(BC.Lose_Sum) > 0 ? Math.abs(BC.Win_Sum / BC.Lose_Sum) : 0;
            TX.Ratio = Math.abs(TX.Lose_Sum) > 0 ? Math.abs(TX.Win_Sum / TX.Lose_Sum) : 0;
            Slot.Ratio = Math.abs(Slot.Lose_Sum) > 0 ? Math.abs(Slot.Win_Sum / Slot.Lose_Sum) : 0;


            //Result += "Ngày\t" + DateStatus.Date + BreakLine;
            Result += "Tổng thua\t" + Lose_Sum + BreakLine;
            Result += "Tổng thắng\t" + Win_Sum + BreakLine;
            Result += "Tỷ lệ\t" + Ratio + BreakLine;

            Result += "Tổng thua TX\t" + this.FormatNumber(Math.abs(TX.Lose_Sum)) + BreakLine;
            Result += "Tổng thắng TX\t" + this.FormatNumber(Math.abs(TX.Win_Sum)) + BreakLine;
            Result += "Tỷ lệ TX\t" + TX.Ratio + BreakLine;

            Result += "Tổng thua Bắn cá\t" + this.FormatNumber(Math.abs(BC.Lose_Sum)) + BreakLine;
            Result += "Tổng thắng Bắn cá\t" + this.FormatNumber(Math.abs(BC.Win_Sum)) + BreakLine;
            Result += "Tỷ lệ Bắn cá\t" + BC.Ratio + BreakLine;

            Result += "Tổng thua Slot\t" + this.FormatNumber(Math.abs(Slot.Lose_Sum)) + BreakLine;
            Result += "Tổng thắng Slot\t" + this.FormatNumber(Math.abs(Slot.Win_Sum)) + BreakLine;
            Result += "Tỷ lệ Slot\t" + Slot.Ratio + BreakLine;
            Result += BreakLine;
            Result += BreakLine;


        }

        return Result;
    }

    OnCopySuccess() {
        //this.state.Popup.Status = "Đã Copy!";

        this.ReportStatus = "Đã Copy!";
        this.setState(this.state);

        setTimeout(function () {
            this.ReportStatus = "";
            this.setState(this.state);
        }.bind(this), 1000)
    }

    OnUpdateState(Data) {
        var currState = this.state;
        currState.Data = this.CalculateSum(Data.Result);
        currState.GameNameConfig = Data.GameNameConfig;
        currState.ChannelName = Data.ChannelName;
        this.setState(currState);

        this.SortGameNameConfig();
    }

    SortGameNameConfig() {
        var GameNameConfig = this.state.GameNameConfig;

        GameNameConfig.sort(function (a, b) {
            return a.GameID - b.GameID;
        }.bind(this));

        this.setState(this.state);
    }

    CalculateSum(Result) {
        for (var i = 0; i < Result.length; i++) {
            var Win_Sum = 0;
            var Lose_Sum = 0;

            //console.log("Result[i].MoneyWinArray.length", Result[i].MoneyWinArray.length);
            for (var j = 0; j < Result[i].MoneyWinArray.length; j++) {
                if (Result[i].MoneyWinArray[j].ChannelID == this.state.ChannelFilter || this.state.ChannelFilter == 0) {
                    Win_Sum += Result[i].MoneyWinArray[j].TotalMoneyWin;
                }
            }

            for (var j = 0; j < Result[i].MoneyLoseArray.length; j++) {
                if (Result[i].MoneyLoseArray[j].ChannelID == this.state.ChannelFilter || this.state.ChannelFilter == 0) {
                    Lose_Sum += Result[i].MoneyLoseArray[j].TotalMoneyLose;
                }
            }

            Result[i].SummaryBCInfo.FishCount = this.GetValueByChannelID(Result[i].SummaryBCInfo, "FishCount");
            Result[i].SummaryBCInfo.BulletCount = this.GetValueByChannelID(Result[i].SummaryBCInfo, "BulletCount");
            Result[i].SummaryBCInfo.PayMoney = this.GetValueByChannelID(Result[i].SummaryBCInfo, "PayMoney");
            Result[i].SummaryBCInfo.EarnMoney = this.GetValueByChannelID(Result[i].SummaryBCInfo, "EarnMoney");

            Result[i].Win_Sum = Win_Sum;
            Result[i].Lose_Sum = Lose_Sum;
        }

        return Result;
    }

    OnChangeGameIDFilter(value) {
        var currState = this.state;
        currState.GameIDFilter = value;

        this.setState(currState);
    }

    GetValueByChannelID(Object, Prop) {
        var Result = 0;

        for (var i = 0; i < Object.length; i++) {
            if (Object[i].ChannelID == this.state.ChannelFilter || this.state.ChannelFilter == 0) {
                Result += Object[i][Prop];
            }
        }

        return Result;
    }

    ParseMoneyTransfer(DateTransfer) {
        var Result = {
            ChargeInGame: 0, //100
            ChargeOutGame: 0 //101
        };

        for (var i = 0; i < DateTransfer.length; i++) {
            if (DateTransfer[i].ReasonID == 100) {
                Result.ChargeInGame += DateTransfer[i].SumMoneyTransfer;
            }

            if (DateTransfer[i].ReasonID == 101) {
                Result.ChargeOutGame += DateTransfer[i].SumMoneyTransfer;
            }
        }

        return Result;
    }

;

    RenderToolTip(OtherDescription) {

        return <div>
            <OverlayTrigger
                overlay={<Tooltip id="tooltip-disabled"><div className="newlist_summary">{OtherDescription}</div></Tooltip>}>
              <span className="d-inline-block">
                <p style={{ pointerEvents: 'none' }}>
                    Khác
                </p>
              </span>
            </OverlayTrigger>
        </div>
    }

    RenderToolTip1(OtherDescription) {
        var popover = (
            <Popover className="toolTip" id="popover-basic" title={<Label bsStyle="info">{"Bảng chi tiết"}</Label>}>
                <Table striped bordered condensed hover>
                    <thead>
                    <tr>
                        <th>Mô tả</th>
                        <th>Gold giao dịch</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        OtherDescription.map(function (Element, index) {
                            return <tr key={index}>
                                <td>{Element.Description}</td>
                                <td>{Element.Money}</td>
                            </tr>
                        }.bind(this))
                    }
                    </tbody>
                </Table>
            </Popover>
        );


        return <div>
            <OverlayTrigger className="myOverlay" trigger="click" placement="right" overlay={popover}>
                <Label bsStyle="success">Khác</Label>
            </OverlayTrigger>
        </div>
    }

    ParseMoneyTransferDetail(DateTransfer) {
        var Result = [
            {
                Description: 'Charge Card',
                SumMoneyTransfer: 0
            },
            {
                Description: 'Rewards',
                SumMoneyTransfer: 0
            },
            {
                Description: 'GiftCode',
                SumMoneyTransfer: 0
            }
        ];
        var OtherSum = 0;
        var OtherDescription = [];

        for (var i = 0; i < DateTransfer.length; i++) {
            if (DateTransfer[i].Description != 'Charge Card'
                && DateTransfer[i].Description != 'Rewards'
                && DateTransfer[i].Description != 'GiftCode') {
                OtherSum += DateTransfer[i].SumMoneyTransfer;
                //OtherDescription += DateTransfer[i].Description + ":" + this.FormatNumber(DateTransfer[i].SumMoneyTransfer) +"\r\n";

                OtherDescription.push({
                    Description: DateTransfer[i].Description,
                    Money: this.FormatNumber(DateTransfer[i].SumMoneyTransfer),
                    MoneyValue: (DateTransfer[i].SumMoneyTransfer)
                })
            }
            else {
                for (var j = 0; j < Result.length; j++) {
                    if (DateTransfer[i].Description == Result[j].Description) {
                        Result[j].SumMoneyTransfer += DateTransfer[i].SumMoneyTransfer;
                    }
                }
            }
        }

        OtherDescription.sort(function (a, b) {
            return +b.MoneyValue - +a.MoneyValue;
        });

        Result.push({
            Description: 'Khác',
            SumMoneyTransfer: OtherSum,
            OtherDescription: OtherDescription
        });

        return Result;
    }

    ParseMoneyTransferSum() {
        var Result = [
            {
                Description: 'Charge Card',
                SumMoneyTransfer: 0
            },
            {
                Description: 'Rewards',
                SumMoneyTransfer: 0
            },
            {
                Description: 'GiftCode',
                SumMoneyTransfer: 0
            }
        ];
        var OtherSum = 0;
        var OtherDescription = [];

        for (var i = 0; i < this.state.Data.length; i++) {
            //by day
            var TransferByDay = this.state.Data[i].SummaryTransfer
            for (var j = 0; j < TransferByDay.length; j++) {
                if (TransferByDay[j].Description != 'Charge Card'
                    && TransferByDay[j].Description != 'Rewards'
                    && TransferByDay[j].Description != 'GiftCode') {
                    OtherSum += TransferByDay[j].SumMoneyTransfer;
                    var found = 0;
                    for (var k = 0; k < OtherDescription.length; k++) {
                        if (OtherDescription[k].Description == TransferByDay[j].Description) {
                            OtherDescription[k].MoneyValue += TransferByDay[j].SumMoneyTransfer;
                            OtherDescription[k].Money = this.FormatNumber(OtherDescription[k].MoneyValue);

                            found = 1;
                        }
                    }

                    if (found == 0) {
                        OtherDescription.push({
                            Description: TransferByDay[j].Description,
                            Money: this.FormatNumber(TransferByDay[j].SumMoneyTransfer),
                            MoneyValue: (TransferByDay[j].SumMoneyTransfer)
                        })
                    }
                }
                else {
                    for (var k = 0; k < Result.length; k++) {
                        if (TransferByDay[j].Description == Result[k].Description) {
                            Result[k].SumMoneyTransfer += TransferByDay[j].SumMoneyTransfer;
                        }
                    }
                }
            }

        }

        OtherDescription.sort(function (a, b) {
            return +b.MoneyValue - +a.MoneyValue;
        });

        Result.push({
            Description: 'Khác',
            SumMoneyTransfer: OtherSum,
            OtherDescription: OtherDescription
        });

        return Result;
    }

    RenderTransferTable1(MoneyTransferData) {
        return <div>
            <h2><Label bsStyle="warning">Chi tiếp gold đổi nạp: </Label></h2>

            <div className="box-body table-striped">
                <Table striped bordered condensed hover>
                    <thead>
                    <tr>
                        <th>Tiền thay đổi</th>
                        <th>Mô tả</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        MoneyTransferData.map(function (data, index) {
                            var Desc = data.Description;
                            if (data.Description == "Khác") {
                                Desc = this.RenderToolTip1(data.OtherDescription);
                            }
                            return <tr key={index}>
                                <td>{this.FormatNumber(data.SumMoneyTransfer)}</td>
                                <td>{Desc}</td>
                            </tr>
                        }.bind(this))
                    }
                    </tbody>
                </Table>
            </div>
        </div>
    }

    RenderTransferTable() {
        return <div>
            <h2><Label bsStyle="warning">Chi tiếp gold đổi nạp: </Label></h2>

            <div className="box-body table-striped">
                <Table striped bordered condensed hover>
                    <thead>
                    <tr>
                        <th>Ngày</th>
                        <th>Tiền thay đổi</th>
                        <th>Mô tả</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        this.state.Data.map(function (DateStatus, index) {
                            var TransferDetail = this.ParseMoneyTransferDetail(DateStatus.SummaryTransfer);
                            return TransferDetail.map(function (Element, index1) {
                                var Desc = Element.Description;
                                if (Element.Description == "Khác") {
                                    Desc = this.RenderToolTip1(Element.OtherDescription, DateStatus.Date);
                                }
                                return <tr key={index1}>
                                    <td>{DateStatus.Date}</td>
                                    <td>{this.FormatNumber(Element.SumMoneyTransfer)}</td>
                                    <td>{Desc}</td>
                                </tr>
                            }.bind(this))
                        }.bind(this))
                    }
                    </tbody>
                </Table>
            </div>
        </div>
    }

    render() {
        var MoneyTransferData = this.ParseMoneyTransferSum();
        var SummaryTable = this.RenderSummaryTable();
        var DetailTransferTable = this.RenderTransferTable1(MoneyTransferData);

        return (
            <div>
                <div className="layout">
                    <h1><Label>Hệ thống lời lỗ: </Label></h1>

                    <Table>
                        <tbody>
                        <tr>
                            <td>
                                <div className="form-group">
                                    <label className="col-sm-1">Ngày: </label>

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
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="form-group">
                                    <label className="col-sm-1 control-label">Giờ: </label>

                                    <div className="col-sm-2">
                                        <Datetime onChange={(e) => this.OnTimeChange(e, "TimeFrom")} id="TimeFrom"
                                                  viewDate={this.state.DateRequest.TimeFrom}
                                                  value={this.state.DateRequest.TimeFrom} dateFormat={false}/>
                                    </div>

                                    <div className="col-sm-2">
                                        <Datetime onChange={(e) => this.OnTimeChange(e, "TimeTo")} id="TimeTo"
                                                  viewDate={this.state.DateRequest.TimeTo}
                                                  value={this.state.DateRequest.TimeTo} dateFormat={false}/>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="form-group">
                                    <label className="col-sm-1 control-label">Channel: </label>

                                    <div className="col-sm-2">
                                        <select className="form-control" defaultValue={this.state.Filter}
                                                onChange={(e) => this.HandleChangeFilter(e, "ChannelFilter")}
                                                id="Filter">
                                            {
                                                this.state.ChannelName.map(function (Element, index) {
                                                    return <option
                                                        key={index}
                                                        value={Element.ChannelID}
                                                        >{Element.Name}</option>
                                                }.bind(this))
                                            }
                                        </select>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="form-group">
                                    <div className="col-sm-1">
                                        <Button onClick={this.OnExecute.bind(this)}>
                                            Xem </Button>
                                    </div>
                                    <div className="col-sm-2">
                                        <Clipboard option-text={this.CopyList.bind(this)}
                                                   className="btn btn-primary"
                                                   button-title="I'm a tooltip"
                                                   onSuccess={this.OnCopySuccess.bind(this)}>
                                            Lấy số liệu báo cáo
                                        </Clipboard>
                                    </div>
                                    <div className="col-sm-1">
                                        <Label bsStyle="danger">{this.ReportStatus}</Label>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        </tbody>
                    </Table>


                    <br></br>

                    <div className="box-body table-striped">
                        <Table striped bordered condensed hover>
                            <thead>
                            <tr>
                                <th>Ngày</th>
                                <th>Tổng User Thắng</th>
                                <th>Tổng User Thua</th>
                                <th>Triệt tiêu hệ thống</th>
                                <th>Thưởng hằng ngày</th>
                                <th>Thưởng Online</th>
                                <th>Triệt tiêu</th>
                                <th>Tiền vào game</th>
                                <th>Tiền ra game</th>
                                <th>Tổng tiền ra vào</th>
                                <th>Tổng kết ngày</th>
                            </tr>
                            </thead>
                            <tbody>
                            {
                                this.state.Data.map(function (DateStatus, index) {
                                    var Win_Sum = this.FormatNumber(DateStatus.Win_Sum);
                                    var Lose_Sum = this.FormatNumber(DateStatus.Lose_Sum);
                                    var Diff = -(DateStatus.Win_Sum + DateStatus.Lose_Sum);
                                    var TotalDailyAward = (this.GetTotalDailyAwardByChannelID(DateStatus.TotalDailyAward));
                                    var TotalOnlineAward = (this.GetTotalOnlineAwardByChannelID(DateStatus.TotalOnlineAward));
                                    var DaySummary = -(DateStatus.Win_Sum + DateStatus.Lose_Sum) - TotalDailyAward - TotalOnlineAward;
                                    var MoneyTransfer = this.ParseMoneyTransfer(DateStatus.SummaryTransfer);
                                    Diff = this.FormatNumber(Diff);
                                    TotalDailyAward = this.FormatNumber(TotalDailyAward);
                                    TotalOnlineAward = this.FormatNumber(TotalOnlineAward);


                                    return <tr key={index}>
                                        <td>{DateStatus.Date}</td>
                                        <td>{Win_Sum}</td>
                                        <td>{Lose_Sum}</td>
                                        <td>{Diff}</td>
                                        <td>{TotalDailyAward}</td>
                                        <td>{TotalOnlineAward}</td>
                                        <td>{this.FormatNumber(DaySummary)}</td>
                                        <td>{this.FormatNumber(MoneyTransfer.ChargeInGame)}</td>
                                        <td>{this.FormatNumber(MoneyTransfer.ChargeOutGame)}</td>
                                        <td>{this.FormatNumber(MoneyTransfer.ChargeOutGame + MoneyTransfer.ChargeInGame)}</td>
                                        <td>{this.FormatNumber(DaySummary - (MoneyTransfer.ChargeOutGame + MoneyTransfer.ChargeInGame))}</td>
                                    </tr>
                                }.bind(this))
                            }
                            </tbody>
                        </Table>
                    </div>

                    {DetailTransferTable}

                    <div className="row">
                        <div className="col-sm-1">
                            <b>Theo game: </b>
                        </div>
                        <div className="col-sm-2">
                            <Dropdown id="dropdown-custom-1" bsStyle="success">
                                <Dropdown.Toggle>
                                    {
                                        this.state.GameNameConfig.map(function (GameConfig, index) {
                                            if (GameConfig.GameID == this.state.GameIDFilter) {
                                                return GameConfig.GameName;
                                            }
                                        }.bind(this))
                                    }
                                </Dropdown.Toggle>

                                <Dropdown.Menu className="text-primary">
                                    {
                                        this.state.GameNameConfig.map(function (GameConfig, index) {
                                            return GameConfig.GameID == this.state.GameIDFilter ?
                                                <MenuItem
                                                    key={index}
                                                    onClick={this.OnChangeGameIDFilter.bind(this, GameConfig.GameID)}
                                                    active>
                                                    {GameConfig.GameName}
                                                </MenuItem> :
                                                <MenuItem key={index}
                                                          onClick={this.OnChangeGameIDFilter.bind(this, GameConfig.GameID)}>
                                                    {GameConfig.GameName}
                                                </MenuItem>
                                        }.bind(this))
                                    }
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                    </div>

                    <br></br>

                    <div className="box-body table-striped">
                        <Table striped bordered condensed hover>
                            <thead>
                            <tr>
                                <th>Ngày</th>
                                <th>Tổng User Thắng</th>
                                <th>Tổng User Thua</th>
                                <th>Triệt tiêu hệ thống</th>
                            </tr>
                            </thead>
                            <tbody>
                            {
                                this.state.Data.map(function (DateStatus, index) {
                                    var Win_Sum = 0;
                                    var Lose_Sum = 0;
                                    var Diff = 0;

                                    DateStatus.MoneyWinArray.map(function (GameStatus, index1) {
                                        if (GameStatus.GameID == this.state.GameIDFilter || this.state.GameIDFilter == 0) {
                                            Win_Sum += GameStatus.TotalMoneyWin;
                                        }
                                    }.bind(this));

                                    DateStatus.MoneyLoseArray.map(function (GameStatus, index1) {
                                        if (GameStatus.GameID == this.state.GameIDFilter || this.state.GameIDFilter == 0) {
                                            Lose_Sum += GameStatus.TotalMoneyLose;
                                        }
                                    }.bind(this));

                                    Diff = -(Win_Sum + Lose_Sum);

                                    Win_Sum = this.FormatNumber(Win_Sum);
                                    Lose_Sum = this.FormatNumber(Lose_Sum);
                                    Diff = this.FormatNumber(Diff);

                                    return <tr key={index}>
                                        <td>{DateStatus.Date}</td>
                                        <td>{Win_Sum}</td>
                                        <td>{Lose_Sum}</td>
                                        <td>{Diff}</td>
                                    </tr>
                                }.bind(this))
                            }
                            </tbody>
                        </Table>
                    </div>

                    {SummaryTable}

                </div>
            </div>
        );
    }

    GetTotalDailyAwardByChannelID(TotalDailyAward) {
        var Result = 0;
        for (var i = 0; i < TotalDailyAward.length; i++) {
            if (TotalDailyAward[i].ChannelID == this.state.ChannelFilter || this.state.ChannelFilter == 0) {
                Result += TotalDailyAward[i].TotalDailyAward;
            }
        }

        return Result;
    }

    GetTotalOnlineAwardByChannelID(TotalOnlineAward) {
        var Result = 0;
        for (var i = 0; i < TotalOnlineAward.length; i++) {
            if (TotalOnlineAward[i].ChannelID == this.state.ChannelFilter || this.state.ChannelFilter == 0) {
                Result += TotalOnlineAward[i].TotalOnlineAward;
            }
        }

        return Result;
    }

    RenderSummaryTable() {
        var SummaryTable = null;

        switch (this.state.GameIDFilter) {
            case 9:
            case 1:
                SummaryTable = this.RenderBCSummary(this.state.GameIDFilter);
                break;

            case 2:
                SummaryTable = this.RenderTXSummary();
                break;

            case 4:
                SummaryTable = this.RenderSlotSummary();
                break;

            case 5:
                SummaryTable = this.RenderBaccaratSummary();
                break;

            case 6:
                SummaryTable = this.RenderXocDiaSummary();
                break;

            case 100:
                SummaryTable = this.RenderVQMMSummary();
                break;

            case 101:
                SummaryTable = this.RenderTXMiniSummary();
                break;

            case 102:
                SummaryTable = this.RenderMiniPokerSummary();
                break;

            case 8:
                SummaryTable = this.RenderBingoSummary();
                break;

            default:
                break;
        }

        return SummaryTable;
    }

    RenderBCSummary(FilterKind) {
        return <div>
            <b>Thông tin tổng hợp Bắn Cá: </b>

            <div className="box-body table-striped">
                <Table striped bordered condensed hover>
                    <thead>
                    <tr>
                        <th>Ngày</th>
                        <th>Tổng Số Cá</th>
                        <th>Tổng Số Đạn</th>
                        <th>Tổng Bắn</th>
                        <th>Tổng Tiền User Thu</th>
                        <th>Triệt Tiêu</th>
                        <th>Tỷ lệ triệt tiêu</th>
                        <th>Loại phòng</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        this.state.Data.map(function (Data, index) {
                            return Data.SummaryBCInfo.map(function (Element, index1) {
                                if(FilterKind == 9 && Element.KindID < 900){
                                    return null;
                                }

                                if(FilterKind == 1 && Element.KindID > 900){
                                    return null;
                                }

                                var Ratio = 0;
                                var Diff = Element.PayMoney - Element.EarnMoney;
                                var RoomKindName = this.GetRoomKindName(Element.KindID);

                                if (Element.PayMoney > 0) {
                                    Ratio = Diff / Element.PayMoney;
                                }

                                return <tr key={index1}>
                                    <td>{Data.Date}</td>
                                    <td>{this.FormatNumber(Element.FishCount)}</td>
                                    <td>{this.FormatNumber(Element.BulletCount)}</td>
                                    <td>{this.FormatNumber(Element.PayMoney)}</td>
                                    <td>{this.FormatNumber(Element.EarnMoney)}</td>
                                    <td>{this.FormatNumber(Diff)}</td>
                                    <td>{this.FormatNumber(Ratio)}</td>
                                    <td>{RoomKindName}</td>
                                </tr>

                            }.bind(this))
                        }.bind(this))
                    }
                    </tbody>
                </Table>
            </div>
        </div>
    }

    GetRoomKindName(KindID) {
        var Result = '';

        var RoomKind = KindID % 10;
        var GameName = Math.floor(KindID / 10);

        switch (RoomKind) {
            case 1:
                RoomKind = ' Thường';
                break;
            case 2:
                RoomKind = ' VIP';
                break;
            case 3:
                RoomKind = ' Chơi Thử';
                break;
        }

        switch (GameName) {
            case 0:
                GameName = 'Bắn cá';
                break;
            case 1:
                GameName = 'Bắn cá 3D';
                break;
            case 90:
                GameName = 'Bắn chim';
                break;
        }


        Result = GameName + RoomKind;
        return Result;
    }

    HandleChangeFilter(event, ID) {
        var Value = event.target.value;
        this.state[ID] = Value;
        this.state.Data = this.CalculateSum(this.state.Data);
        this.setState(this.state);
    }

    RenderSlotSummary() {
        return <div>
            <div className="col-sm-3">
                <b>Thông tin tổng hợp Slot: </b>

            </div>

            <div className="col-sm-2">
                <select className="form-control" defaultValue={this.state.SlotFilter}
                        onChange={(e) => this.HandleChangeFilter(e, "SlotFilter")} id="Filter">
                    <option value={401}>Tứ Long</option>
                    <option value={402}>Hoa Quả</option>
                </select>
            </div>

            <br></br>
            <br></br>

            <div className="box-body table-striped">
                <Table striped bordered condensed hover>
                    <thead>
                    <tr>
                        <th>Ngày</th>
                        <th>Tổng phiên</th>
                        <th>Tổng cược</th>
                        <th>Tổng thắng</th>
                        <th>Triệt tiêu</th>
                        <th>Triệt tiêu (Không JP)</th>
                        <th>Tỷ lệ triệt tiêu</th>
                        <th>Tỷ lệ triệt tiêu (Không JP)</th>
                        <th>GameID</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        this.state.Data.map(function (Element, index) {
                            return Element.SummarySlotInfo.map(function (SubElement, index1) {
                                if (SubElement.ChannelID == this.state.ChannelFilter || this.state.ChannelFilter == 0) {
                                    var Ratio = 0;
                                    var Ratio_WithoutJP = 0;
                                    var Diff = SubElement.TotalBet - SubElement.TotalWin;
                                    var Diff_WithoutJP = Diff - SubElement.TotalBet * 0.02;

                                    if (SubElement.TotalWin > 0) {
                                        Ratio = Diff / SubElement.TotalBet;
                                        Ratio_WithoutJP = Diff_WithoutJP / SubElement.TotalBet;
                                    }

                                    if (SubElement.KindID == this.state.SlotFilter) {
                                        return <tr key={index1}>
                                            <td>{Element.Date}</td>
                                            <td>{this.FormatNumber(SubElement.BetCount)}</td>
                                            <td>{this.FormatNumber(SubElement.TotalBet)}</td>
                                            <td>{this.FormatNumber(SubElement.TotalWin)}</td>
                                            <td>{this.FormatNumber(Diff)}</td>
                                            <td>{this.FormatNumber(Diff_WithoutJP)}</td>
                                            <td>{this.FormatNumber(Ratio)}</td>
                                            <td>{this.FormatNumber(Ratio_WithoutJP)}</td>
                                            <td>{SubElement.KindID}</td>
                                        </tr>
                                    }
                                }
                            }.bind(this));
                        }.bind(this))
                    }
                    </tbody>
                </Table>
            </div>
        </div>
    }

    RenderTXSummary() {
        return <div>
            <b>Thông tin tổng hợp Tài xỉu: </b>

            <div className="box-body table-striped">
                <Table striped bordered condensed hover>
                    <thead>
                    <tr>
                        <th>Ngày</th>
                        <th>Tổng Số Phiên</th>
                        <th>Tổng Tiền Cược</th>
                        <th>Tổng Tiền Thắng</th>
                        <th>Tổng Tiền Thắng (không thuế)</th>
                        <th>Triệt Tiêu</th>
                        <th>Triệt Tiêu (không thuế)</th>
                        <th>Tỷ lệ triệt tiêu</th>
                        <th>Tỷ lệ triệt tiêu (không thuế)</th>
                        <th>Trung bình thuế</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        this.state.Data.map(function (Data, index) {
                            return Data.SummaryTXInfo.map(function (Element, index1) {
                                if (Element.ChannelID == this.state.ChannelFilter || this.state.ChannelFilter == 0) {
                                    var Ratio = 0;
                                    var Ratio_Tax = 0;
                                    var Diff = 0;
                                    var Diff_Tax = 0;

                                    Diff = Element.TotalBetGold - Element.TotalWinGold;
                                    Diff_Tax = Element.TotalBetGold - Element.TotalWinGoldWithTax;

                                    Ratio = Element.TotalBetGold > 0 ? Diff / Element.TotalBetGold : 0;
                                    Ratio_Tax = Element.TotalBetGold > 0 ? Diff_Tax / Element.TotalBetGold : 0;


                                    return <tr key={index}>
                                        <td>{Data.Date}</td>
                                        <td>{this.FormatNumber(Element.TotalBetCount)}</td>
                                        <td>{this.FormatNumber(Element.TotalBetGold)}</td>
                                        <td>{this.FormatNumber(Element.TotalWinGold)}</td>
                                        <td>{this.FormatNumber(Element.TotalWinGoldWithTax)}</td>
                                        <td>{this.FormatNumber(Diff)}</td>
                                        <td>{this.FormatNumber(Diff_Tax)}</td>
                                        <td>{this.FormatNumber(Ratio)}</td>
                                        <td>{this.FormatNumber(Ratio_Tax)}</td>
                                        <td>{Element.AVGTax}</td>
                                    </tr>
                                }
                            }.bind(this))

                        }.bind(this))
                    }
                    </tbody>
                </Table>
            </div>
        </div>
    }

    RenderTXMiniSummary() {
        return <div>
            <b>Thông tin tổng hợp Tài xỉu: </b>

            <div className="box-body table-striped">
                <Table striped bordered condensed hover>
                    <thead>
                    <tr>
                        <th>Ngày</th>
                        <th>Tổng Số Phiên</th>
                        <th>Tổng Tiền Cược</th>
                        <th>Tổng Tiền Thắng</th>
                        <th>Tổng Tiền Thắng (không thuế)</th>
                        <th>Triệt Tiêu</th>
                        <th>Triệt Tiêu (không thuế)</th>
                        <th>Tỷ lệ triệt tiêu</th>
                        <th>Tỷ lệ triệt tiêu (không thuế)</th>
                        <th>Trung bình thuế</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        this.state.Data.map(function (Data, index) {
                            return Data.SummaryTXMiniInfo.map(function (Element, index1) {
                                if (Element.ChannelID == this.state.ChannelFilter || this.state.ChannelFilter == 0) {
                                    var Ratio = 0;
                                    var Ratio_Tax = 0;
                                    var Diff = 0;
                                    var Diff_Tax = 0;

                                    Diff = Element.TotalBetGold - Element.TotalWinGold;
                                    Diff_Tax = Element.TotalBetGold - Element.TotalWinGoldWithTax;

                                    Ratio = Element.TotalBetGold > 0 ? Diff / Element.TotalBetGold : 0;
                                    Ratio_Tax = Element.TotalBetGold > 0 ? Diff_Tax / Element.TotalBetGold : 0;


                                    return <tr key={index}>
                                        <td>{Data.Date}</td>
                                        <td>{this.FormatNumber(Element.TotalBetCount)}</td>
                                        <td>{this.FormatNumber(Element.TotalBetGold)}</td>
                                        <td>{this.FormatNumber(Element.TotalWinGold)}</td>
                                        <td>{this.FormatNumber(Element.TotalWinGoldWithTax)}</td>
                                        <td>{this.FormatNumber(Diff)}</td>
                                        <td>{this.FormatNumber(Diff_Tax)}</td>
                                        <td>{this.FormatNumber(Ratio)}</td>
                                        <td>{this.FormatNumber(Ratio_Tax)}</td>
                                        <td>{Element.AVGTax}</td>
                                    </tr>
                                }
                            }.bind(this))
                        }.bind(this))
                    }
                    </tbody>
                </Table>
            </div>
        </div>
    }

    RenderBingoSummary() {
        return <div>
            <b>Thông tin tổng hợp Bingo: </b>

            <div className="box-body table-striped">
                <Table striped bordered condensed hover>
                    <thead>
                    <tr>
                        <th>Ngày</th>
                        <th>Tổng Số Phiên</th>
                        <th>Tổng Tiền Cược</th>
                        <th>Tổng Tiền Thắng</th>
                        <th>Tổng Tiền Thắng (không thuế)</th>
                        <th>Triệt Tiêu</th>
                        <th>Triệt Tiêu (không thuế)</th>
                        <th>Tỷ lệ triệt tiêu</th>
                        <th>Tỷ lệ triệt tiêu (không thuế)</th>
                        <th>Trung bình thuế</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        this.state.Data.map(function (Data, index) {
                            return Data.SummaryBingoInfo.map(function (Element, index1) {
                                if (Element.ChannelID == this.state.ChannelFilter || this.state.ChannelFilter == 0) {
                                    var Ratio = 0;
                                    var Ratio_Tax = 0;
                                    var Diff = 0;
                                    var Diff_Tax = 0;

                                    Diff = Element.TotalBetGold - Element.TotalWinGold;
                                    Diff_Tax = Element.TotalBetGold - Element.TotalWinGoldWithTax;

                                    Ratio = Element.TotalBetGold > 0 ? Diff / Element.TotalBetGold : 0;
                                    Ratio_Tax = Element.TotalBetGold > 0 ? Diff_Tax / Element.TotalBetGold : 0;


                                    return <tr key={index}>
                                        <td>{Data.Date}</td>
                                        <td>{this.FormatNumber(Element.TotalBetCount)}</td>
                                        <td>{this.FormatNumber(Element.TotalBetGold)}</td>
                                        <td>{this.FormatNumber(Element.TotalWinGold)}</td>
                                        <td>{this.FormatNumber(Element.TotalWinGoldWithTax)}</td>
                                        <td>{this.FormatNumber(Diff)}</td>
                                        <td>{this.FormatNumber(Diff_Tax)}</td>
                                        <td>{this.FormatNumber(Ratio)}</td>
                                        <td>{this.FormatNumber(Ratio_Tax)}</td>
                                        <td>{Element.AVGTax}</td>
                                    </tr>
                                }
                            }.bind(this))
                        }.bind(this))
                    }
                    </tbody>
                </Table>
            </div>
        </div>
    }

    RenderXocDiaSummary() {
        return <div>
            <b>Thông tin tổng hợp Xóc Dĩa: </b>

            <div className="box-body table-striped">
                <Table striped bordered condensed hover>
                    <thead>
                    <tr>
                        <th>Ngày</th>
                        <th>Tổng Số Phiên</th>
                        <th>Tổng Tiền Cược</th>
                        <th>Tổng Tiền Thắng</th>
                        <th>Tổng Tiền Thắng (không thuế)</th>
                        <th>Triệt Tiêu</th>
                        <th>Triệt Tiêu (không thuế)</th>
                        <th>Tỷ lệ triệt tiêu</th>
                        <th>Tỷ lệ triệt tiêu (không thuế)</th>
                        <th>Trung bình thuế</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        this.state.Data.map(function (Data, index) {
                            return Data.SummaryXocDiaInfo.map(function (Element, index1) {
                                if (Element.ChannelID == this.state.ChannelFilter || this.state.ChannelFilter == 0) {
                                    var Ratio = 0;
                                    var Ratio_Tax = 0;
                                    var Diff = 0;
                                    var Diff_Tax = 0;

                                    Diff = Element.TotalBetGold - Element.TotalWinGold;
                                    Diff_Tax = Element.TotalBetGold - Element.TotalWinGoldWithTax;

                                    Ratio = Element.TotalBetGold > 0 ? Diff / Element.TotalBetGold : 0;
                                    Ratio_Tax = Element.TotalBetGold > 0 ? Diff_Tax / Element.TotalBetGold : 0;


                                    return <tr key={index}>
                                        <td>{Data.Date}</td>
                                        <td>{this.FormatNumber(Element.TotalBetCount)}</td>
                                        <td>{this.FormatNumber(Element.TotalBetGold)}</td>
                                        <td>{this.FormatNumber(Element.TotalWinGold)}</td>
                                        <td>{this.FormatNumber(Element.TotalWinGoldWithTax)}</td>
                                        <td>{this.FormatNumber(Diff)}</td>
                                        <td>{this.FormatNumber(Diff_Tax)}</td>
                                        <td>{this.FormatNumber(Ratio)}</td>
                                        <td>{this.FormatNumber(Ratio_Tax)}</td>
                                        <td>{Element.AVGTax}</td>
                                    </tr>
                                }
                            }.bind(this));
                        }.bind(this))
                    }
                    </tbody>
                </Table>
            </div>
        </div>
    }

    GetSpinNameByKind(SpinKind) {
        var SpinName = [
            {
                SpinName: "Lượt quay hằng ngày",
                SpinKind: 1
            },
            {
                SpinName: "Lượt quay Free",
                SpinKind: 2
            },
            {
                SpinName: "Lượt quay bình thường",
                SpinKind: 3
            }
        ];
        var Name = "" + SpinKind;

        for (var i = 0; i < SpinName.length; i++) {
            if (SpinName[i].SpinKind == SpinKind) {
                Name = SpinName[i].SpinName;
                break;
            }
        }

        return Name;
    }

    RenderVQMMSummary() {
        return <div>
            <b>Thông tin tổng hợp VQMM: </b>

            <div className="box-body table-striped">
                <Table striped bordered condensed hover>
                    <thead>
                    <tr>
                        <th>Ngày</th>
                        <th>Tổng Số Phiên</th>
                        <th>Tổng Tiền Cược</th>
                        <th>Tổng Tiền Thắng</th>
                        <th>Tổng lượt Free</th>
                        <th>Triệt Tiêu</th>
                        <th>Tỷ lệ triệt tiêu</th>
                        <th>Loại</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        this.state.Data.map(function (Data, index) {
                            return Data.SummaryVQMMInfo.map(function (Element, index1) {
                                if (Element.ChannelID == this.state.ChannelFilter || this.state.ChannelFilter == 0) {
                                    var Ratio = 0;
                                    var Diff = 0;
                                    var SpinName = this.GetSpinNameByKind(Element.SpinKind)

                                    Diff = Element.TotalBet - Element.TotalWin;
                                    Ratio = Element.TotalBet > 0 ? Diff / Element.TotalBet : 0;

                                    return <tr key={index * 10 + index1}>
                                        <td>{Data.Date}</td>
                                        <td>{this.FormatNumber(Element.TotalSpin)}</td>
                                        <td>{this.FormatNumber(Element.TotalBet)}</td>
                                        <td>{this.FormatNumber(Element.TotalWin)}</td>
                                        <td>{this.FormatNumber(Element.TotalFreeSpin)}</td>
                                        <td>{this.FormatNumber(Diff)}</td>
                                        <td>{this.FormatNumber(Ratio)}</td>
                                        <td>{SpinName}</td>
                                    </tr>
                                }
                            }.bind(this))
                        }.bind(this))
                    }
                    </tbody>
                </Table>
            </div>
        </div>
    }

    RenderMiniPokerSummary() {
        return <div>
            <b>Thông tin tổng hợp Mini Poker: </b>

            <div className="box-body table-striped">
                <Table striped bordered condensed hover>
                    <thead>
                    <tr>
                        <th>Ngày</th>
                        <th>Tổng Số Phiên</th>
                        <th>Tổng Tiền Cược</th>
                        <th>Tổng Tiền Thắng</th>
                        <th>Triệt Tiêu</th>
                        <th>Tỷ lệ triệt tiêu</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        this.state.Data.map(function (Data, index) {
                            return Data.SummaryMiniPokerInfo.map(function (Element, index1) {
                                if (Element.ChannelID == this.state.ChannelFilter || this.state.ChannelFilter == 0) {
                                    var Ratio = 0;
                                    var Diff = 0;

                                    Diff = Element.TotalBet - Element.TotalWin;
                                    Ratio = Element.TotalBet > 0 ? Diff / Element.TotalBet : 0;

                                    return <tr key={index * 10 + index1}>
                                        <td>{Data.Date}</td>
                                        <td>{this.FormatNumber(Element.TotalBetCount)}</td>
                                        <td>{this.FormatNumber(Element.TotalBet)}</td>
                                        <td>{this.FormatNumber(Element.TotalWin)}</td>
                                        <td>{this.FormatNumber(Diff)}</td>
                                        <td>{this.FormatNumber(Ratio)}</td>
                                    </tr>
                                }
                            }.bind(this))
                        }.bind(this))
                    }
                    </tbody>
                </Table>
            </div>
        </div>
    }


    RenderBaccaratSummary() {
        return <div>
            <b>Thông tin tổng hợp Baccarat: </b>

            <div className="box-body table-striped">
                <Table striped bordered condensed hover>
                    <thead>
                    <tr>
                        <th>Ngày</th>
                        <th>Tổng Số Phiên</th>
                        <th>Tổng Tiền Cược</th>
                        <th>Tổng Tiền Thắng</th>
                        <th>Tổng Tiền Thắng (không thuế)</th>
                        <th>Triệt Tiêu</th>
                        <th>Triệt Tiêu (không thuế)</th>
                        <th>Tỷ lệ triệt tiêu</th>
                        <th>Tỷ lệ triệt tiêu (không thuế)</th>
                        <th>Trung bình thuế</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        this.state.Data.map(function (Data, index) {
                            return Data.SummaryBaccaratInfo.map(function (Element, index1) {
                                if (Element.ChannelID == this.state.ChannelFilter || this.state.ChannelFilter == 0) {
                                    var Ratio = 0;
                                    var Ratio_Tax = 0;
                                    var Diff = 0;
                                    var Diff_Tax = 0;

                                    Diff = Element.TotalBetGold - Element.TotalWinGold;
                                    Diff_Tax = Element.TotalBetGold - Element.TotalWinGoldWithTax;

                                    Ratio = Element.TotalBetGold > 0 ? Diff / Element.TotalBetGold : 0;
                                    Ratio_Tax = Element.TotalBetGold > 0 ? Diff_Tax / Element.TotalBetGold : 0;


                                    return <tr key={index}>
                                        <td>{Element.Date}</td>
                                        <td>{this.FormatNumber(Element.TotalBetCount)}</td>
                                        <td>{this.FormatNumber(Element.TotalBetGold)}</td>
                                        <td>{this.FormatNumber(Element.TotalWinGold)}</td>
                                        <td>{this.FormatNumber(Element.TotalWinGoldWithTax)}</td>
                                        <td>{this.FormatNumber(Diff)}</td>
                                        <td>{this.FormatNumber(Diff_Tax)}</td>
                                        <td>{this.FormatNumber(Ratio)}</td>
                                        <td>{this.FormatNumber(Ratio_Tax)}</td>
                                        <td>{Element.AVGTax}</td>
                                    </tr>
                                }
                            }.bind(this))
                        }.bind(this))
                    }
                    </tbody>
                </Table>
            </div>
        </div>
    }

    OnTimeChange(time, ID) {
        var GDate = new Date(time._d);

        var hh = this.pad(GDate.getHours(), 2);
        var mm = this.pad(GDate.getMinutes(), 2);
        var ss = "00";

        var value = hh + ":" + mm + ":" + ss;
        this.DateByValue[ID] = value;

        this.UpdateDateRequest(ID, GDate);
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

        var currState = this.state;
        currState.DateRequest = DateRequest;

        this.setState(currState);
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
        var TimeFrom = this.DateByValue.TimeFrom;
        var TimeTo = this.DateByValue.TimeTo;
        this.ReportStatus = "";

        var data = {
            DateFrom: DateFrom,
            DateTo: DateTo,
            TimeFrom: TimeFrom,
            TimeTo: TimeTo
        };

        this.props.OnExecute(this.Action, data);
    }
}

export default TotalSystemGold;
