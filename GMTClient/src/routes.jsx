import React from 'react';
import { BrowserRouter } from 'react-router-dom';

//pages
import TotalSystemGold from './pages/TotalSystemGold';
import GameStatus from './pages/GameStatus.js';
import TopGold from './pages/TopGold.js';
import TopWin from './pages/TopWin.js';
import LogGoldUser from './pages/LogGoldUser.js';
import MoneyStatus from './pages/MoneyStatus.js';
import MoneyFlowStatistics from './pages/MoneyFlowStatistics.js';
import GlobalBoss from './pages/GlobalBoss.js';
import GlobalBoss_Edit from './pages/GlobalBoss_Edit.js';
import GlobalBoss_Add from './pages/GlobalBoss_Add.js';
import LogCCU from './pages/LogCCU.js';
import Broadcast from './pages/Broadcast.js';
import Broadcast_Edit from './pages/Broadcast_Edit.js';
import Broadcast_Add from './pages/Broadcast_Add.js';
import LogGoldUser_Redis from './pages/LogGoldUser_Redis.js';
import Stock from './pages/Stock.js';
import Event from './pages/Event.js';
import Event_Edit from './pages/Event_Edit.js';
import UserInfo from './pages/UserInfo.js';
import LogUserKillBoss from './pages/LogUserKillBoss.js';
import Slot_Info from './pages/Slot_Info.js';
import AdminInfo from './pages/AdminInfo.js';
import TX_Info from './pages/TX_Info.js';
import Baccarat_Info from './pages/Baccarat_Info.js';
import LogUserPlay from './pages/LogUserPlay.js';
import XocDia_Info from './pages/XocDia_Info.js';
import VQMM_Info from './pages/VQMM_Info.js';
import ShowStoreConfig from './pages/ShowStoreConfig.js';
import TXMini_Info from './pages/TXMini_Info.js';
import Tracking_GameStatus from './pages/Tracking_GameStatus.js';
import Tracking_UserDetail from './pages/Tracking_UserDetail.js';
import TopDoiNap from './pages/TopDoiNap.js';
import Article from './pages/Article.js';
import Article_Edit from './pages/Article_Edit.js';
import Article_Add from './pages/Article_Add.js';

import MenuComponent from './pages/Menu.js';

import ScrollArea from 'react-scrollbar';
import GMToolClient from './GMToolClient';
import PacketConfig from './Config/PacketConfig.js';

import Button from '@material-ui/core/Button';
import ArrowBackOutlined from '@material-ui/icons/ArrowBackOutlined';
import ArrowForwardOutlined from '@material-ui/icons/ArrowForwardOutlined';
import './css/App.css';

class Routes extends React.Component {
    constructor(props) {
        super(props);

        this.GMToolClient = new GMToolClient(this);
        this.state = {
            IsLoginCompleted: false,
            Choice: 0,
            Status: 0,
            Data: {},
            RedirectData: {},
            PacketID: 0,
            History: [],
            Role: -1,
            Permission: [],
            AccountID: '',
            MenuOpen: false
        }
    }

    onChooseAction(action) {

        switch (action) {
            case PacketConfig.GetGlobalBossList:
                //this.OnExecute(action, {});
                break;

            default:
                break;
        }

        this.state.History.push(this.state.Choice);

        var currState = this.state;
        currState.Choice = action;

        this.setState(currState);
    }

    OnExecute(Action, Data) {
        console.log("OnExecute", Action, Data);
        this.GMToolClient.OnExecute(Action, Data);
    }

    OnExecute_Bacarat(packetName, Data){
        console.log("OnExecute_Bacarat", packetName, Data);
        this.GMToolClient.Bacarat_Request(packetName, Data);
    }

    OnReceiveResponseData_Bacarat(Data){
        this.refs.event.OnUpdateState(Data);
    }

    OnUpdateState(Data) {
    }

