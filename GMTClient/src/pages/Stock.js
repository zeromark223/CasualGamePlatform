import React, { Component } from 'react';
import '../css/App.css';
import ReactTable from 'react-table'
import 'react-table/react-table.css'

import {Table, Label, Button, ButtonToolbar, DropdownButton, MenuItem, Glyphicon, Dropdown} from 'react-bootstrap';
import Datetime from 'react-datetime';

var Loader = require('../resource/loader.gif');

class SetStock_Redis extends Component {
    constructor(props) {
        super(props);
        this.Action = this.props.Action;

        this.state = {
            Responsed: false,
            Data: {
                Result: [],
            },
            Sending: false
        };
    }

    componentDidMount() {
        this.OnExecute();
    }

    OnUpdateState(Data) {

        for (var i = 0; i < Data.Result.length; i++) {
            var StringData = JSON.stringify(JSON.parse(Data.Result[i].Value), null, '\t');
            Data.Result[i].StringData = StringData;
        }

        this.state.Sending = false;
        this.state.Data = Data;

        this.setState(this.state);
    }

    GetGameNameByConfig(Key) {
        var Result = Key;

        for (var i = 0; i < this.state.Data.RoomConfig.length; i++) {
            if (Key == this.state.Data.RoomConfig[i].RoomKind) {
                Result = this.state.Data.RoomConfig[i].RoomName;
            }
        }

        return Result;
    }

    render() {
        var data;

        if (this.state.Sending) {
            data = <div className="center">
                <img src={Loader}/>
            </div>
        }
        else {
            data = <div>
                <h1><Label>Stock: </Label></h1>
                <br></br>

                <div className="box-body table-striped">
                    <table className="table table-striped">
                        <thead>
                        <tr>

                        </tr>
                        </thead>
                        <tbody>
                        {
                            this.state.Data.Result.map(function (Element, index) {
                                var GameName = this.GetGameNameByConfig(Element.Key);
                                return <tr key={index}>
                                    <td className="col-sm-2"><label className="col-sm-8">{GameName}</label></td>
                                    <td className="col-sm-8">
                                        <div className="form-group">
                                            <div className="col-sm-12">
                                                <textarea id={Element.Key} className="form-control"
                                                          value={Element.StringData}
                                                          width="100%"
                                                          cols="60" rows="10"
                                                          onChange={this.OnChange.bind(this)}>
                                                 </textarea>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="col-sm-1">
                                            <span className="glyphicon glyphicon-send"
                                                  onClick={this.HandleUpdate.bind(this, Element)}></span>
                                    </td>
                                </tr>
                            }.bind(this))
                        }
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

    isValidJSON(str) {
        return !!(JSON.parse(str) && str);
    }

    HandleUpdate(Element) {
        try {
            var isValid = this.isValidJSON(Element.StringData);
            if (isValid) {
                var Value = JSON.stringify(JSON.parse(Element.StringData), '\t', null);
                var Data = {
                    Key: Element.Key,
                    Value: Value
                };

                this.props.OnExecute(20, Data);

                var currState = this.state;
                currState.Sending = true;
                this.setState(currState);
            }
            else {
                console.log("Not valid")
            }

            setTimeout(function () {
                this.OnExecute();
            }.bind(this), 500);
        }
        catch (e) {
            window.alert("Sai cấu trúc!!!");
            console.log("HandleUpdate error: failed to parse Value", e.stack);
        }
    }

    OnChange(event) {
        var ID = event.target.id;
        var value = event.target.value;
        var currState = this.state;

        for (var i = 0; i < currState.Data.Result.length; i++) {
            if (currState.Data.Result[i].Key == ID) {
                currState.Data.Result[i].StringData = value;
                break;
            }
        }

        this.setState(currState);
    }

    OnExecute() {
        var currState = this.state;
        currState.Sending = true;
        this.setState(currState);

        var data = {};

        this.props.OnExecute(this.Action, data);
    }
}

export default SetStock_Redis;
