import React, { Component } from 'react';
import '../css/App.css';
import ReactTable from 'react-table'
import 'react-table/react-table.css'

//import Button from 'react-bootstrap/lib/Button';

import {Button, ButtonToolbar, DropdownButton, MenuItem, Glyphicon} from 'react-bootstrap';

import 'bootstrap/dist/css/bootstrap.min.css';

class GlobalBoss extends Component {
    constructor(props) {
        super(props);
        this.Action = this.props.Action;

        this.state = {
            Responsed: false,
            Data: {
                Result: [],
                PreData: []
            }
        };

        this.Language = [
            {
                LangCode: 0,
                LangName: 'Tiếng Việt'
            },
            {
                LangCode: 1,
                LangName: 'Tiếng Anh'
            }
        ];

        this.OnInitData();
    }

    OnInitData() {
        this.OnExecute(this.Action, {});
    }

    OnUpdateState(Data) {

        for (var i = 0; i < Data.Result.length; i++) {
            var _Data = Data.Result[i];
            //_Data.TimeStart = this.FormatTime(_Data.TimeStart);
            //_Data.TimeEnd = this.FormatTime(_Data.TimeEnd);
        }

        this.setState({
            Responsed: true,
            Data: Data
        })
    }

    FormatTime(time) {
        var Result = "";

        var minute = this.pad(time % 60, 2);
        var hour = Math.floor(time / 60) % 24;


        hour = this.pad(hour, 2);

        Result = hour + ":" + minute;
        console.log("time:", time, "Result:", Result);
        return Result;
    }

    pad(num, size) {
        var s = num + "";
        while (s.length < size) s = "0" + s;
        return s;
    }

    render() {
        //BossID, KindID, FishKind, MaxHp, RoundTime, RoundCount, Delay, BossCount, TotalGoldHit, GoldHitMultiple, GoldHitRatio, LastHitGold, DayStart, DayEnd, TimeStart, TimeEnd

        var bgColors = {
            "Default": "#81b71a",
            "Blue": "#00B1E1",
            "Cyan": "#37BC9B",
            "Green": "#8CC152",
            "Red": "#E9573F",
            "Yellow": "#F6BB42",
        };

        //style={{backgroundColor: bgColors.Yellow}}

        return (
            <div>
                <div className="layout">
                    <h1 id="dataTitle">Broadcast: </h1>
                    <Button onClick={this.HandleAdd.bind(this)} className="glyphicon glyphicon-plus" bsStyle="success"> Thêm</Button>


                    <div className="box">
                        <div className="box-body table-striped">
                            <table className="table table-striped">
                                <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Text</th>
                                    <th>URL</th>
                                    <th>Ngôn ngữ</th>
                                    <th>Độ ưu tiên</th>
                                    <th>Thời gian lặp lại</th>
                                    <th>Thời gian bắt đầu</th>
                                    <th>Thời gian kết thúc</th>
                                </tr>
                                </thead>
                                <tbody>
                                {
                                    this.state.Data.Result.map(function (Broadcast, index) {
                                        return <tr key={index}>
                                            <td>{Broadcast.ID}</td>
                                            <td>{Broadcast.Text}</td>
                                            <td>{Broadcast.URL}</td>
                                            <td>{this.Language.map(function (Language, index) {
                                                if (Broadcast.LangCode == Language.LangCode) {
                                                    return Language.LangName;
                                                }
                                            })}</td>
                                            <td>{Broadcast.Priority}</td>
                                            <td>{Broadcast.Interval}</td>
                                            <td>{Broadcast.StartTime}</td>
                                            <td>{Broadcast.EndTime}</td>

                                            <td>
                                                <span className="glyphicon glyphicon-pencil"
                                                      onClick={this.HandleUpdate.bind(this, Broadcast)}></span>
                                            </td>
                                            <td>
                                                <span className="glyphicon glyphicon-trash"
                                                      onClick={this.HandleDelete.bind(this, Broadcast.ID)}></span>
                                            </td>
                                        </tr>
                                    }.bind(this))
                                }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    HandleDelete(ID) {
        var del = window.confirm('Chắc chắn muốn xóa?');

        if (del) {
            var data = {
                ID: ID
            };

            this.props.OnExecute(16, data);

            setTimeout(function () {
                this.OnInitData();
                //this.OnUpdateState(this.props.Data);
            }.bind(this), 500);
        }
    }

    HandleUpdate(Object) {
        this.props.OnRedirect(15, Object);
    }

    HandleAdd() {
        this.props.OnRedirect(17, {});
    }

    OnExecute() {
        var data = {};

        this.props.OnExecute(this.Action, data);
    }
}

export default GlobalBoss;
