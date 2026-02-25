import React, { Component } from 'react';
import '../css/App.css';
import ReactTable from 'react-table'
import 'react-table/react-table.css'
import Chart from 'chart.js';

import {Table, Label, Button, ButtonToolbar, DropdownButton, MenuItem, Glyphicon, Dropdown} from 'react-bootstrap';
import Datetime from 'react-datetime'

var PacketConfig = require('../Config/PacketConfig');
var Loader = require('../resource/loader.gif');

class UserInfo extends Component {
    constructor(props) {
        super(props);
        this.Action = this.props.Action;

        this.state = {
            ListUser: [],
            UserInfo: {
                BasicInfo: {},
                ChargeInfo: {},
                WinInfo: [],
                OnlineInfo: []
            },
            Request: {
                RequestInfo: "",
                OptionID: 0
            }
        };

        //this.OnExecute();

        this.RequestOptions = [
            {
                ID: 0,
                Option: "UserID"
            },
            {
                ID: 1,
                Option: "Nick"
            }
        ]

        this.Loading = false;
        this.ConfirmPopup = false;
    }

    IsEmptyObject(obj) {
        return Object.keys(obj).length === 0 && obj.constructor === Object;
    }

    OnUpdateState(Data) {
        this.Loading = false;
        var PacketID = this.props.PacketID;

        if (PacketID == PacketConfig.GetUserList) {
            this.state.ListUser = Data.Result;
        }

        if (PacketID == PacketConfig.GetUserInfo) {
            /*
             UserChargeInfo: UserChargeInfo,
             UserWinInfo: UserWin,
             UserOnlineInfo: UserOnlineInfo,
             GameNameConfig: this.GameNameConfig
             */

            this.state.UserInfo.ChargeInfo = Data.UserChargeInfo;
            this.state.UserInfo.WinInfo = Data.UserWinInfo;
            this.state.UserInfo.OnlineInfo = Data.UserOnlineInfo;
        }

        this.setState(this.state);
    }

