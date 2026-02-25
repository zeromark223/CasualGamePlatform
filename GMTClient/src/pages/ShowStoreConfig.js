import React, { Component } from 'react';
import '../css/App.css';
import ReactTable from 'react-table'
import 'react-table/react-table.css'

import {Image, Checkbox , Table, Label, Button, ButtonToolbar, DropdownButton, MenuItem, Glyphicon, Dropdown} from 'react-bootstrap';
import Datetime from 'react-datetime'

var Loader = require('../resource/loader.gif');
var EventConfig = require('../Config/EventConfig')

class ShowStoreConfig extends Component {
    constructor(props) {
        super(props);
        this.Action = this.props.Action;

        var RedirectData = this.props.RedirectData;
        this.state = {
            Responsed: false,
            Data: {
                AwardOnlineCount : 0,
                AwardDailyCount : 0,
                RechargeGold : 0,
                BlackListOS : "",//0,web,
                BlackListVersion : "",
                BlackListPackage: ""
            },
            Sending: false,

        };

        this.SpecialCaseData = {};
        this.Warning = "";

        //this.SpecialCaseData = JSON.parse(this.state.Data.RedirectData.Config);
    }

    componentDidMount() {
        this.OnExecute();
    }

    componentWillMount(){
    }

    OnUpdateState(Data) {
        this.state.Data.AwardOnlineCount = Data.AwardOnlineCount;
        this.state.Data.AwardDailyCount = Data.AwardDailyCount;
        this.state.Data.RechargeGold = Data.RechargeGold;
        this.state.Data.BlackListOS = Data.BlackListOS.join(',');
        this.state.Data.BlackListVersion = Data.BlackListVersion.join(',');
        this.state.Data.BlackListPackage = Data.BlackListPackage.join(',');

        this.setState(this.state);
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


                        //for (var GameCode in Config) {
                        //    var temp = {};
                        //
                        //    temp[GameCode] = Config[GameCode];
                        //    this.state.Data.RedirectData.EventConfig.push({Config:JSON.stringify(temp)});
                        //}
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

    OnDataListChange(event, Prop, ID) {
        var Value = event.target.value;

        //if (Value >= 0)
        {
            this.state.Data[Prop] = Value;
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

            if(typeof this.SpecialCaseData["401"] == "undefined"){
                this.SpecialCaseData["401"] = {
                    WinRatio: 0,
                    LoseRatio: 0
                }
            }

            if(typeof this.SpecialCaseData["402"] == "undefined"){
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

        return 0;
    }

    HandleSpecialCaseData(Prop, SubProp){
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
        //var AdditionalMenu = this.RenderEventConfig();

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
            /*
             AwardOnlineCount : 0,
             AwardDailyCount : 0,
             RechargeGold : 0,
             BlackListOS : "",//0,web,
             BlackListVersion : ""
             */
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
                                    <label className="col-sm-2">{"Quà điểm danh"}</label>

                                    <div className="col-sm-4">
                                        <input
                                            type="number"
                                            className="form-control"
                                            onChange={(e) => this.OnDataListChange(e,"AwardOnlineCount", this.state.Data.BlackListOS)}
                                            value={this.state.Data.AwardOnlineCount}
                                            >
                                        </input>
                                    </div>
                                </div>
                            </td>
                        </tr>

                        <tr>
                            <td>
                                <div className="form-group">
                                    <label className="col-sm-2">{"Quà đăng nhập"}</label>

                                    <div className="col-sm-4">
                                        <input
                                            type="number"
                                            className="form-control"
                                            onChange={(e) => this.OnDataListChange(e,"AwardDailyCount", this.state.Data.BlackListOS)}
                                            value={this.state.Data.AwardDailyCount}
                                            >
                                        </input>
                                    </div>
                                </div>
                            </td>
                        </tr>

                        <tr>
                            <td>
                                <div className="form-group">
                                    <label className="col-sm-2">{"Số tiền đã nạp"}</label>

                                    <div className="col-sm-4">
                                        <input
                                            type="number"
                                            className="form-control"
                                            onChange={(e) => this.OnDataListChange(e,"RechargeGold", this.state.Data.BlackListOS)}
                                            value={this.state.Data.RechargeGold}
                                            >
                                        </input>
                                    </div>
                                </div>
                            </td>
                        </tr>

                        <tr>
                            <td>
                                <div className="form-group">
                                    <label className="col-sm-2">{"BlackListOS"}</label>

                                    <div className="col-sm-4">
                                        <input
                                            placeholder="1,2,3,..."
                                            className="form-control"
                                            onChange={(e) => this.OnDataListChange(e,"BlackListOS", this.state.Data.BlackListOS)}
                                            value={this.state.Data.BlackListOS}
                                            >
                                        </input>
                                    </div>
                                </div>
                            </td>
                        </tr>

                        <tr>
                            <td>
                                <div className="form-group">
                                    <label className="col-sm-2">{"BlackListVersion"}</label>

                                    <div className="col-sm-4">
                                        <input
                                            placeholder="1,2,3,..."
                                            className="form-control"
                                            onChange={(e) => this.OnDataListChange(e,"BlackListVersion", this.state.Data.BlackListOS)}
                                            value={this.state.Data.BlackListVersion}
                                            >
                                        </input>
                                    </div>
                                </div>
                            </td>
                        </tr>

                        <tr>
                            <td>
                                <div className="form-group">
                                    <label className="col-sm-2">{"BlackListPackage"}</label>

                                    <div className="col-sm-4">
                                        <input
                                            placeholder="1,2,3,..."
                                            className="form-control"
                                            onChange={(e) => this.OnDataListChange(e,"BlackListPackage", this.state.Data.BlackListPackage)}
                                            value={this.state.Data.BlackListPackage}
                                            >
                                        </input>
                                    </div>
                                </div>
                            </td>
                        </tr>

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
                                <Button className="btn btn-success" onClick={this.OnUpdateConfig.bind(this)}>Cập
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

    OnUpdateConfig(){
        var Action = 39;
        var Data = {
            AwardOnlineCount: this.state.Data.AwardOnlineCount,
            AwardDailyCount: this.state.Data.AwardDailyCount,
            RechargeGold: this.state.Data.RechargeGold,
            BlackListOS: this.state.Data.BlackListOS.split(','),
            BlackListVersion: this.state.Data.BlackListVersion.split(','),
            BlackListPackage: this.state.Data.BlackListPackage.split(',')
        };

        this.props.OnExecute(Action, Data);
        this.state.Sending = true;
        this.setState(this.state);

        setTimeout(function () {
            this.state.Sending = false;
            this.OnExecute();
        }.bind(this), 500);


    }

    OnExecute() {
        //var currState = this.state;
        //currState.Sending = true;
        //
        ///*
        // AwardOnlineCount : 0,
        // AwardDailyCount : 0,
        // RechargeGold : 0,
        // BlackListOS : "",//0,web,
        // BlackListVersion : ""
        // */
        //
        //var Data = {
        //    AwardOnlineCount: this.state.Data.AwardOnlineCount,
        //    AwardDailyCount: this.state.Data.AwardDailyCount,
        //    RechargeGold: this.state.Data.RechargeGold,
        //    BlackListOS: this.state.Data.BlackListOS,
        //    BlackListVersion: this.state.Data.BlackListVersion
        //};
        //
        //var DataStr = JSON.stringify(Data);

        this.props.OnExecute(this.Action, {});

        setTimeout(function () {
            this.props.OnRedirect(38, {});
        }.bind(this), 500);
    }

    GenerateSpecialCaseData(){
        var Result = 0;
        if(this.state.Data.RedirectData.EventCode == "SlotWinLose"){
            //convert to int
            this.SpecialCaseData["401"].WinRatio = +this.SpecialCaseData["401"].WinRatio;
            this.SpecialCaseData["401"].LoseRatio = +this.SpecialCaseData["401"].LoseRatio;
            this.SpecialCaseData["402"].WinRatio = +this.SpecialCaseData["402"].WinRatio;
            this.SpecialCaseData["402"].LoseRatio = +this.SpecialCaseData["402"].LoseRatio;

            Result = this.SpecialCaseData;
        }

        return Result;
    }
}

export default ShowStoreConfig;
