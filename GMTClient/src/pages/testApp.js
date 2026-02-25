/**
 * Created by quinx on 8/22/2018.
 */
import React, { Component } from 'react';

import InfinityMenu from "react-infinity-menu";
import "react-infinity-menu/src/infinity-menu.css";

import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Popper from '@material-ui/core/Popper';
import Grow from '@material-ui/core/Grow';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import '../css/hamburgers.css';

var meo = require('../resource/meosuaxe.jpg');

class TestApp extends Component {
    constructor() {
        super();
        this.state = {
            Open: false
        };

    }

    handleToggle() {

        var currentState = this.state;
        currentState.Open = !currentState.Open;

        this.setState(currentState);
    }

    handleClose(event) {
        this.state.Open = false;
        this.setState(this.state);
    }

    RenderMenuIcon() {
        return <div>
            <div className={this.state.Open ? "burger-menu open" : "burger-menu"}
                 onClick={this.handleToggle.bind(this)}
                >
                <div className="bar1" key="b1"/>
                <div className="bar2" key="b2"/>
                <div className="bar3" key="b3"/>
            </div>
        </div>
    }

    RenderMenu() {
        return this.state.Open ? <div className="center">
            <ul>
                <li onClick={this.handleClose.bind(this)}>Menu 1</li>
                <li onClick={this.handleClose.bind(this)}>Menu 2</li>
                <li onClick={this.handleClose.bind(this)}>Menu 3</li>
                <li onClick={this.handleClose.bind(this)}>Menu 4</li>
                <li onClick={this.handleClose.bind(this)}>Menu 5</li>
                <li onClick={this.handleClose.bind(this)}>Menu 6</li>
                <li onClick={this.handleClose.bind(this)}>Menu 7</li>
                <li onClick={this.handleClose.bind(this)}>Menu 8</li>
                <li onClick={this.handleClose.bind(this)}>Menu 9</li>
                <li onClick={this.handleClose.bind(this)}>Menu 10</li>
                <li onClick={this.handleClose.bind(this)}>Menu 11</li>
            </ul>
        </div> : null
    }

    RenderAnimatedMenuIcon() {
        return <div className={this.state.Open ? "hamburger hamburger--emphatic is-active" : "hamburger hamburger--emphatic"}
                 onClick={this.handleToggle.bind(this)}
                >
                <div className="hamburger-box">
                    <div className="hamburger-inner"></div>
                </div>
            </div>
    }

    render() {
        //var MenuIcon = this.RenderMenuIcon();
        var MenuIcon = this.RenderAnimatedMenuIcon();
        var Menu = this.RenderMenu();


        return <div>
            {MenuIcon}
            {Menu}
        </div>
    }
}

export default TestApp;