    OnChangeRequest(event, ID) {
        var Value = event.target.value;
        this.state.Request[ID] = Value;
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

    OnChangeOption(value) {
        this.state.Request.OptionID = value;
        this.setState(this.state);
    }

    FormatNumber(num) {
        if (num >= 1000 || num * (-1) >= 1000) {
            return '' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
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
        this.state.Request[ID] = value;
        this.setState(this.state);
    }

    OnExecute() {
        // format: dd/mm/yyyy
        var RequestInfo = this.state.Request.RequestInfo;
        var OptionID = this.state.Request.OptionID;

        var data = {
            RequestInfo: RequestInfo,
            OptionID: OptionID
            //DateTo: DateTo,
        };

        this.state.UserInfo.BasicInfo = {};
        this.state.ListUser = [];
        this.setState(this.state);

        this.props.OnExecute(this.Action, data);
    }

    HandleKickUser(UserID) {
        var Result = window.confirm("Có muốn kick user này không?");
        if(Result){
            this.Loading = true;
            var actionCode = PacketConfig.KickUser;

            var data = {
                UserID: UserID
            };

            this.props.OnExecute(actionCode, data);
            this.setState(this.state);

            //this.OnExecute();
            setTimeout(function () {
                this.HandleGetUserInfo(this.state.UserInfo.BasicInfo);
            }.bind(this), 2000)
        }
    }

    RenderLoading() {
        return <div className="center">
            <img src={Loader}/>
        </div>
    }

    RenderRequestTable() {
        return <div>
            <h1><Label>Thông tin người chơi: </Label></h1>

            <br></br>

            <br></br>

            <div className="row">
                <div className="col-sm-2">
                    <Label>Thông tin tìm kiếm:</Label>
                </div>
                <div className="col-sm-1">
                    <Label>Tìm theo:</Label>
                </div>
                <div className="col-sm-1">
                </div>
            </div>
            <br></br>

            <div className="row">
                <div className="col-sm-2">
                    <input id="RequestInfo" className="form-control"
                           value={this.state.Request.RequestInfo}
                           onChange={(e) => this.OnChangeRequest(e, "RequestInfo")}
                        ></input>
                </div>

                <div className="col-sm-1">
                    <Dropdown id="dropdown-custom-1" bsStyle="success">
                        <Dropdown.Toggle>
                            {
                                this.RequestOptions.map(function (Element, index) {
                                    if (this.state.Request.OptionID == Element.ID) {
                                        return Element.Option;
                                    }
                                }.bind(this))
                            }
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="text-primary">
                            {
                                this.RequestOptions.map(function (Element, index) {
                                    return this.state.Request.OptionID == Element.ID ?
                                        <MenuItem
                                            onClick={this.OnChangeOption.bind(this, Element.ID)}
                                            id={"OptionID" + Element.ID}
                                            key={"OptionID" + index}
                                            active>{Element.Option}</MenuItem>
                                        : <MenuItem
                                        onClick={this.OnChangeOption.bind(this, Element.ID)}
                                        id={"OptionID" + Element.ID}
                                        key={"OptionID" + index}>{Element.Option}</MenuItem>
                                }.bind(this))
                            }
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
                <div className="col-sm-1">
                    <Button onClick={this.OnExecute.bind(this)}> Xem </Button>
                </div>
            </div>
        </div>
    }

    RenderListUser() {
        return <div>
            {
                this.state.ListUser.length > 0 ?
                    <div className="row">
                        <div className="box-body table-striped">
                            <table className="table table-striped">
                                <thead>
                                <tr>
                                    <th>UserID</th>
                                    <th>Nick</th>
                                    <th>AccountID</th>
                                    <th>Tiền</th>
                                    <th>Kinh nghiệm</th>
                                    <th>Cấp</th>
                                    <th>Ngày tạo</th>
                                </tr>
                                </thead>
                                <tbody>
                                {
                                    this.state.ListUser.map(function (Element, index) {
                                        var FormatedMoney = this.FormatNumber(Element.Money);

                                        return <tr key={index}>
                                            <td>{Element.UserID}</td>
                                            <td>{Element.GameName}</td>
                                            <td>{Element.AccountID}</td>
                                            <td>{FormatedMoney}</td>
                                            <td>{Element.Exp}</td>
                                            <td>{Element.Lv}</td>
                                            <td>{this.FormatDateTime(Element.CreateDate)}</td>
                                            <td><Button onClick={this.HandleGetUserInfo.bind(this, Element)}>Chi
                                                tiết</Button></td>
                                        </tr>
                                    }.bind(this))
                                }
                                </tbody>
                            </table>
                        </div>
                    </div> : null
            }
        </div>
    }

    RenderBasicInfo() {
        var FormatedMoney = 0;

        if (!this.IsEmptyObject(this.state.UserInfo.BasicInfo)) {
            FormatedMoney = this.FormatNumber(this.state.UserInfo.BasicInfo.Money);
        }

        return <div>
            <h4><Label>Thông tin cơ bản: </Label></h4>
            {
                <div className="box-body table-striped">
                    <table className="table table-striped">
                        <tbody>
                        <tr>
                            <td>
                                <div className="form-group">
                                    <label className="col-sm-2">UserID:</label>

                                    <div className="col-sm-4">
                                        {this.state.UserInfo.BasicInfo.UserID}
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="form-group">
                                    <label className="col-sm-2">Nick:</label>

                                    <div className="col-sm-4">
                                        {this.state.UserInfo.BasicInfo.GameName}
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="form-group">
                                    <label className="col-sm-2">AccountID:</label>

                                    <div className="col-sm-4">
                                        {this.state.UserInfo.BasicInfo.AccountID}
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="form-group">
                                    <label className="col-sm-2">Nick:</label>

                                    <div className="col-sm-4">
                                        {this.state.UserInfo.BasicInfo.GameName}
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="form-group">
                                    <label className="col-sm-2">Tiền:</label>

                                    <div className="col-sm-4">
                                        {FormatedMoney}
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="form-group">
                                    <label className="col-sm-2">Kinh nghiệm:</label>

                                    <div className="col-sm-4">
                                        {this.state.UserInfo.BasicInfo.Exp}
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="form-group">
                                    <label className="col-sm-2">Cấp:</label>

                                    <div className="col-sm-4">
                                        {this.state.UserInfo.BasicInfo.Lv}
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="form-group">
                                    <label className="col-sm-2">Ngày tạo:</label>

                                    <div className="col-sm-4">
                                        {this.FormatDateTime(this.state.UserInfo.BasicInfo.CreateDate)}
                                    </div>
                                </div>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>

            }
        </div>
    }

    RenderChargeInfo() {
        return <div>
            <h4><Label>Thông tin nạp: </Label></h4>
            {
                <div className="box-body table-striped">
                    <table className="table table-striped">
                        <tbody>
                        <tr>
                            <td>
                                <div className="form-group">
                                    <label className="col-sm-2">Tiền nạp:</label>

                                    <div className="col-sm-4">
                                        {this.state.UserInfo.ChargeInfo.Money > 0 ? this.FormatNumber(this.state.UserInfo.ChargeInfo.Money) : ""}
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="form-group">
                                    <label className="col-sm-2">Nạp lần đầu:</label>

                                    <div className="col-sm-4">
                                        {this.state.UserInfo.ChargeInfo.Money > 0 ? this.FormatDateTime(this.state.UserInfo.ChargeInfo.CreateDate) : ""}
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="form-group">
                                    <label className="col-sm-2">Nạp gần nhất:</label>

                                    <div className="col-sm-4">
                                        {this.state.UserInfo.ChargeInfo.Money > 0 ? this.FormatDateTime(this.state.UserInfo.ChargeInfo.UpdateDate) : ""}
                                    </div>
                                </div>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            }
        </div>
    }

    RenderWinInfo() {
        return <div>
            <h4><Label>Thông tin thắng game: </Label></h4>

            <div className="box-body table-striped">
                <table className="table table-striped">
                    <thead>
                    <tr>
                        <th>Game:</th>
                        <th>Tiền:</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        this.state.UserInfo.WinInfo.map(function (Element, index) {
                            return <tr key={index}>
                                <td>
                                    {Element.GameName}
                                </td>
                                <td>
                                    {this.FormatNumber(Element.Money)}
                                </td>
                            </tr>
                        }.bind(this))
                    }

                    </tbody>
                </table>
            </div>
        </div>
    }

    RenderOnlineInfo() {

        var status = <Label bsStyle="success">Online</Label>
        if (this.state.UserInfo.OnlineInfo.length == 0) {
            status = <Label>Offline</Label>
        }

        var KickButton = <Button
            onClick={this.HandleKickUser.bind(this, this.state.UserInfo.BasicInfo.UserID)}
            disabled={this.state.UserInfo.OnlineInfo.length == 0}> Kick User </Button>

        return <div>
            <h4><Label>Thông tin online:</Label> {status} {KickButton}</h4>

            <div className="box-body table-striped">
                <table className="table table-striped">
                    <thead>
                    <tr>
                        <th>Game:</th>
                        <th>ServerID:</th>
                        <th>Thời gian vào phòng:</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        this.state.UserInfo.OnlineInfo.map(function (Element, index) {
                            return <tr key={index}>
                                <td>

                                    {Element.GameName}
                                </td>
                                <td>

                                    {Element.ServerID}
                                </td>
                                <td>

                                    {Element.UpdateTime}
                                </td>
                            </tr>
                        }.bind(this))
                    }
                    </tbody>
                </table>
            </div>
        </div>
    }

