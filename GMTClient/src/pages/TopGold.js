import React, { Component } from 'react';
import '../css/App.css';
import 'react-table/react-table.css'

import {Table, Button} from 'react-bootstrap';

class TotalSystemGold extends Component {
    constructor(props) {
        super(props);
        this.Action = this.props.Action;

        this.state = {
            Responsed: false,
            Data: {
                TopGoldResponse: [],
            },
            Top: 50
        };

        this.OnExecute();
    }

    OnUpdateState(Data) {
        this.state.Response = true;
        this.state.Data = Data;
        this.setState(this.state);
    }

    OnChangeFormat(event, ID) {
        var Value = event.target.value;
        this.state[ID] = Value;

        if(Value > 5000){
            window.alert("Số quá lớn");
            return;
        }

        this.setState(this.state);
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

    pad(num, size) {
        var s = num + "";
        while (s.length < size) s = "0" + s;
        return s;
    }

    render() {
        return (
                <div>
                    <div className="layout">
                        <div className="row">
                            <div className="col-sm-1">
                                <label className="paddingTop3"> Top: </label>
                            </div>

                            <div className="col-sm-2">
                                <input id="Top" className="form-control"
                                       type="number"
                                       value={this.state.Top}
                                       onChange={(e) => this.OnChangeFormat(e, "Top")}
                                    ></input>
                            </div>
                        </div>
                        <Button onClick={this.OnExecute.bind(this)}>Xem</Button>


                        <div className="box-body table-striped">
                            <br></br>

                            <Table striped bordered condensed hover>
                                <thead>
                                <tr>
                                    <th>UserID</th>
                                    <th>Nick</th>
                                    <th>Money</th>
                                    <th>Thời gian</th>
                                </tr>
                                </thead>
                                <tbody>
                                {
                                    this.state.Data.TopGoldResponse.map(function(User, index){
                                        return <tr key={index}>
                                            <td>{User.UserID}</td>
                                            <td>{User.Nick}</td>
                                            <td>{this.FormatNumber(User.Money)}</td>
                                            <td>{this.FormatDateTime(User.UpdateTime)}</td>
                                        </tr>
                                    }.bind(this))
                                }
                                </tbody>
                            </Table>
                        </div>


                    </div>
                </div>
        );
    }

    OnExecute() {
        var data = {
            Top: this.state.Top
        };

        this.props.OnExecute(this.Action, data);
    }
}

export default TotalSystemGold;
