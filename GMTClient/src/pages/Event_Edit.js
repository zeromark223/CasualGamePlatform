import React, { Component } from 'react';
import '../css/App.css';
import ReactTable from 'react-table'
import 'react-table/react-table.css'

import {Image, Checkbox , Table, Label, Button, ButtonToolbar, DropdownButton, MenuItem, Glyphicon, Dropdown} from 'react-bootstrap';
import Datetime from 'react-datetime'

var Loader = require('../resource/loader.gif');
var EventConfig = require('../Config/EventConfig')

class Event_Edit extends Component {
    constructor(props) {
        super(props);
        this.Action = this.props.Action;

        var RedirectData = this.props.RedirectData;
        this.state = {
            Responsed: false,
            Data: {
                RedirectData: RedirectData
            },
            Sending: false,
        };

        this.SpecialCaseData = {};
        this.Warning = "";

        this.SpecialCaseData = JSON.parse(this.state.Data.RedirectData.Config);
        this.GenerateSpecialData(RedirectData);
    }

    componentDidMount() {
        //this.OnExecute();
    }

    componentWillMount() {
    }

    OnUpdateState(Data) {
        //this.setState({
        //    Responsed: true,
        //    Data: Data,
        //    Sending: false
        //})
    }

    GenerateSpecialData(RedirectData) {
        this.SpecialCaseData = JSON.parse(this.state.Data.RedirectData.Config);
        var Result = [];
        if (RedirectData.EventCode == "PokerMiniCollectItem") {
            for (var i = 0; i < 52; i++) {
                var Obj = {};
                Obj[i] = 0;
                Result.push(Obj);
                for (var prop in this.SpecialCaseData) {
                    if (prop == i) {
                        Result[i][i] = this.SpecialCaseData[prop];
                    }
                }
            }

        }

        return Result;
    }

    FindEventConfig() {
        var Config = JSON.parse(this.state.Data.RedirectData.Config);

        for (var i = 0; i < EventConfig.EventConfig.length; i++) {
            if (this.state.Data.RedirectData.EventCode == EventConfig.EventConfig[i].EventCode) {
                //special case
                if (this.state.Data.RedirectData.EventCode == "SlotCollectItem"
                    || this.state.Data.RedirectData.EventCode == "SlotWinLose") {

                    if (typeof this.state.Data.RedirectData.EventConfig == 'undefined') {
                        this.Warning = "Vui lòng liên hệ dev để chỉnh sửa";
                        this.state.Data.RedirectData.EventConfig = JSON.stringify(Config);
                    }

                    return EventConfig.EventConfig[i];
                }

                var Menu = EventConfig.EventConfig[i].Menu;

                for (var j = 0; j < Menu.length; j++) {
                    if (typeof this.state.Data.RedirectData[Menu[j].Prop] == 'undefined') {
                        this.state.Data.RedirectData[Menu[j].Prop] = Config[Menu[j].Prop];
                    }
                }

                return EventConfig.EventConfig[i];
            }
        }

        return 0;
    }

    OnDataChange(event, ID) {
        var Value = event.target.value;
        this.state.Data.RedirectData[ID] = Value;
        this.setState(this.state);
    }

    OnDataListChange(event, Prop, index, ID) {
        var Value = event.target.value;

        //if (Value >= 0)
        {
            this.state.Data.RedirectData[Prop][index][ID] = Value;
            this.setState(this.state);
        }
    }

    OnAddDataToList(currMenu, MainProp) {
        var obj = {};

        for (var i = 0; i < currMenu.length; i++) {
            obj[currMenu[i].Prop] = 0;
        }

        this.state.Data.RedirectData[MainProp].push(obj);
        this.setState(this.state);
    }

    OnRemoveDataFromList(MainProp, index) {
        this.state.Data.RedirectData[MainProp].splice(index, 1);
        this.setState(this.state);
    }

