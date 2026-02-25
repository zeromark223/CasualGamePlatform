import React, { Component } from 'react';
import '../css/App.css';
import 'react-table/react-table.css'

import {Table, Label, Button} from 'react-bootstrap';
import Datetime from 'react-datetime'
import Pagination from "react-js-pagination";

class LogGoldUser_Redis extends Component {
    constructor(props) {
        super(props);
        this.Action = this.props.Action;
        var now = new Date();

        this.state = {
            Responsed: false,
            Data: {
                Result: [],
            },
            ChartData: {},
            Request: {
                DateFrom: now,
                UserID: ""
            }
        };

        this.Pagination = {
            Result: {
                activePage: 1,
            },
            ItemPerPage: 50,
            pageRangeDisplayed: 5

        };

        var yyyy = now.getFullYear();
        var mm = this.pad(now.getMonth() + 1, 2);
        var dd = this.pad(now.getDate(), 2);
        var value = yyyy + '-' + mm + '-' + dd;

        this.DateByValue = {
            DateFrom: value
        };

        //this.OnExecute();
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

    OnUpdateState(Data) {

        //GameStatusArray_ForChart
        this.setState({
            Responsed: true,
            Data: Data,
            Request: this.state.Request
        })
    }

    render() {
        var ResultPagination = this.RenderPagination("Result");

        var ResultFrom = (this.Pagination.Result.activePage - 1) * this.Pagination.ItemPerPage;
        var ResultTo = (this.Pagination.Result.activePage) * this.Pagination.ItemPerPage;
        return (
            <div>
                <div>
                    <h1><Label>Log Gold User Redis: </Label></h1>

                    <br></br>
                    <div className="row">
                        <div className="col-sm-1">
                            <label className="paddingTop3"> Ngày: </label>
                        </div>

                        <div className="col-sm-2">
                            <Datetime onChange={(e) => this.OnDayChange(e, "DateFrom")} id="dateFrom"
                                      viewDate={this.state.Request.DateFrom}
                                      value={this.state.Request.DateFrom} timeFormat={false}/>
                        </div>
                    </div>

                    <br></br>
                    <div className="row">
                        <div className="col-sm-1">
                            <label className="paddingTop3"> UserID: </label>
                        </div>

                        <div className="col-sm-2">
                            <input type="text" id="UserID" value={this.state.Request.UserID}
                                   onChange={this.OnChange.bind(this)}></input>
                        </div>
                    </div>

                    <br></br>
                    <div className="row">
                        <div className="col-md-12">
                            <Button onClick={this.OnExecute.bind(this)}> Xem </Button>
                        </div>
                    </div>

                    {ResultPagination}
                    <div className="row">
                        <div className="col-md-12">
                            <div className="box-body table-striped">
                                <Table striped bordered condensed hover>
                                    <thead>
                                    <tr>
                                        <th>STT</th>
                                        <th>Time</th>
                                        <th>Gold</th>
                                        <th>ServerID</th>
                                        <th>DeskID</th>
                                        <th>Level</th>
                                        <th>Exp</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {
                                        this.state.Data.Result.map(function (DateStatus, index) {
                                            if(index >= ResultFrom && index < ResultTo) {
                                                return <tr key={index}>
                                                    <td>{index + 1}</td>
                                                    <td>{DateStatus.Time}</td>
                                                    <td>{this.FormatNumber(DateStatus.Gold)}</td>
                                                    <td>{DateStatus.ServerID}</td>
                                                    <td>{DateStatus.DeskID}</td>
                                                    <td>{DateStatus.Level}</td>
                                                    <td>{DateStatus.Exp}</td>
                                                </tr>
                                            }
                                        }.bind(this))
                                    }
                                    </tbody>
                                </Table>
                            </div>
                        </div>
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
        var DateFrom = this.DateByValue.DateFrom;
        var UserID = this.state.Request.UserID;

        console.log("dateFrom", DateFrom);

        var data = {
            DateFrom: DateFrom,
            UserID: UserID
            //DateTo: DateTo,
        };

        this.props.OnExecute(this.Action, data);
    }
}

export default LogGoldUser_Redis;
