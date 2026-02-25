import React, { Component } from 'react';
import '../css/App.css';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import {Table, Label, Button, ButtonToolbar, DropdownButton, MenuItem, Glyphicon, Dropdown} from 'react-bootstrap';
import Datetime from 'react-datetime'

import {Line} from 'react-chartjs-2';
import 'chartjs-plugin-datalabels';
import Clipboard from 'react-clipboard.js';

class MoneyFlowStatistics extends Component {
    constructor(props) {
        super(props);
        this.Action = this.props.Action;
        var now = new Date();

        this.state = {
            Responsed: false,
            Data: [],
            ChartData: {},
            DateRequest: {
                DateFrom: now,
                DateTo: now
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

        this.ReportStatus = "";

        this.OnExecute();
    }

    OnUpdateState(Data) {

        var ChartData = this.GetChartData(Data);

        var currState = this.state;
        currState.ChartData = ChartData;
        currState.Data = Data.Result;
        this.setState(currState);
    }

    GetChartData(Data) {
        var label = [].concat(Data.Result_ForChart.Date);
        var TempArr = [];
        var WebTransferToGame = TempArr.concat(Data.Result_ForChart.WebTransferToGame);
        var GameTransferToWeb = TempArr.concat(Data.Result_ForChart.GameTransferToWeb);
        var GameInMoneyChargeAll = TempArr.concat(Data.Result_ForChart.GameInMoneyChargeAll);
        var GameOutMoneyRefundAll = TempArr.concat(Data.Result_ForChart.GameOutMoneyRefundAll);
        var DailyAward = TempArr.concat(Data.Result_ForChart.DailyAward);
        var OnlineAward = TempArr.concat(Data.Result_ForChart.OnlineAward);
        var ChartData = {
            labels: label,
            datasets: [
                {
                    label: "WebTransferToGame",
                    fill: false,
                    lineTension: 0,
                    backgroundColor: '#40a8c4',
                    borderColor: '#40a8c4',
                    borderCapStyle: 'butt',
                    borderDash: [],
                    borderDashOffset: 0.0,
                    borderJoinStyle: 'miter',
                    pointBorderColor: '#40a8c4',
                    pointBackgroundColor: '#40a8c4',
                    pointBorderWidth: 10,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: '#40a8c4',
                    pointHoverBorderColor: '#40a8c4',
                    pointHoverBorderWidth: 2,
                    pointRadius: 1,
                    pointHitRadius: 10,
                    data: WebTransferToGame,
                    datalabels: {
                        align: 'end',
                        anchor: 'end'
                    }
                },
                {
                    label: "GameTransferToWeb",
                    fill: false,
                    lineTension: 0,
                    backgroundColor: '#f7aa00',
                    borderColor: '#f7aa00',
                    borderCapStyle: 'butt',
                    borderDash: [],
                    borderDashOffset: 0.0,
                    borderJoinStyle: 'miter',
                    pointBorderColor: '#f7aa00',
                    pointBackgroundColor: '#f7aa00',
                    pointBorderWidth: 10,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: '#f7aa00',
                    pointHoverBorderColor: '#f7aa00',
                    pointHoverBorderWidth: 2,
                    pointRadius: 1,
                    pointHitRadius: 10,
                    data: GameTransferToWeb,
                    datalabels: {
                        align: 'end',
                        anchor: 'end'
                    }
                },
                {
                    label: "GameInMoneyChargeAll",
                    fill: false,
                    lineTension: 0,
                    backgroundColor: '#235784',
                    borderColor: '#235784',
                    borderCapStyle: 'butt',
                    borderDash: [],
                    borderDashOffset: 0.0,
                    borderJoinStyle: 'miter',
                    pointBorderColor: '#235784',
                    pointBackgroundColor: '#235784',
                    pointBorderWidth: 10,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: '#235784',
                    pointHoverBorderColor: '#235784',
                    pointHoverBorderWidth: 2,
                    pointRadius: 1,
                    pointHitRadius: 10,
                    data: GameInMoneyChargeAll,
                    datalabels: {
                        align: 'end',
                        anchor: 'end'
                    },
                    hidden: true,
                },
                {
                    label: "GameOutMoneyRefundAll",
                    data: GameOutMoneyRefundAll,
                    fill: false,
                    lineTension: 0,
                    backgroundColor: '#e14594',
                    borderColor: '#e14594',
                    borderCapStyle: 'butt',
                    borderDash: [],
                    borderDashOffset: 0.0,
                    borderJoinStyle: 'miter',
                    pointBorderColor: '#e14594',
                    pointBackgroundColor: '#e14594',
                    pointBorderWidth: 10,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: '#e14594',
                    pointHoverBorderColor: '#e14594',
                    pointHoverBorderWidth: 2,
                    pointRadius: 1,
                    pointHitRadius: 10,
                    datalabels: {
                        align: 'end',
                        anchor: 'end'
                    },
                    hidden: true,
                },
                {
                    label: "DailyAward",
                    fill: false,
                    lineTension: 0,
                    backgroundColor: '#5c3c10',
                    borderColor: '#5c3c10',
                    borderCapStyle: 'butt',
                    borderDash: [],
                    borderDashOffset: 0.0,
                    borderJoinStyle: 'miter',
                    pointBorderColor: '#5c3c10',
                    pointBackgroundColor: '#5c3c10',
                    pointBorderWidth: 10,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: '#5c3c10',
                    pointHoverBorderColor: '#5c3c10',
                    pointHoverBorderWidth: 2,
                    pointRadius: 1,
                    pointHitRadius: 10,
                    data: DailyAward,
                    datalabels: {
                        align: 'end',
                        anchor: 'end'
                    },
                    hidden: true,
                },
                {
                    label: "OnlineAward",
                    fill: false,
                    lineTension: 0,
                    backgroundColor: '#fd5f00',
                    borderColor: '#fd5f00',
                    borderCapStyle: 'butt',
                    borderDash: [],
                    borderDashOffset: 0.0,
                    borderJoinStyle: 'miter',
                    pointBorderColor: '#fd5f00',
                    pointBackgroundColor: '#fd5f00',
                    pointBorderWidth: 10,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: '#fd5f00',
                    pointHoverBorderColor: '#fd5f00',
                    pointHoverBorderWidth: 2,
                    pointRadius: 1,
                    pointHitRadius: 10,
                    data: OnlineAward,
                    datalabels: {
                        align: 'end',
                        anchor: 'end'
                    },
                    hidden: true,
                }
            ]
        };

        return ChartData;
    }

    GetChartOptions() {
        const options = {
            maintainAspectRatio: false,
            responsive: false,
            legend: {
                position: 'bottom',
                labels: {
                    boxWidth: 10
                }
            },
            plugins: {
                datalabels: {

                    borderRadius: 4,
                    color: 'black',
                    font: {
                        weight: 'bold'
                    },
                    padding: {
                        top: -1
                    },
                    formatter: function (value, index, values) {
                        var val = parseInt(value);
                        var Mil = '';

                        if (val >= 1000 || val * (-1) >= 1000) {
                            Mil = 'k';
                            val = Math.floor(val / 1000);

                        }

                        if (val >= 1000 || val * (-1) >= 1000) {
                            return '' + val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + Mil;
                        } else {
                            return '' + val + Mil;
                        }
                    }
                }
            },
            scales: {
                yAxes: [{
                    gridLines: {
                        drawBorder: false
                    },
                    ticks: {
                        padding: 40,
                        callback: function (value, index, values) {
                            var val = parseInt(value);
                            var Mil = '';

                            if (val >= 1000 || val * (-1) >= 1000) {
                                Mil = 'k';
                                val = Math.floor(val / 1000);
                            }

                            if (val >= 1000 || val * (-1) >= 1000) {
                                return '' + val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + Mil;
                            } else {
                                return '' + val + Mil;
                            }
                        }
                    }
                }],
                xAxes: [{
                    ticks: {
                        padding: 20,
                        fontFamily: 'Gotham-Medium',
                        fontColor: 'primaryBlue',
                        labelOffset: 20,
                    },
                    gridLines: {
                        tickMarkLength: 40,
                        offsetGridLines: true,
                        display: false,
                        drawTicks: false,
                        drawOnChartArea: false,
                    },

                }]
            },
            tooltips: {
                callbacks: {
                    label: function (tooltipItem, data) {
                        var value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                        if (parseInt(value) >= 1000 || parseInt(value)* (-1) >= 1000) {
                            return '' + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                        } else {
                            return '' + value;
                        }
                    }
                }
            },
            layout: {
                padding: {
                    left: 50,
                    right: 50,
                    top: 20
                }
            }
        };

        return options;
    }

    render() {
        var options = this.GetChartOptions();

        return (
            <div>
                <h1><Label>Luồng tiền: </Label></h1>
                <div className="layout">
                    <div className="box-body table-striped">
                        <table>
                            <tbody>
                            <tr>
                                <td>
                                    <div className="form-group">
                                        <label className="col-sm-1">Ngày: </label>

                                        <div className="col-sm-3">
                                            <Datetime onChange={(e) => this.OnDayChange(e, "DateFrom")} id="dateFrom"
                                                      viewDate={this.state.DateRequest.DateFrom}
                                                      value={this.state.DateRequest.DateFrom} timeFormat={false}/>
                                        </div>

                                        <div className="col-sm-3">
                                            <Datetime onChange={(e) => this.OnDayChange(e, "DateTo")} id="dateTo"
                                                      viewDate={this.state.DateRequest.DateTo}
                                                      value={this.state.DateRequest.DateTo} timeFormat={false}/>
                                        </div>

                                        <Button className="col-sm-1" onClick={this.OnExecute.bind(this)}>
                                            Xem </Button>
                                    </div>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>

                    <br></br>

                    <Line data={this.state.ChartData} options={options} width={1600} height={600}/>

                </div>
            </div>
        );
    }

    /*
     <div className="col-sm-2">
     <Clipboard option-text={this.CopyList.bind(this)}
     className="btn btn-primary"
     button-title="I'm a tooltip"
     onSuccess={this.OnCopySuccess.bind(this)}>
     Lấy số liệu báo cáo
     </Clipboard>
     <Label bsStyle="danger">{this.ReportStatus}</Label>
     </div>
     */

    CopyList() {
        //var Result = "STT" + "\t" + "Tên nhân vật" + "\t" + "Điểm" + "\t" + "UserID" + "\t" + "UID" + "\r\n";
        //for (var i = 0; i < this.state.Popup.Data.Result.length; i++) {
        //    var tmp = this.state.Popup.Data.Result[i];
        //    Result += i+1 + "\t" + tmp.GameName + "\t" + tmp.Score + "\t" + tmp.UserID + "\t" + tmp.AccountID + "\r\n"
        //}

        var Result = "";
        var BreakLine = "\r\n";

        /*
         DailyAward: 0
         Date: "2018-11-07"
         GameInMoneyChargeAll: 981750
         GameOutMoneyRefundAll: 0
         GameTransferToWeb: 0
         OnlineAward: 0
         WebTransferToGame: 0
         */

        for(var i = 0; i  < this.state.Data.length; i++){
            var CurrData = this.state.Data[i];

            var DoanhThu = CurrData.WebTransferToGame / 10;
            var DoiThuong = CurrData.GameTransferToWeb / 14;
            var LoiNhuan = DoanhThu - DoiThuong;
            var Rate = DoanhThu > 0 ? DoiThuong / DoanhThu : 0;

            //Result += "Ngày\t" + CurrData.Date + BreakLine;
            Result += "Doanh thu\t" + DoanhThu + BreakLine;
            Result += "Đổi thưởng\t" + DoiThuong + BreakLine;
            Result += "Lợi nhuận\t" + LoiNhuan + BreakLine;
            Result += "Rate\t" + Rate + BreakLine;
            Result += BreakLine;
            Result += BreakLine;
        }

        return Result;
    }

    OnCopySuccess() {
        this.ReportStatus = "Đã Copy!";
        this.setState(this.state);

        setTimeout(function(){
            this.ReportStatus = "";
            this.setState(this.state);
        }.bind(this), 1000)
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
            DateTo: DateTo
        };

        this.props.OnExecute(this.Action, data);
    }
}

export default MoneyFlowStatistics;
