import React, { Component } from 'react';
import '../css/App.css';
import Menu from './Menu.js';
import {Label, Button, ButtonToolbar, DropdownButton, MenuItem, Glyphicon, Dropdown} from 'react-bootstrap';
import Datetime from 'react-datetime';
import Chart from 'chart.js';

import {Line} from 'react-chartjs-2';
import 'chartjs-plugin-datalabels';

var PacketConfig = require('../Config/PacketConfig');

class TotalSystemGold extends Component {
    constructor(props) {
        super(props);
        this.Action = this.props.Action;

        var now = new Date();

        this.state = {
            CurrentTotalSystemGold: 0,
            CurrentTotalSystemGold_InGame: 0,
            Data: [],
            DateRequest: {
                DateFrom: now,
                DateTo: now
            },
            ChartData: {}
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

    OnUpdateState(Data) {

        var ChartData = {
            labels: this.FormatDateTimeToHour(Data.Result_ForChart.UpdateTime),
            datasets: [
                {
                    label: "Thống kê gold tồn",
                    fill: false,
                    lineTension: 0,
                    backgroundColor: 'rgba(75,192,192,0.5)',
                    borderColor: 'rgba(75,192,192,0.5)',
                    borderCapStyle: 'butt',
                    borderDash: [],
                    borderDashOffset: 0.0,
                    borderJoinStyle: 'miter',
                    pointBorderColor: 'rgba(75,192,192,1)',
                    pointBackgroundColor: 'rgba(75,192,192,1)',
                    pointBorderWidth: 10,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: 'rgba(75,192,192,0.5)',
                    pointHoverBorderColor: 'rgba(220,220,220,0.5)',
                    pointHoverBorderWidth: 2,
                    pointRadius: 1,
                    pointHitRadius: 10,

                    data: Data.Result_ForChart.TotalSystemGold,
                    datalabels: {
                        align: 'end',
                        anchor: 'end'
                    }
                }
            ]
        };

        var currState = this.state;
        currState.Data = Data.Result;
        currState.ChartData = ChartData;
        currState.CurrentTotalSystemGold = Data.CurrentTotalSystemGold;
        currState.CurrentTotalSystemGold_InGame = Data.CurrentTotalSystemGold_Ingame;

        this.setState(currState);
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
        };

        this.props.OnExecute(this.Action, data);
    }

    FormatDateTimeToHour(datetimeArr) {
        var result = [];
        for (var i = 0; i < datetimeArr.length; i++) {
            var dt = new Date(datetimeArr[i]);
            result.push(dt.getHours())
        }
        return result;
    }

    FormatNumber(num) {
        if (num >= 1000 || num * (-1) >= 1000) {
            return '' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        } else {
            return '' + num;
        }
    }

    render() {

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
                    formatter: function (value, index, values) {
                        var val = parseInt(value);
                        var Mil = '';

                        if (val >= 1000000) {
                            Mil = 'M';
                            val = Math.floor(val / 1000000);


                            return '' + val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + Mil;
                        } else {
                            return '' + val + Mil;
                        }
                    }
                }
            },
            scales: {
                yAxes: [{
                    ticks: {
                        padding: 40,
                        callback: function (value, index, values) {
                            var val = parseInt(value);
                            var Mil = '';

                            if (val >= 1000000) {
                                Mil = 'M';
                                val = Math.floor(val / 1000000);


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
                        display: true,
                        drawTicks: false,
                        drawOnChartArea: false,
                    },

                }]
            },
            tooltips: {
                callbacks: {
                    label: function (tooltipItem, data) {
                        var value = data.datasets[0].data[tooltipItem.index];
                        if (parseInt(value) >= 1000) {
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

        return (
            <div>
                <div className="layout">
                    <div className="box-body table-striped">
                        <table>
                            <tbody>
                            <tr>
                                <td>
                                    <div className="form-group">

                                        <div className="col-sm-2">
                                            <label>Ngày: </label>
                                        </div>


                                        <div className="col-sm-4">
                                            <Datetime onChange={(e) => this.OnDayChange(e, "DateFrom")} id="dateFrom"
                                                      viewDate={this.state.DateRequest.DateFrom}
                                                      value={this.state.DateRequest.DateFrom} timeFormat={false}/>
                                        </div>

                                        <div className="col-sm-4">
                                            <Datetime onChange={(e) => this.OnDayChange(e, "DateTo")} id="dateTo"
                                                      viewDate={this.state.DateRequest.DateTo}
                                                      value={this.state.DateRequest.DateTo} timeFormat={false}/>
                                        </div>

                                        <Button className="col-sm-2" onClick={this.OnExecute.bind(this)}>
                                            Xem </Button>
                                    </div>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>

                    <div>
                        <div>
                            <br></br>
                            <li><label>Gold tồn hiện tại: {this.FormatNumber(this.state.CurrentTotalSystemGold)}</label></li>
                            <li><label>Gold tồn hiện tại trong game: {this.FormatNumber(this.state.CurrentTotalSystemGold_InGame)}</label></li>
                            <li><label>TỔNG: {this.FormatNumber(this.state.CurrentTotalSystemGold + this.state.CurrentTotalSystemGold_InGame)}</label></li>



                        </div>
                        <div>
                            {this.state.Data.length ?
                                <Line data={this.state.ChartData} options={options} width={1600} height={600}/>
                                : null}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default TotalSystemGold;
