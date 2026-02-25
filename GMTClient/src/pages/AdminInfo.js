import React, { Component } from 'react';
import '../css/App.css';
import ReactTable from 'react-table'
import 'react-table/react-table.css'
import Chart from 'chart.js';

import {Table, Checkbox, Label, Button, ButtonToolbar, DropdownButton, MenuItem, Glyphicon, Dropdown} from 'react-bootstrap';
import Datetime from 'react-datetime'

var PacketConfig = require('../Config/PacketConfig');
var Loader = require('../resource/loader.gif');
var MenuConfig = require("../Config/MenuConfig");

class AdminInfo extends Component {
    constructor(props) {
        super(props);
        this.Action = this.props.Action;

        this.state = {
            ListAdmin: [],
            AdminInfo: {
                BasicInfo: {}
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

        if (PacketID == PacketConfig.GetAdminList) {
            this.state.ListAdmin = Data.Result;
        }

        if (PacketID == PacketConfig.GetAdminInfo) {
            /*
             UserChargeInfo: UserChargeInfo,
             UserWinInfo: UserWin,
             UserOnlineInfo: UserOnlineInfo,
             GameNameConfig: this.GameNameConfig
             */

            this.state.AdminInfo.BasicInfo = Data.Result;

            for (var i = 0; i < this.state.ListAdmin.length; i++) {
                if (this.state.ListAdmin[i].AccountID == this.state.AdminInfo.BasicInfo.AccountID) {
                    var currAdmin = this.state.ListAdmin[i];
                    currAdmin.IsAdmin = this.state.AdminInfo.BasicInfo.IsAdmin;
                    currAdmin.Permission = this.state.AdminInfo.BasicInfo.Permission;

                    break;
                }
            }
        }

        this.setState(this.state);
    }

    OnChangeRequest(event, ID) {
        var Value = event.target.value;
        this.state.Request[ID] = Value;
        this.setState(this.state);
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
            AccountID: RequestInfo,
            //DateTo: DateTo,
        };

        this.state.ListAdmin = [];
        this.setState(this.state);

        this.props.OnExecute(this.Action, data);
    }

    RenderLoading() {
        return <div className="center">
            <img src={Loader}/>
        </div>
    }

    RenderRequestTable() {
        var style = {
            flex: 2 / 3,
            height: 30,
            borderBottomWidth: 1,
            borderTopWidth: 0,
            borderLeftWidth: 0,
            borderRightWidth: 0,
            borderBottomColor: 'green',
            padding: 10

        };
        return <div>
            <h1><Label>Phân quyền Admin: </Label></h1>

            <br></br>

            <br></br>

            <div className="row">
                <div className="col-sm-2">
                    <Label>AccountID:</Label>
                </div>
                <div className="col-sm-1">
                </div>
                <div className="col-sm-1">
                </div>
            </div>
            <br></br>

            <div className="row">
                <div className="col-sm-2">
                    <input id="RequestInfo"
                           className="form-control"
                           value={this.state.Request.RequestInfo}
                           onChange={(e) => this.OnChangeRequest(e, "RequestInfo")}
                        ></input>
                </div>

                <div className="col-sm-1">
                    <Button onClick={this.OnExecute.bind(this)}> Xem </Button>
                </div>
            </div>
        </div>
    }

    RenderListAdmin() {
        return <div>
            {
                this.state.ListAdmin.length > 0 ?
                    <div className="row">
                        <div className="box-body table-striped">
                            <table className="table table-striped">
                                <thead>
                                <tr>
                                    <th>AccountID</th>
                                    <th>IsAdmin</th>
                                    <th>MenuConfig</th>
                                </tr>
                                </thead>
                                <tbody>
                                {
                                    this.state.ListAdmin.map(function (Element, index) {
                                        var checkBox = <Checkbox disabled checked readOnly/>;

                                        if (!Element.IsAdmin) {
                                            checkBox = <Checkbox disabled/>
                                        }

                                        return <tr key={index}>
                                            <td>{Element.AccountID}</td>
                                            <td>{checkBox}</td>
                                            <td>{Element.Permission.toString()}</td>
                                            <td><Button onClick={this.HandleGetAdminInfo.bind(this, Element)}>Chi
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
        return <div>
            <h4><Label>Thông tin Admin: </Label></h4>
            {
                <div className="box-body table-striped">
                    <table className="table table-striped">
                        <tbody>
                        <tr>
                            <td>
                                <div className="form-group">
                                    <label className="col-sm-2">AccountID:</label>

                                    <div className="col-sm-4">
                                        {this.state.AdminInfo.BasicInfo.AccountID}
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="form-group">
                                    <label className="col-sm-2">IsAdmin:</label>

                                    <div className="col-sm-4">
                                        <Checkbox
                                            value={this.state.AdminInfo.BasicInfo.IsAdmin}
                                            checked={this.state.AdminInfo.BasicInfo.IsAdmin}
                                            onChange={this.HandleChangeIsAdmin.bind(this)}
                                            />
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="form-group">
                                    <label className="col-sm-2">Token:</label>

                                    <div className="col-sm-4">
                                        {this.state.AdminInfo.BasicInfo.Token}
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="form-group">
                                    <label className="col-sm-2">Permission:</label>

                                    <div className="col-sm-8">
                                        {this.RenderPermissionList(this.state.AdminInfo.BasicInfo.Permission)}
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="form-group">
                                    <Button onClick={this.HandleUpdateAdmin.bind(this)}> Cập nhật </Button>
                                </div>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>

            }
        </div>
    }

    RenderPermissionList(Permission) {
        var MenuArray = MenuConfig.MenuArray;

        var Menu = <div>
            {
                <div className="box-body table-striped">
                    <table className="table table-striped">
                        <tbody>{
                            MenuArray.map(function (Element, index) {
                                var PermissionIndex = Permission.indexOf(Element.ID);
                                return <tr key={index}>
                                    <td>
                                        <div className="form-group">
                                            <label className="col-sm-4">{Element.Name}</label>

                                            <div className="col-sm-1">
                                                <Checkbox
                                                    value={Element.ID}
                                                    id={index}
                                                    checked={PermissionIndex > -1 ? 1 : 0}
                                                    onChange={this.HandleChangePermission.bind(this, index)}
                                                    />
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            }.bind(this))
                        }
                        </tbody>
                    </table>
                </div>
            }
        </div>

        return Menu;
    }

    RenderAdminInfo() {
        return <div>
            {
                this.IsEmptyObject(this.state.AdminInfo.BasicInfo) ? null :
                    <div>
                        {this.RenderBasicInfo()}
                    </div>
            }
        </div>
    }

    HandleUpdateAdmin() {
        var actionCode = PacketConfig.UpdateAdminInfo;
        var AccountID = this.state.AdminInfo.BasicInfo.AccountID;
        var IsAdmin = this.state.AdminInfo.BasicInfo.IsAdmin;
        var MenuConfig = this.state.AdminInfo.BasicInfo.MenuConfig;

        var data = {
            AccountID: AccountID,
            IsAdmin: IsAdmin,
            MenuConfig: MenuConfig
        };

        this.props.OnExecute(actionCode, data);

        setTimeout(function () {
            this.HandleGetAdminInfo(this.state.AdminInfo.BasicInfo);
        }.bind(this), 500);
    }

    HandleChangePermission(index, e) {
        var Value = e.target.value;

        var PermissionIndex = this.state.AdminInfo.BasicInfo.Permission.indexOf(parseInt(Value));
        if (PermissionIndex > -1) {
            this.state.AdminInfo.BasicInfo.Permission.splice(PermissionIndex, 1);

            var MenuConfgIndex = this.state.AdminInfo.BasicInfo.MenuConfig.indexOf(parseInt(Value));
            if (MenuConfgIndex > -1) {
                this.state.AdminInfo.BasicInfo.MenuConfig.splice(MenuConfgIndex, 1);
            }
        }
        else {
            this.state.AdminInfo.BasicInfo.Permission.push(parseInt(Value));
            this.state.AdminInfo.BasicInfo.MenuConfig.push(parseInt(Value));
        }

        this.setState(this.state);
    }

    HandleChangeIsAdmin(e) {
        this.state.AdminInfo.BasicInfo.IsAdmin = this.state.AdminInfo.BasicInfo.IsAdmin ? 0 : 1;
        this.setState(this.state);
    }

    HandleGetAdminInfo(Admin) {
        var actionCode = PacketConfig.GetAdminInfo;
        var data = {
            AccountID: Admin.AccountID
        };

        this.state.AdminInfo.BasicInfo = Admin;

        this.props.OnExecute(actionCode, data);
    }

    render() {
        var ListAdmin = this.RenderListAdmin();
        var RequestTable = this.RenderRequestTable();
        var AdminInfo = this.RenderAdminInfo();
        var Loading = this.RenderLoading();

        return (
            <div>
                {
                    this.Loading ? <div> {Loading} </div> :
                        <div>
                            {RequestTable}
                            <br></br>
                            {ListAdmin}
                            <br></br>
                            {AdminInfo}
                        </div>
                }
            </div>
        );
    }
}

export default AdminInfo;