    RenderSpecialCase() {
        if (this.state.Data.RedirectData.EventCode == "SlotWinLose") {

            if (typeof this.SpecialCaseData["401"] == "undefined") {
                this.SpecialCaseData["401"] = {
                    WinRatio: 0,
                    LoseRatio: 0
                }
            }

            if (typeof this.SpecialCaseData["402"] == "undefined") {
                this.SpecialCaseData["402"] = {
                    WinRatio: 0,
                    LoseRatio: 0
                }
            }

            return <tr>
                <td>
                    <div className="form-group">
                        <div className="col-sm-2"></div>
                        <div className="col-sm-8">
                            <Checkbox className="row"
                                      value={parseInt(this.SpecialCaseData["401"].LoseRatio)}
                                      checked={parseInt(this.SpecialCaseData["401"].LoseRatio)}
                                      onChange={this.HandleSpecialCaseData.bind(this, "401", "LoseRatio")}
                                > Xả đạn Tứ Long </Checkbox>
                            <Checkbox className="row"
                                      value={parseInt(this.SpecialCaseData["401"].WinRatio)}
                                      checked={parseInt(this.SpecialCaseData["401"].WinRatio)}
                                      onChange={this.HandleSpecialCaseData.bind(this, "401", "WinRatio")}
                                > Thắng Gold Tứ Long </Checkbox>
                            <Checkbox className="row"
                                      value={parseInt(this.SpecialCaseData["402"].LoseRatio)}
                                      checked={parseInt(this.SpecialCaseData["402"].LoseRatio)}
                                      onChange={this.HandleSpecialCaseData.bind(this, "402", "LoseRatio")}
                                > Xả đạn Hoa Quả </Checkbox>
                            <Checkbox className="row"
                                      value={parseInt(this.SpecialCaseData["402"].WinRatio)}
                                      checked={parseInt(this.SpecialCaseData["402"].WinRatio)}
                                      onChange={this.HandleSpecialCaseData.bind(this, "402", "WinRatio")}
                                > Thắng Gold Hoa Quả </Checkbox>
                        </div>
                    </div>
                </td>
            </tr>
        }

        if (this.state.Data.RedirectData.EventCode == "PokerMiniCollectItem") {
            this.SpecialCaseData = this.GenerateSpecialData(this.state.Data.RedirectData);
            return <tr>
                <td>
                    <div className="form-group">
                        <div className="col-sm-2"></div>
                        <div className="col-sm-8">
                            {
                                this.SpecialCaseData.map(function (Element, index) {
                                    var name = this.getNameById(index);
                                    var style = this.getSuitColor(index);
                                    return <div className="row" key={index}>
                                        <div className="col-sm-2" style={style}><h4>{name}</h4></div>
                                        <div className="col-sm-4">
                                            <input className="form-control"
                                                   id={index}
                                                   onChange={(e) => this.OnChangePokerInput(e, index)}
                                                   value={Element[index]}></input>
                                        </div>
                                    </div>

                                }.bind(this))
                            }
                        </div>
                    </div>
                </td>
            </tr>
        }

        return 0;
    }

    OnChangePokerInput(event, Prop) {
        var Value = event.target.value;
        this.ParsePokerConfig(Prop, Value);
        this.setState(this.state);
    }

    ParsePokerConfig(Prop, Value){
        if(Value == ""){
            Value = "0";
        }
        var Config = JSON.parse(this.state.Data.RedirectData.Config);
        Config[Prop] = Value;
        this.state.Data.RedirectData.Config = JSON.stringify(Config);
    }

    getSuitColor(id){
        var Suit = id % 4;
        var Result = {color: 'black'}

        if(Suit < 2){
            //Do
            Result.color = 'red';
        }

        return Result;
    }

    getNameById(id) {
        var Num = Math.floor(id / 4) + 1;
        var Suit = id % 4;

        switch (Num){
            case 1:
                Num = "A";
                break;
            case 11:
                Num = "J";
                break;
            case 12:
                Num = "Q";
                break;
            case 13:
                Num = "K";
                break;
            default:
                break;
        }

        switch(Suit){
            case 0:
                Suit = '\u2665'; //Co
                break;
            case 1:
                Suit = '\u2666'; //go
                break;
            case 2:
                Suit = '\u2663';//chuon
                break;
            case 3:
                Suit = '\u2660';//bitch
                break;
            default:
                break;
        }

        //return Num + ' ' + Suit.toString().replace('0', '\u2666').replace('1', '\u2666').replace('2', 'Chuôn').replace('3', '&#9824;')
        //return Num + ' ' + Suit.toString().replace('0', 'Cơ').replace('1', 'Rô').replace('2', 'Chuôn').replace('3', 'Bích')

        return Num + Suit;

    }

    HandleSpecialCaseData(Prop, SubProp) {
        var Value = +(this.SpecialCaseData[Prop][SubProp]);
        this.SpecialCaseData[Prop][SubProp] = Value == 0 ? 1 : 0;
        this.setState(this.state);
    }

