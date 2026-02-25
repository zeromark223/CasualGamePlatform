import React, { Component } from 'react';
import '../css/App.css';
import ReactTable from 'react-table'
import 'react-table/react-table.css'

import {Table, Label, Button, ButtonToolbar, DropdownButton, MenuItem, Glyphicon, Dropdown} from 'react-bootstrap';
import Datetime from 'react-datetime';

import {Line} from 'react-chartjs-2';
import 'chartjs-plugin-datalabels';

class LogCCU extends Component {
    constructor(props) {
        super(props);
        this.Action = this.props.Action;
        var now = new Date();

        this.state = {
            Responsed: false,
            Data: {
                CCULog: [],
                CurrentCCU: 0,
                CCUDetail: []
            },
            DateRequest: {
                DateFrom: now,
                DateTo: now
            },
            ChartData: [],
            FilterGameID: 0
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

        var DataForChart = [];

        for (var i = 0; i < Data.CCULog.length; i++) {
            var curCCULog = Data.CCULog[i];
            curCCULog.CCU = Math.floor(curCCULog.CCU);
            //console.log("ccu", Math.floor(parseInt(curCCULog)));

            var index = -1;
            for (var j = 0; j < DataForChart.length; j++) {
                if (DataForChart[j].GameID == curCCULog.GameID) {
                    index = j;
                    break;
                }
            }

            if (index == -1) {
                var newCCU = [];
                var newDate = [];
                var newCCUMAX = [];
                var newCCUMIN = [];

                newCCU.push(curCCULog.CCU);
                newCCUMAX.push(curCCULog.CCU_MAX);
                newCCUMIN.push(curCCULog.CCU_MIN);
                newDate.push(curCCULog.UpdateTime);

                DataForChart.push({
                    GameID: curCCULog.GameID,
                    CCU: newCCU,
                    CCU_MIN: newCCUMIN,
                    CCU_MAX: newCCUMAX,
                    UpdateTime: newDate
                })
            }
            else {
                DataForChart[index].CCU.push(curCCULog.CCU);
                DataForChart[index].CCU_MIN.push(curCCULog.CCU_MIN);
                DataForChart[index].CCU_MAX.push(curCCULog.CCU_MAX);
                DataForChart[index].UpdateTime.push(curCCULog.UpdateTime);
            }
        }

        var CharDataIndexByGameID = -1;
        for (var i = 0; i < DataForChart.length; i++) {
            if (DataForChart[i].GameID == this.state.FilterGameID) {
                CharDataIndexByGameID = i;
                break;
            }
        }

        var currState = this.state;

        currState.Data = Data;

        if (CharDataIndexByGameID > -1) {
            currState.ChartData = this.GetChartData(DataForChart[CharDataIndexByGameID]);
        }

        this.setState(currState);
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
                    }
                    //formatter: function (value, index, values) {
                    //    var val = parseInt(value);
                    //    var Mil = '';
                    //
                    //    if (val >= 1000000) {
                    //        Mil = 'M';
                    //        val = Math.floor(val / 1000000);
                    //
                    //
                    //        return '' + val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + Mil;
                    //    } else {
                    //        return '' + val + Mil;
                    //    }
                    //}
                }
            },
            scales: {
                //yAxes: [{
                //    ticks: {
                //        padding: 40,
                //        callback: function (value, index, values) {
                //            var val = parseInt(value);
                //            var Mil = '';
                //
                //            if (val >= 1000000) {
                //                Mil = 'M';
                //                val = Math.floor(val / 1000000);
                //
                //
                //                return '' + val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + Mil;
                //            } else {
                //                return '' + val + Mil;
                //            }
                //        }
                //    }
                //}],
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

        return options;
    }

    GetChartData(Data) {
        var ChartData = {
            labels: [""].concat(this.FormatDateTimeToHour(Data.UpdateTime)),
            datasets: [
                {
                    label: "CCU Trung Bình",
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

                    data: [null].concat(Data.CCU),
                    datalabels: {
                        align: 'end',
                        anchor: 'end'
                    }
                },
                {
                    label: "CCU MAX",
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

                    data: [null].concat(Data.CCU_MAX),
                    datalabels: {
                        align: 'end',
                        anchor: 'end'
                    }
                },
                {
                    label: "CCU MIN",
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

                    data: [null].concat(Data.CCU_MIN),
                    datalabels: {
                        align: 'end',
                        anchor: 'end'
                    }
                }
            ]
        };

        return ChartData;
    }

    render() {

        var options = this.GetChartOptions();

        return (
            <div>
                <div className="layout">
                    <div className="box-body table-striped">
                        <table>
                            <tbody>
                            <tr>
                                <td>
                                    <div className="form-group">
                                        <div className="col-sm-1">
                                            <label className="paddingTop5">Ngày: </label>
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
                        <br></br>
                        <label className="paddingLeft10"> CCU hiện tại: {this.state.Data.CurrentCCU} </label>
                        {
                            this.state.Data.CCUDetail.map(function(Element, index){
                                return <div key={index}>
                                    <label className="paddingLeft10">{Element.GameName + ":" + Element.CCU}</label>
                                </div>
                            }.bind(this))
                        }
                        <br></br>
                        <div>
                            <br></br>
                        </div>
                        <div className="paddingTop3">
                            {this.state.Data.CCULog.length ?
                                <Line data={this.state.ChartData} options={options} width={1600} height={600}/>
                                : null}
                        </div>

                    </div>

                </div>
            </div>
        );

    }

    FormatDateTimeToHour(datetimeArr) {
        var result = [];
        for (var i = 0; i < datetimeArr.length; i++) {
            var dt = new Date(datetimeArr[i]);
            result.push(dt.getHours())
        }
        return result;
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

        console.log("dateFrom", DateFrom);
        console.log("dateTo", DateTo);

        var data = {
            DateFrom: DateFrom,
            DateTo: DateTo,
        };

        this.props.OnExecute(this.Action, data);
    }
}

export default LogCCU;