    OnReceiveResponseData(packet) {
        if (packet.packetId == 99) {
            this.SetLoggedIn(packet);
            return;
        }

        console.log("OnReceiveResponseData", packet);
        var currState = this.state;
        //this.state.History.push(this.state.Choice);
        currState.Data = packet.data;
        currState.PacketID = packet.packetId;

        this.setState(currState);

        this.refs.event.OnUpdateState(this.state.Data);
    }

    OnRedirect(Action, Data) {

        console.log("OnRedirect", Action, Data);
        this.state.History.push(this.state.Choice);
        var currState = this.state;
        currState.Choice = Action;
        currState.RedirectData = Data;

        this.setState(currState);

        //this.refs.event.OnRedirect(this.state.RedirectData);
    }

    SetLoggedIn(packet) {
        var State = this.state;
        State.IsLoginCompleted = true;
        State.IsAdmin = packet.data.IsAdmin;
        State.MenuConfig = packet.data.MenuConfig;
        State.Permission = packet.data.Permission;
        State.AccountID = packet.data.AccountID;

        this.setState(State);

        this.refs.event1.OnUpdateState(this.state);
    }

    HandleBack() {
        if (this.state.History.length > 0) {
            var action = this.state.History.pop();
            this.state.Choice = action;

            this.setState(this.state);
        }
    }

