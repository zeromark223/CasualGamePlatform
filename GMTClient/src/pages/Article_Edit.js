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
        this.ImageArr_Str = '';
        this.ArticleData = this.GenerateData(JSON.parse(RedirectData.Data));

    }

    componentWillMount() {
    }

    OnUpdateState(Data) {

    }

    GenerateData(ArticleData){
        var Data = {
            Title: '',
            Content: '',
            ImageArr: [],
        };

        for(var prop in ArticleData){
            Data[prop] = ArticleData[prop];
        }

        this.ImageArr_Str = Data.ImageArr.toString();

        return Data;
    }

    OnDataChange(event, ID) {
        var Value = event.target.value;
        this.state.Data.RedirectData[ID] = Value;
        this.setState(this.state);
    }

    OnChangeArticleData(event, ID){
        var Value = event.target.value;
        if(ID == 'ImageArr_Str'){
            this.ImageArr_Str = Value;
        }else{
            this.ArticleData[ID] = Value;
        }

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
        var StartTime = new Date(this.state.Data.RedirectData.TimeStart);
        var EndTime = new Date(this.state.Data.RedirectData.TimeEnd);

        if (this.state.Sending) {
            data = <div>
                <Image style={style} src={Loader}/>
            </div>
        }
        else {
            data = <div>
                <h1><Label>Cập nhật bài viết: </Label></h1>
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
                                        <input id="EventName" className="form-control"
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
                                    <label className="col-sm-2">Mã Event:</label>

                                    <div className="col-sm-4">
                                        <input id="EventCode" className="form-control"
                                               value={this.state.Data.RedirectData.EventCode}
                                               onChange={(e) => this.OnDataChange(e, "EventCode")}
                                            ></input>
                                    </div>
                                </div>
                            </td>
                        </tr>

                        <tr>
                            <td>
                                <div className="form-group">
                                    <label className="col-sm-2">Link hình hiển thị:</label>

                                    <div className="col-sm-6">
                                        <input id="TitleImg" className="form-control"
                                               value={this.state.Data.RedirectData.TitleImg}
                                               onChange={(e) => this.OnDataChange(e, "TitleImg")}
                                            ></input>
                                    </div>
                                </div>
                            </td>
                        </tr>

                        <tr>
                            <td>
                                <div className="form-group">
                                    <label className="col-sm-2">Thời gian diễn ra:</label>

                                    <div className="col-sm-3">
                                        <Datetime onChange={(e) => this.OnTimeChange(e, "TimeStart")}
                                                  id="StartTime"
                                                  viewDate={StartTime}
                                                  value={StartTime}/>
                                    </div>

                                    <div className="col-sm-3">
                                        <Datetime onChange={(e) => this.OnTimeChange(e, "TimeEnd")}
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
                                    <label className="col-sm-2">Tiêu đề:</label>

                                    <div className="col-sm-6">
                                        <input id="Title" className="form-control"
                                               value={this.ArticleData.Title}
                                               onChange={(e) => this.OnChangeArticleData(e, "Title")}
                                            ></input>
                                    </div>
                                </div>
                            </td>
                        </tr>

                        <tr>
                            <td>
                                <div className="form-group">
                                    <label className="col-sm-2">Nội dung:</label>

                                    <div className="col-sm-6">
                                        <textarea id="Content" className="form-control" rows="10"
                                               value={this.ArticleData.Content}
                                               onChange={(e) => this.OnChangeArticleData(e, "Content")}
                                            ></textarea>
                                    </div>
                                </div>
                            </td>
                        </tr>

                        <tr>
                            <td>
                                <div className="form-group">
                                    <label className="col-sm-2">Link hình bài viết:</label>

                                    <div className="col-sm-6">
                                        <textarea id="ImageArr_Str" className="form-control" rows="5"
                                               value={this.ImageArr_Str}
                                               onChange={(e) => this.OnChangeArticleData(e, "ImageArr_Str")}
                                            ></textarea>
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

        var EventName = {
            userMsg: this.state.Data.RedirectData.EventName,
            userMsgEn: this.state.Data.RedirectData.EventName_En,
        };

        this.ArticleData.ImageArr = this.ImageArr_Str.split(',');
        this.ArticleData.Content = this.ArticleData.Content.replace(/(?:\\[rn])+/g, "\\\n");

        var Data = {
            EventID: this.state.Data.RedirectData.EventID,
            EventCode: this.state.Data.RedirectData.EventCode,
            EventName: this.state.Data.RedirectData.EventName,
            TimeStart: this.FormatDateTime(this.state.Data.RedirectData.TimeStart),
            TimeEnd: this.FormatDateTime(this.state.Data.RedirectData.TimeEnd),
            TitleImg: this.state.Data.RedirectData.TitleImg,
            Data: JSON.stringify(this.ArticleData)
        };

        this.props.OnExecute(this.Action, Data);

        setTimeout(function () {
            this.props.OnRedirect(46, {});
        }.bind(this), 500);
    }
}

export default Event_Edit;
