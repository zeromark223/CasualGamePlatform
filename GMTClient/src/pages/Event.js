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
            Popup: {
                IsShow: false,
                Data: {
                    Result: []
                },
                Status: "",

                ConfirmPopup: false
            },
            Format: {
                Top: 50,
                FormatData: "1,10,50",
                Status: ""
            }
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
        else {
            if (PacketID == 23) {
                currState.Popup.IsShow = true;
                currState.Popup.Data = Data;

                this.setState(currState);
            }
        }
    }

    OnClosePopup() {
        var currState = this.state;
        currState.Popup.IsShow = false;
        currState.Popup.ConfirmPopup = false;
        currState.Popup.Status = "";
        currState.Format.Status = "";
        this.Popup_ClearInterval();
        this.setState(currState);
    }

    OnChangeFormat(event, ID) {
        var Value = event.target.value;
        this.state.Format[ID] = Value;
        this.setState(this.state);
    }


    render() {
        const classes = theme => ({
            button: {
                //margin: theme.spacing.unit,
            },
            leftIcon: {
                marginRight: theme.spacing.unit,
            },
            rightIcon: {
                marginLeft: theme.spacing.unit,
            },
            iconSmall: {
                fontSize: 20
            },
            root: {
                display: 'flex',
            },
            paper: {
                marginRight: theme.spacing.unit * 2,
            },
        });

        var style = {
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%'
        };
        var ConfirmPopup = this.Popup_CreateConfimPopup();
        var DataPopup = this.Popup_CreateDataPopup();
        var data;
        if (this.state.Sending) {
            data = <div>
                <Image style={style} src={Loader}/>
            </div>
        }
        else {
            data = <div>
                <h1><Label>Event: </Label></h1>

                <br></br>

                <div>
                    <div className="col-sm-1">
                        <label className="paddingTop3"> Lấy Top: </label>
                    </div>

                    <div className="col-sm-1">
                        <input id="Top" className="form-control"
                               type="number"
                               value={this.state.Format.Top}
                               onChange={(e) => this.OnChangeFormat(e, "Top")}
                            ></input>
                    </div>
                </div>

                <br></br>
                <br></br>

                <div className="box-body table-striped">
                    <table className="table table-striped">
                        <thead>
                        <tr>
                            <th>Tên Event</th>
                            <th></th>
                            <th>Thời gian bắt đầu</th>
                            <th>Thời gian kết thúc</th>
                            <th>Thời gian bắt đầu hiển thị trong game</th>
                            <th>Thời gian kết thúc hiển thị trong game</th>
                            <th>IsMaster</th>
                        </tr>
                        </thead>
                        <tbody>
                        {
                            this.state.Data.Result.map(function (Element, index) {
                                var IsMaster = Element.IsMaster;
                                var checkBox = <Checkbox disabled checked readOnly/>;
                                var Status = <Label bsStyle="success">Đang diễn ra</Label>;

                                if(!this.CheckActiveEvent(Element.StartTime, Element.EndTime)){
                                    Status = <Label>Đã kết thúc</Label>
                                }

                                if (!IsMaster) {
                                    checkBox = <Checkbox disabled/>
                                }

                                return <tr key={index}>
                                    <td>
                                        <label>{Element.EventName}</label>
                                    </td>
                                    <td>{Status}</td>
                                    <td>
                                        {this.FormatDateTime(Element.StartTime)}
                                    </td>
                                    <td>
                                        {this.FormatDateTime(Element.EndTime)}
                                    </td>
                                    <td>
                                        {this.FormatDateTime(Element.StartDisplayTime)}
                                    </td>
                                    <td>
                                        {this.FormatDateTime(Element.EndDisplayTime)}
                                    </td>
                                    <td>
                                        {checkBox}
                                    </td>
                                    <td>
                                        <Button
                                            onClick={this.HandleRedirect.bind(this, Element)}> Edit</Button>
                                    </td>

                                    <td>{
                                        Element.DataKey ?
                                            <Button
                                                onClick={this.HandleGetData.bind(this, Element.EventCode)}>
                                                Get Data
                                            </Button> : null
                                    }
                                    </td>

                                    <td>{
                                        Element.DataKey ?
                                            <Button
                                                bsStyle="danger"
                                                onClick={this.HandleClearData.bind(this, Element.EventCode, Element.EventName)}>
                                                Clear Data
                                            </Button> : null
                                    }
                                    </td>
                                </tr>
                            }.bind(this))
                        }
                        </tbody>
                    </table>
                </div>

                <div>
                    {DataPopup}
                </div>

                <div>
                    {ConfirmPopup}
                </div>
            </div >
        }

        return (
            <div>
                {data}
            </div>
        );
    }

    CheckActiveEvent(daystart, dayend){
        var now = +new Date();
        var start = +new Date(daystart);
        var end = +new Date(dayend);

        if(now >= start && now <= end){
            return true;
        }

        return false;
    }

    OnCopySuccess() {
        this.state.Popup.Status = "Đã Copy!";

        this.setState(this.state);
    }

    OnCopyFormatSuccess() {
        this.state.Format.Status = "Đã Copy!";

        this.setState(this.state);
    }


    CopyList() {
        var Result = "STT" + "\t" + "Tên nhân vật" + "\t" + "Điểm" + "\t" + "UserID" + "\t" + "UID" + "\r\n";
        for (var i = 0; i < this.state.Popup.Data.Result.length; i++) {
            var tmp = this.state.Popup.Data.Result[i];
            Result += i+1 + "\t" + tmp.GameName + "\t" + tmp.Score + "\t" + tmp.UserID + "\t" + tmp.AccountID + "\r\n"
        }
        return Result;
    }

    CopyList_Format(){
        var Result = this.FormatData();

        return Result;
    }

    FormatData() {
        var Result = "";
        var Index = 0;
        var FormatArr = this.state.Format.FormatData.split(',');
        var arr = this.state.Popup.Data.Result;

        for (var i = 0; i < arr.length; i++) {
            Result += arr[i].AccountID;
            if (i + 1 == +FormatArr[Index].trim()) {

                Result += "\n\r";
                Index++;
                if(Index >= FormatArr.length){
                    break;
                }
            }
            else {
                Result += ";";
            }
        }

        return Result;
    }

    Popup_OnCancel() {
        this.state.Popup.ConfirmPopup = false;
        this.ChosenEvent = "";
        this.Popup_ClearInterval();

        this.setState(this.state);
    }

    Popup_OnConfirm() {
        if (this.ConfirmButtonTime == 0) {
            this.state.Popup.ConfirmPopup = false;
            this.state.Sending = true;
            var Action = PacketConfig.DeleteEventData;
            var Data = {
                EventCode: this.ChosenEventCode
            };

            this.props.OnExecute(Action, Data);
            this.setState(this.state);

            setTimeout(function () {
                this.OnExecute();
            }.bind(this), 500)
        }
        else {

        }
    }

    Popup_CreateDataPopup() {
        var scrollbarStyles = {borderRadius: 5};
        return <Popup
            open={this.state.Popup.IsShow}
            onClose={this.OnClosePopup.bind(this)}
            closeOnDocumentClick
            position="right center">
            <div>
                <ScrollArea
                    className="area"
                    contentClassName="content"
                    verticalScrollbarStyle={scrollbarStyles}
                    verticalContainerStyle={scrollbarStyles}
                    horizontalScrollbarStyle={scrollbarStyles}
                    horizontalContainerStyle={scrollbarStyles}
                    smoothScrolling={true}
                    minScrollSize={40}
                    onScroll={this.handleScroll}
                    >
                    <div className="row">
                        <div className="col-md-3">
                            <Clipboard option-text={this.CopyList.bind(this)}
                                       className="btn btn-success"
                                       button-title="I'm a tooltip"
                                       onSuccess={this.OnCopySuccess.bind(this)}>
                                Copy tất cả
                            </Clipboard>
                            <Label bsStyle="danger">{this.state.Popup.Status}</Label>
                        </div>

                        <div className="col-md-3">
                            <input id="FormatData" className="form-control"
                                   value={this.state.Format.FormatData}
                                   onChange={(e) => this.OnChangeFormat(e, "FormatData")}></input>
                        </div>

                        <div className="col-md-4">
                            <Clipboard option-text={this.CopyList_Format.bind(this)}
                                       className="btn btn-success"
                                       button-title="I'm a tooltip"
                                       onSuccess={this.OnCopyFormatSuccess.bind(this)}>
                                Copy theo AccountID
                            </Clipboard>
                            <Label bsStyle="danger">{this.state.Format.Status}</Label>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-12">
                            <div className="box-body table-striped">
                                <table className="table table-striped">
                                    <thead>
                                    <tr>
                                        <th>No.</th>
                                        <th>UserID:</th>
                                        <th>AccountID</th>
                                        <th>GameName</th>
                                        <th>Score</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {
                                        this.state.Popup.Data.Result.map(function (Element, index) {
                                            return <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{Element.UserID}</td>
                                                <td>{Element.AccountID}</td>
                                                <td>{Element.GameName}</td>
                                                <td>{Element.Score}</td>
                                            </tr>
                                        }.bind(this))
                                    }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </div>

        </Popup>
    }

    Popup_CreateConfimPopup() {
        var additionalText = "";
        if (this.ConfirmButtonTime > 0) {
            additionalText = "(" + this.ConfirmButtonTime + ")";
        }

        var Result = <div className="custom_popup">
            <Popup

                open={this.state.Popup.ConfirmPopup}
                onClose={this.OnClosePopup.bind(this)}
                closeOnDocumentClick
                position="right center"
                contentStyle={{width: "20%", border: "3px solid #73AD21" }}>
                <div>
                    <div className="row">
                        <div className="col-sm-12">
                            <div className="center">
                                {"Chắc chắn muốn xóa dữ liệu Event: " + this.ChosenEvent}
                            </div>
                        </div>
                    </div>

                    <br></br>

                    <div className="row">
                        <div className="col-sm-6">
                            <div className="center">
                                <Button disabled={this.ConfirmButtonTime > 0}
                                        onClick={this.Popup_OnConfirm.bind(this)}>{"Confirm" + additionalText}</Button>
                            </div>
                        </div>
                        <div className="col-sm-6">
                            <div className="center">
                                <Button onClick={this.Popup_OnCancel.bind(this)}>Cancel</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Popup>
        </div>

        return Result
    }

    Popup_ClearInterval() {
        if (this.state.Popup.ConfirmPopup == false) {
            this.ChosenEventCode = "";
            this.ConfirmButtonTime = 5;
            clearInterval(this.ConfirmButtonTimeout);
        }
    }

    HandleTimer() {
        if (this.ConfirmButtonTime > 0) {
            this.ConfirmButtonTime--;
            this.setState(this.state);
        }
        else {
            this.Popup_ClearInterval();
        }
    }

    HandleClearData(EventCode, EventName) {
        this.state.Popup.ConfirmPopup = true;
        this.ChosenEvent = EventName;
        this.ChosenEventCode = EventCode;

        this.ConfirmButtonTimeout = setInterval(function () {
            this.HandleTimer();
        }.bind(this), 1000)

        this.setState(this.state);
    }

    HandleGetData(EventCode) {
        var Action = PacketConfig.GetEventData;

        var data = {
            EventCode: EventCode,
            Top: this.state.Format.Top
        };

        this.props.OnExecute(Action, data);
    }

    HandleRedirect(Element) {
        var actionCode = PacketConfig.UpdateEvent;
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