    render() {

        var style = {
            padding: "5px"
        };

//<h1>{"Hello " + this.state.AccountID}</h1>
        return (
            <div>
                <div className="row" style={style}>
                    <div className="col-sm-1">
                        <Button disabled={!this.state.History.length > 0} variant="fab" color="primary"
                                aria-label="Add"
                                onClick={this.HandleBack.bind(this)}>
                            <ArrowBackOutlined/>
                        </Button>
                    </div>
                </div>

                <div className="row" style={style}>
                    {this.state.IsLoginCompleted ?
                        <MenuComponent
                            Permission={this.state.Permission}
                            onChooseAction={this.onChooseAction.bind(this)}
                            ref="event1"
                            /> : null}
                    <br></br>
                </div>

                <div className="layout">
                    {this.state.Choice == 0 ?
                        null : null
                    }

                    {this.state.Choice == PacketConfig.GetTotalSystemGold ? <TotalSystemGold
                        OnExecute={this.OnExecute.bind(this)}
                        Data={this.state.Data}
                        PacketID={this.state.PacketID}
                        Action={this.state.Choice}
                        ref="event"
                        /> : null}

                    {this.state.Choice == PacketConfig.GetGameStatus ? <GameStatus
                        OnExecute={this.OnExecute.bind(this)}
                        Data={this.state.Data}
                        PacketID={this.state.PacketID}
                        Action={this.state.Choice}
                        ref="event"
                        /> : null}

                    {this.state.Choice == PacketConfig.GetTopGold ? <TopGold
                        OnExecute={this.OnExecute.bind(this)}
                        Data={this.state.Data}
                        PacketID={this.state.PacketID}
                        Action={this.state.Choice}
                        ref="event"
                        /> : null}

                    {this.state.Choice == PacketConfig.GetTopWin ? <TopWin
                        OnExecute={this.OnExecute.bind(this)}
                        Data={this.state.Data}
                        PacketID={this.state.PacketID}
                        Action={this.state.Choice}
                        ref="event"
                        /> : null}

                    {this.state.Choice == PacketConfig.GetLogGoldUser ? <LogGoldUser
                        OnExecute={this.OnExecute.bind(this)}
                        Data={this.state.Data}
                        PacketID={this.state.PacketID}
                        Action={this.state.Choice}
                        ref="event"
                        /> : null}

                    {this.state.Choice == PacketConfig.GetMoneyStatus ? <MoneyStatus
                        OnExecute={this.OnExecute.bind(this)}
                        Data={this.state.Data}
                        PacketID={this.state.PacketID}
                        Action={this.state.Choice}
                        ref="event"
                        /> : null}

                    {this.state.Choice == PacketConfig.GetMoneyFlowStatistics ? <MoneyFlowStatistics
                        OnExecute={this.OnExecute.bind(this)}
                        Data={this.state.Data}
                        PacketID={this.state.PacketID}
                        Action={this.state.Choice}
                        ref="event"
                        /> : null}

                    {this.state.Choice == PacketConfig.GetGlobalBossList ? <GlobalBoss
                        OnRedirect={this.OnRedirect.bind(this)}
                        OnExecute={this.OnExecute.bind(this)}
                        Data={this.state.Data}
                        PacketID={this.state.PacketID}
                        Action={this.state.Choice}
                        ref="event"
                        /> : null}

                    {this.state.Choice == PacketConfig.UpdateGlobalBoss ? <GlobalBoss_Edit
                        OnRedirect={this.OnRedirect.bind(this)}
                        OnExecute={this.OnExecute.bind(this)}
                        Data={this.state.Data}
                        RedirectData={this.state.RedirectData}
                        PacketID={this.state.PacketID}
                        Action={this.state.Choice}
                        ref="event"
                        /> : null}

                    {this.state.Choice == PacketConfig.AddGlobalBoss ? <GlobalBoss_Add
                        OnRedirect={this.OnRedirect.bind(this)}
                        OnExecute={this.OnExecute.bind(this)}
                        Data={this.state.Data}
                        RedirectData={this.state.RedirectData}
                        PacketID={this.state.PacketID}
                        Action={this.state.Choice}
                        ref="event"
                        /> : null}

                    {this.state.Choice == PacketConfig.GetCCuLog ? <LogCCU
                        OnRedirect={this.OnRedirect.bind(this)}
                        OnExecute={this.OnExecute.bind(this)}
                        Data={this.state.Data}
                        RedirectData={this.state.RedirectData}
                        PacketID={this.state.PacketID}
                        Action={this.state.Choice}
                        ref="event"
                        /> : null}

                    {this.state.Choice == PacketConfig.GetBroadcast ? <Broadcast
                        OnRedirect={this.OnRedirect.bind(this)}
                        OnExecute={this.OnExecute.bind(this)}
                        Data={this.state.Data}
                        RedirectData={this.state.RedirectData}
                        PacketID={this.state.PacketID}
                        Action={this.state.Choice}
                        ref="event"
                        /> : null}

                    {this.state.Choice == PacketConfig.UpdateBroadcast ? <Broadcast_Edit
                        OnRedirect={this.OnRedirect.bind(this)}
                        OnExecute={this.OnExecute.bind(this)}
                        Data={this.state.Data}
                        RedirectData={this.state.RedirectData}
                        PacketID={this.state.PacketID}
                        Action={this.state.Choice}
                        ref="event"
                        /> : null}

                    {this.state.Choice == PacketConfig.AddBroadcast ? <Broadcast_Add
                        OnRedirect={this.OnRedirect.bind(this)}
                        OnExecute={this.OnExecute.bind(this)}
                        Data={this.state.Data}
                        RedirectData={this.state.RedirectData}
                        PacketID={this.state.PacketID}
                        Action={this.state.Choice}
                        ref="event"
                        /> : null}

                    {this.state.Choice == PacketConfig.GetLogGoldUser_Redis ? <LogGoldUser_Redis
                        OnRedirect={this.OnRedirect.bind(this)}
                        OnExecute={this.OnExecute.bind(this)}
                        Data={this.state.Data}
                        RedirectData={this.state.RedirectData}
                        PacketID={this.state.PacketID}
                        Action={this.state.Choice}
                        ref="event"
                        /> : null}

                    {this.state.Choice == PacketConfig.GetStock ? <Stock
                        OnRedirect={this.OnRedirect.bind(this)}
                        OnExecute={this.OnExecute.bind(this)}
                        Data={this.state.Data}
                        RedirectData={this.state.RedirectData}
                        PacketID={this.state.PacketID}
                        Action={this.state.Choice}
                        ref="event"
                        /> : null}

                    {this.state.Choice == PacketConfig.GetEventList ? <Event
                        OnRedirect={this.OnRedirect.bind(this)}
                        OnExecute={this.OnExecute.bind(this)}
                        Data={this.state.Data}
                        RedirectData={this.state.RedirectData}
                        PacketID={this.state.PacketID}
                        Action={this.state.Choice}
                        ref="event"
                        /> : null}

                    {this.state.Choice == PacketConfig.UpdateEvent ? <Event_Edit
                        OnRedirect={this.OnRedirect.bind(this)}
                        OnExecute={this.OnExecute.bind(this)}
                        Data={this.state.Data}
                        RedirectData={this.state.RedirectData}
                        PacketID={this.state.PacketID}
                        Action={this.state.Choice}
                        ref="event"
                        /> : null}

                    {this.state.Choice == PacketConfig.GetUserList ? <UserInfo
                        OnRedirect={this.OnRedirect.bind(this)}
                        OnExecute={this.OnExecute.bind(this)}
                        Data={this.state.Data}
                        RedirectData={this.state.RedirectData}
                        PacketID={this.state.PacketID}
                        Action={this.state.Choice}
                        ref="event"
                        /> : null}

                    {this.state.Choice == PacketConfig.GetLogUserKillBoss ? <LogUserKillBoss
                        OnRedirect={this.OnRedirect.bind(this)}
                        OnExecute={this.OnExecute.bind(this)}
                        Data={this.state.Data}
                        RedirectData={this.state.RedirectData}
                        PacketID={this.state.PacketID}
                        Action={this.state.Choice}
                        ref="event"
                        /> : null}

                    {this.state.Choice == PacketConfig.Slot_GetInfo ? <Slot_Info
                        OnRedirect={this.OnRedirect.bind(this)}
                        OnExecute={this.OnExecute.bind(this)}
                        Data={this.state.Data}
                        RedirectData={this.state.RedirectData}
                        PacketID={this.state.PacketID}
                        Action={this.state.Choice}
                        ref="event"
                        /> : null}

                    {this.state.Choice == PacketConfig.GetAdminList ? <AdminInfo
                        OnRedirect={this.OnRedirect.bind(this)}
                        OnExecute={this.OnExecute.bind(this)}
                        Data={this.state.Data}
                        RedirectData={this.state.RedirectData}
                        PacketID={this.state.PacketID}
                        Action={this.state.Choice}
                        ref="event"
                        /> : null}

                    {this.state.Choice == PacketConfig.TX_GetInfo ? <TX_Info
                        OnRedirect={this.OnRedirect.bind(this)}
                        OnExecute={this.OnExecute.bind(this)}
                        Data={this.state.Data}
                        RedirectData={this.state.RedirectData}
                        PacketID={this.state.PacketID}
                        Action={this.state.Choice}
                        ref="event"
                        /> : null}

                    {this.state.Choice == PacketConfig.Baccarat_GetInfo ? <Baccarat_Info
                        OnRedirect={this.OnRedirect.bind(this)}
                        OnExecute={this.OnExecute.bind(this)}
                        Data={this.state.Data}
                        RedirectData={this.state.RedirectData}
                        PacketID={this.state.PacketID}
                        Action={this.state.Choice}
                        ref="event"
                        /> : null}

                    {this.state.Choice == PacketConfig.GetLogUserPlay ? <LogUserPlay
                        OnRedirect={this.OnRedirect.bind(this)}
                        OnExecute={this.OnExecute.bind(this)}
                        Data={this.state.Data}
                        RedirectData={this.state.RedirectData}
                        PacketID={this.state.PacketID}
                        Action={this.state.Choice}
                        ref="event"
                        /> : null}

                    {this.state.Choice == PacketConfig.XocDia_GetInfo ? <XocDia_Info
                        OnRedirect={this.OnRedirect.bind(this)}
                        OnExecute={this.OnExecute.bind(this)}
                        Data={this.state.Data}
                        RedirectData={this.state.RedirectData}
                        PacketID={this.state.PacketID}
                        Action={this.state.Choice}
                        ref="event"
                        /> : null}

                    {this.state.Choice == PacketConfig.VQMM_GetInfo ? <VQMM_Info
                        OnRedirect={this.OnRedirect.bind(this)}
                        OnExecute={this.OnExecute.bind(this)}
                        Data={this.state.Data}
                        RedirectData={this.state.RedirectData}
                        PacketID={this.state.PacketID}
                        Action={this.state.Choice}
                        ref="event"
                        /> : null}

                    {this.state.Choice == PacketConfig.ShowStore ? <ShowStoreConfig
                        OnRedirect={this.OnRedirect.bind(this)}
                        OnExecute={this.OnExecute.bind(this)}
                        Data={this.state.Data}
                        RedirectData={this.state.RedirectData}
                        PacketID={this.state.PacketID}
                        Action={this.state.Choice}
                        ref="event"
                        /> : null}

                    {this.state.Choice == PacketConfig.TXMN_GetInfo ? <TXMini_Info
                        OnRedirect={this.OnRedirect.bind(this)}
                        OnExecute={this.OnExecute.bind(this)}
                        Data={this.state.Data}
                        RedirectData={this.state.RedirectData}
                        PacketID={this.state.PacketID}
                        Action={this.state.Choice}
                        ref="event"
                        /> : null}

                    {this.state.Choice == PacketConfig.Tracking_GameStatus ? <Tracking_GameStatus
                        OnRedirect={this.OnRedirect.bind(this)}
                        OnExecute={this.OnExecute.bind(this)}
                        Data={this.state.Data}
                        RedirectData={this.state.RedirectData}
                        PacketID={this.state.PacketID}
                        Action={this.state.Choice}
                        ref="event"
                        /> : null}

                    {this.state.Choice == PacketConfig.Tracking_GetTotalReCharge ? <Tracking_UserDetail
                        OnRedirect={this.OnRedirect.bind(this)}
                        OnExecute={this.OnExecute.bind(this)}
                        Data={this.state.Data}
                        RedirectData={this.state.RedirectData}
                        PacketID={this.state.PacketID}
                        Action={this.state.Choice}
                        ref="event"
                        /> : null}

                    {this.state.Choice == PacketConfig.TopDoiNap ? <TopDoiNap
                        OnRedirect={this.OnRedirect.bind(this)}
                        OnExecute={this.OnExecute.bind(this)}
                        Data={this.state.Data}
                        RedirectData={this.state.RedirectData}
                        PacketID={this.state.PacketID}
                        Action={this.state.Choice}
                        ref="event"
                        /> : null}

                    {this.state.Choice == PacketConfig.GetArticleList ? <Article
                        OnRedirect={this.OnRedirect.bind(this)}
                        OnExecute={this.OnExecute.bind(this)}
                        Data={this.state.Data}
                        RedirectData={this.state.RedirectData}
                        PacketID={this.state.PacketID}
                        Action={this.state.Choice}
                        ref="event"
                        /> : null}

                    {this.state.Choice == PacketConfig.EditArticle ? <Article_Edit
                        OnRedirect={this.OnRedirect.bind(this)}
                        OnExecute={this.OnExecute.bind(this)}
                        Data={this.state.Data}
                        RedirectData={this.state.RedirectData}
                        PacketID={this.state.PacketID}
                        Action={this.state.Choice}
                        ref="event"
                        /> : null}

                    {this.state.Choice == PacketConfig.AddArticle ? <Article_Add
                        OnRedirect={this.OnRedirect.bind(this)}
                        OnExecute={this.OnExecute.bind(this)}
                        Data={this.state.Data}
                        RedirectData={this.state.RedirectData}
                        PacketID={this.state.PacketID}
                        Action={this.state.Choice}
                        ref="event"
                        /> : null}
                </div>
            </div>
        );
    }
}

export default Routes;