    RenderEventConfig() {
        var currEventConfig = this.FindEventConfig(this.state.Data.RedirectData.EventCode);
        var Result = null;

        Result = this.RenderSpecialCase();
        if (Result != 0) {
            return Result;
        }

        if (currEventConfig != 0) {
            Result = currEventConfig.Menu.map(function (currMenu, index) {
                var SubMenuLen = currMenu.SubMenu.length;
                return <tr key={index}>
                    <td>
                        <div className="form-group">
                            <label className="col-sm-2">{currMenu.Name}</label>

                            <div className="col-sm-8">
                                {
                                    SubMenuLen > 0 ?
                                        <div>
                                            {
                                                this.state.Data.RedirectData[currMenu.Prop].map(function (Element, index) {
                                                    return <div className="row" key={index}>
                                                        #{index + 1}
                                                        <Button
                                                            className="glyphicon glyphicon-minus"
                                                            bsStyle="danger"
                                                            bsSize="xsmall"
                                                            onClick={this.OnRemoveDataFromList.bind(this, currMenu.Prop, index)}
                                                            ></Button>
                                                        <br></br>
                                                        <br></br>
                                                        {
                                                            currMenu.SubMenu.map(function (SubElement, SubIndex) {
                                                                return <div
                                                                    className="form-group"
                                                                    key={SubIndex}>
                                                                    <label
                                                                        className="col-sm-2">{SubElement.Name}</label>

                                                                    <div className="col-sm-10">
                                                                        <input
                                                                            id={SubIndex}
                                                                            key={index}
                                                                            className="form-control"
                                                                            onChange={(e) => this.OnDataListChange(e,currMenu.Prop, index, SubElement.Prop)}
                                                                            value={Element[SubElement.Prop]}
                                                                            >
                                                                        </input>
                                                                    </div>
                                                                </div>
                                                            }.bind(this))
                                                        }
                                                    </div>
                                                }.bind(this))
                                            }
                                            <Button className="glyphicon glyphicon-plus"
                                                    bsStyle="success"
                                                    onClick={this.OnAddDataToList.bind(this, currMenu.SubMenu, currMenu.Prop)}>Add</Button>
                                        </div>
                                        : <input id={currMenu.Prop} className="form-control"
                                                 value={this.state.Data.RedirectData[currMenu.Prop]}
                                                 onChange={(e) => this.OnDataChange(e, currMenu.Prop)}
                                                 placeholder={"Nhập " + currMenu.Name + '...'}
                                        ></input>
                                }
                            </div>
                        </div>
                    </td>
                </tr>
            }.bind(this))
        }

        return Result;
    }

    render() {
        var AdditionalMenu = this.RenderEventConfig();

        var style = {
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%'
        };
        var data;
        var StartTime = new Date(this.state.Data.RedirectData.StartTime);
        var EndTime = new Date(this.state.Data.RedirectData.EndTime);
        var StartDisplayTime = new Date(this.state.Data.RedirectData.StartDisplayTime);
        var EndDisplayTime = new Date(this.state.Data.RedirectData.EndDisplayTime);

        if (this.state.Sending) {
            data = <div>
                <Image style={style} src={Loader}/>
            </div>
        }
        else {
            data = <div>
                <h1><Label>Cập nhật Event: </Label></h1>
                <br></br>
                <br></br>

                <h1><Label bsStyle="danger">{this.Warning}</Label></h1>

                <div className="box-body table-striped">
                    <table className="table table-striped">
                        <tbody>
                        <tr>
                            <td>
                                <div className="form-group">
                                    <label className="col-sm-2">Tên Event:</label>

                                    <div className="col-sm-4">
                                        <input id="BossID" className="form-control"
                                               value={this.state.Data.RedirectData.EventName}
                                               onChange={(e) => this.OnDataChange(e, "EventName")}
                                            ></input>
                                    </div>
                                </div>
                            </td>
                        </tr>

                        <tr>
                            <td>
                                <div className="form-group">
                                    <label className="col-sm-2">Tên Event tiếng Anh:</label>

                                    <div className="col-sm-4">
                                        <input id="BossID" className="form-control"
                                               value={this.state.Data.RedirectData.EventName_En}
                                               onChange={(e) => this.OnDataChange(e, "EventName_En")}
                                            ></input>
                                    </div>
                                </div>
                            </td>
                        </tr>

                        <tr>
                            <td>
                                <div className="form-group">
                                    <label className="col-sm-2">Thời gian diễn ra:</label>

                                    <div className="col-sm-2">
                                        <Datetime onChange={(e) => this.OnTimeChange(e, "StartTime")}
                                                  id="StartTime"
                                                  viewDate={StartTime}
                                                  value={StartTime}/>
                                    </div>

                                    <div className="col-sm-2">
                                        <Datetime onChange={(e) => this.OnTimeChange(e, "EndTime")}
                                                  id="EndTime"
                                                  viewDate={EndTime}
                                                  value={EndTime}/>
                                    </div>
                                </div>
                            </td>
                        </tr>

                        <tr>
                            <td>
                                <div className="form-group">
                                    <label className="col-sm-2">Thời gian hiển thị trong game:</label>

                                    <div className="col-sm-2">
                                        <Datetime onChange={(e) => this.OnTimeChange(e, "StartDisplayTime")}
                                                  id="StartTime"
                                                  viewDate={StartDisplayTime}
                                                  value={StartDisplayTime}/>
                                    </div>

                                    <div className="col-sm-2">
                                        <Datetime onChange={(e) => this.OnTimeChange(e, "EndDisplayTime")}
                                                  id="EndTime"
                                                  viewDate={EndDisplayTime}
                                                  value={EndDisplayTime}/>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        {AdditionalMenu}
                        </tbody>
                    </table>

                    <table>
                        <tbody>
                        <tr>
                            <td>

                            </td>
                        </tr>
                        <tr>
                            <td>
                                <Button className="btn btn-success" onClick={this.OnExecute.bind(this)}>Cập
                                    nhật</Button>
                            </td>
                        </tr>
                        </tbody>
                    </table>

                </div>


            </div>
        }

        return (
            <div>
                {data}
            </div>
        );
    }