    RenderUserInfo() {
        /*
         UserInfo: {
         BasicInfo:{},
         ChargeInfo: {},
         WinInfo: {},
         OnlineInfo: {}
         },
         */

        var BasicInfo = this.RenderBasicInfo();
        var ChargeInfo = this.RenderChargeInfo();
        var WinInfo = this.RenderWinInfo();
        var OnlineInfo = this.RenderOnlineInfo();

        return <div>
            {
                this.IsEmptyObject(this.state.UserInfo.BasicInfo) ? null :
                    <div>
                        {BasicInfo}
                        <br></br>
                        {ChargeInfo}
                        <br></br>
                        {WinInfo}
                        <br></br>
                        {OnlineInfo}
                    </div>
            }
        </div>
    }

    HandleGetUserInfo(User) {
        var actionCode = PacketConfig.GetUserInfo;
        var data = {
            UserID: User.UserID
        };

        this.state.UserInfo.BasicInfo = User;

        this.props.OnExecute(actionCode, data);
    }

    render() {
        var ListUser = this.RenderListUser();
        var RequestTable = this.RenderRequestTable();
        var UserInfo = this.RenderUserInfo();
        var Loading = this.RenderLoading();

        return (
            <div>
                {
                    this.Loading ? <div> {Loading} </div> :
                        <div>
                            {RequestTable}
                            <br></br>
                            {ListUser}
                            <br></br>
                            {UserInfo}
                        </div>
                }
            </div>
        );
    }
}

export default UserInfo;
