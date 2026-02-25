import React, { Component } from 'react';
import '../css/App.css';
import '../css/site.css';
import ReactTable from 'react-table'
import 'react-table/react-table.css'

import {Image, Checkbox , Table, Label, Button, ButtonToolbar, DropdownButton, MenuItem, Glyphicon, Dropdown} from 'react-bootstrap';
import Datetime from 'react-datetime'
import MenuRounded from '@material-ui/icons/MenuRounded';
import Popup from "reactjs-popup";
import Clipboard from 'react-clipboard.js';
import ScrollArea from 'react-scrollbar';


var Loader = require('../resource/loader.gif');
var PacketConfig = require('../Config/PacketConfig');

class Event extends Component {
    constructor(props) {
        super(props);
        this.Action = this.props.Action;

        this.state = {
            Responsed: false,
            Data: {
                Result: [],
            },
            Sending: false,
        };

        this.ConfirmStatus = false;
        this.ChosenEvent = "";
        this.ConfirmButtonTime = 5;
        this.ConfirmButtonTimeout = 0;
        this.ChosenEventCode = "";
    }

    componentDidMount() {
        this.OnExecute();
    }

    OnUpdateState(Data) {
        var PacketID = this.props.PacketID;
        var currState = this.state;
        currState.Sending = false;

        if (PacketID == this.Action) {

            currState.Data = Data;


            this.setState(currState);
        }
    }

    OnChangeFormat(event, ID) {
        var Value = event.target.value;
        this.state.Format[ID] = Value;
        this.setState(this.state);
    }


    render() {
        var style = {
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%'
        };

        var data;
        if (this.state.Sending) {
            data = <div>
                <Image style={style} src={Loader}/>
            </div>
        }
        else {
            data = <div>
                <h1><Label>Bài viết: </Label></h1>

                <br></br>
                <Button
                    className="glyphicon glyphicon-plus"
                    bsStyle="success"
                    onClick={this.HandleAddEvent.bind(this, Element)}>Thêm</Button>
                <br></br>
                <br></br>

                <div className="box-body table-striped">
                    <table className="table table-striped">
                        <thead>
                        <tr>
                            <th>Tên Event</th>
                            <th></th>
                            <th>Mã Event</th>
                            <th>Thời gian bắt đầu</th>
                            <th>Thời gian kết thúc</th>
                        </tr>
                        </thead>
                        <tbody>
                        {
                            this.state.Data.Result.map(function (Element, index) {
                                var Status = <Label bsStyle="success">Đang diễn ra</Label>;

                                if (!this.CheckActiveEvent(Element.TimeStart, Element.TimeEnd)) {
                                    Status = <Label>Đã kết thúc</Label>
                                }


                                return <tr key={index}>
                                    <td>
                                        <label>{Element.EventName}</label>
                                    </td>
                                    <td>{Status}</td>
                                    <td>{Element.EventCode}</td>
                                    <td>
                                        {this.FormatDateTime(Element.TimeStart)}
                                    </td>
                                    <td>
                                        {this.FormatDateTime(Element.TimeEnd)}
                                    </td>
                                    <td>{
                                        <Button
                                            bsStyle="danger"
                                            onClick={this.HandleDeleteEvent.bind(this, Element.EventID)}>
                                            Xóa
                                        </Button>
                                    }
                                    </td>
                                    <td>
                                        <Button
                                            onClick={this.HandleRedirect.bind(this, Element)}> Sửa</Button>
                                    </td>
                                </tr>
                            }.bind(this))
                        }
                        </tbody>
                    </table>
                </div>
            </div >
        }

        return (
            <div>
                {data}
            </div>
        );
    }

    CheckActiveEvent(daystart, dayend) {
        var now = +new Date();
        var start = +new Date(daystart);
        var end = +new Date(dayend);

        if (now >= start && now <= end) {
            return true;
        }

        return false;
    }

    HandleDeleteEvent(EventID) {
        var action = PacketConfig.DeleteArticle;
        var data = {
            EventID: EventID
        };

        if(window.confirm("Có chắc chắn muốn xóa????")){
            this.props.OnExecute(action, data);

            setTimeout(function(){
                this.OnExecute();
            }.bind(this), 1000);
        }
    }

    HandleAddEvent() {
        var actionCode = PacketConfig.AddArticle;
        this.props.OnRedirect(actionCode, {});
    }

    HandleRedirect(Element) {
        var actionCode = PacketConfig.EditArticle;
        this.props.OnRedirect(actionCode, Element);
    }

    pad(num, size) {
        var s = num + "";
        while (s.length < size) s = "0" + s;
        return s;
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

    OnExecute() {
        var currState = this.state;
        currState.Sending = true;
        this.setState(currState);

        var data = {};

        this.props.OnExecute(this.Action, data);
    }
}

export default Event;
