import React, { Component } from 'react';
import '../css/App.css';
import GMToolClient from '../GMToolClient';
import Menu from './Menu.js';


class TotalSystemGold extends Component {
    constructor(props) {
        super(props);
        this.Action = 1;

        console.log("TotalSystemGold", this.props)

        this.state = {
            Responsed: false,
            Data: this.props.Data
        }
    }

    OnUpdateState(Data){
        this.setState({
            Responsed: true,
            TotalSystemGold: Data.TotalSystemGold
        })
    }

    render() {

        return (
            <div>
                <div className="layout">
                    <a>Total System Gold: </a>
                    <a>{this.state.TotalSystemGold}</a>
                    <button onClick={this.OnExecute.bind(this)} id="Execute">Execute</button>
                </div>
            </div>
        );

        //return (
        //    <div className="row">
        //        <div className="layout-menu" style={styles}>
        //            <div className="vertical-menu">
        //                <h4> G68 GMTool </h4>
        //                <a onClick={this.onChooseAction.bind(this, 1)} id="btn1" className="active">Total System Gold</a>
        //                <a onClick={this.onChooseAction.bind(this, 2)} id="btn2">Game Status</a>
        //                <a onClick={this.onChooseAction.bind(this, 3)} id="btn3">Top Gold</a>
        //                <a onClick={this.onChooseAction.bind(this, 4)} id="btn4">Top Win</a>
        //                <a onClick={this.onChooseAction.bind(this, 5)} id="btn5">Log Gold User</a>
        //
        //            </div>
        //        </div>
        //        <div className="layout">
        //
        //            <table>
        //                <tbody>
        //                <tr>
        //                    <td>DateFrom:<input type="date" id="dateFrom"/></td>
        //                </tr>
        //                <tr>
        //                    <td>DateTo:<input type="date" id="dateTo"/></td>
        //                </tr>
        //                <tr>
        //                    <td>UserID:<input type="number" id="userid"/></td>
        //                </tr>
        //
        //                <tr>
        //                    <td><a href="https://jsonformatter.org/" target="_blank">Vao day parse data nha</a></td>
        //                </tr>
        //                </tbody>
        //            </table>
        //
        //            <div>
        //                <button onClick={this.onExecute.bind(this)}>Execute</button>
        //            </div>
        //
        //            <h1 id="dataTitle">Data</h1>
        //
        //            <div>
        //                <p id="packetIdField"></p>
        //
        //                <p id="dataField"></p>
        //            </div>
        //
        //        </div>
        //    </div>
        //);
    }

    OnExecute(){
        this.props.OnExecute(this.Action, {});
        setTimeout(function(){
            this.OnUpdateState(this.props.Data);
        }.bind(this), 500);
    }

    onTimeChange(event) {
        console.log("onTimeChange", event.target.value);

        var timeChanged = document.getElementById("dateFrom");
        timeChanged.value = "2014-02-09";
    }

    onChooseAction(action) {
        if (this.currentAction !== 0) {
            var btn1 = document.getElementById("btn" + this.currentAction);
            btn1.className = "";
        }

        this.currentAction = action;
        var btn = document.getElementById("btn" + this.currentAction);
        btn.className = "active";
    }

    onExecute() {
        // format: dd/mm/yyyy
        var dateFrom = document.getElementById("dateFrom");
        var dateTo = document.getElementById("dateTo");
        var UserID = document.getElementById("userid");

        dateFrom.value = dateFrom.value || "2018-06-04";
        dateTo.value = dateTo.value || "2018-06-08";
        UserID.value = parseInt(UserID.value) || 0;

        var data = {
            DateFrom: dateFrom.value,
            DateTo: dateTo.value,
            UserID: parseInt(UserID.value)
        };

        this.GMToolClient.onExecute(this.currentAction, data);
    }

    onFillData(data) {
        //{ packetId: , data: }
        var packetId = document.getElementById("packetIdField");
        packetId.innerHTML = "PacketId: " + data.packetId;
        var dataField = document.getElementById("dataField");
        dataField.innerHTML = JSON.stringify(data.data);
    }
}

export default TotalSystemGold;