    OnTimeChange(time, ID, index) {
        this.state.Data.RedirectData[ID] = time._d;
        this.setState(this.state);
    }

    HandleUpdate(Element) {
        try {


            var Data = {
                EventCode: Element.EventCode,
                StartTime: this.FormatDateTime(Element.StartTime),
                EndTime: this.FormatDateTime(Element.EndTime),
                StartDisplayTime: this.FormatDateTime(Element.StartDisplayTime),
                EndDisplayTime: this.FormatDateTime(Element.EndDisplayTime),
            };

            this.props.OnExecute(this.Action, Data);

            setTimeout(function () {
                this.OnExecute();
            }.bind(this), 500);
        }
        catch (e) {
            console.log("HandleUpdate error: failed to parse Value", e.stack);
        }
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

        var ConfigData = {};
        var EventName = {
            userMsg: this.state.Data.RedirectData.EventName,
            userMsgEn: this.state.Data.RedirectData.EventName_En,
        };

        var currEventConfig = this.FindEventConfig();
        if (currEventConfig != 0) {
            for (var i = 0; i < currEventConfig.Menu.length; i++) {
                var currMenu = currEventConfig.Menu[i];
                ConfigData[currMenu.Prop] = this.state.Data.RedirectData[currMenu.Prop];
            }
        }

        if (this.state.Data.RedirectData.EventCode == "SlotCollectItem"
            || this.state.Data.RedirectData.EventCode == "SlotWinLose") {
            ConfigData = JSON.parse(ConfigData.EventConfig);
        }

        if (this.state.Data.RedirectData.EventCode == "SlotWinLose") {
            ConfigData = this.GenerateSpecialDataToConfigData();
        }

        if(this.state.Data.RedirectData.EventCode == "PokerMiniCollectItem"){
            ConfigData = this.GenerateSpecialDataToConfigData();
        }

        var Data = {
            EventCode: this.state.Data.RedirectData.EventCode,
            StartTime: this.FormatDateTime(this.state.Data.RedirectData.StartTime),
            EndTime: this.FormatDateTime(this.state.Data.RedirectData.EndTime),
            StartDisplayTime: this.FormatDateTime(this.state.Data.RedirectData.StartDisplayTime),
            EndDisplayTime: this.FormatDateTime(this.state.Data.RedirectData.EndDisplayTime),
            Config: JSON.stringify(ConfigData),
            EventName: JSON.stringify(EventName)
        };

        this.props.OnExecute(this.Action, Data);

        setTimeout(function () {
            this.props.OnRedirect(21, {});
        }.bind(this), 500);
    }

    GenerateSpecialDataToConfigData() {
        var Result = 0;
        if (this.state.Data.RedirectData.EventCode == "SlotWinLose") {
            //convert to int
            this.SpecialCaseData["401"].WinRatio = +this.SpecialCaseData["401"].WinRatio;
            this.SpecialCaseData["401"].LoseRatio = +this.SpecialCaseData["401"].LoseRatio;
            this.SpecialCaseData["402"].WinRatio = +this.SpecialCaseData["402"].WinRatio;
            this.SpecialCaseData["402"].LoseRatio = +this.SpecialCaseData["402"].LoseRatio;

            Result = this.SpecialCaseData;
        }

        if(this.state.Data.RedirectData.EventCode == "PokerMiniCollectItem"){
            Result = {}
            for(var i = 0; i < this.SpecialCaseData.length; i++){
                var Value = parseFloat(this.SpecialCaseData[i][i]);

                if(Value > 0){
                    Result[i] = Value;
                }
            }
        }

        return Result;
    }
}

export default Event_Edit;
