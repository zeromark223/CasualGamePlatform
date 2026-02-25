/**
 * Created by quinx on 8/21/2018.
 */
import React, { Component } from 'react';
import '../css/App.css';
import '../css/hamburgers.css';

import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';

import { withStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Popper from '@material-ui/core/Popper';
import Grow from '@material-ui/core/Grow';

import MenuRounded from '@material-ui/icons/MenuRounded';
import Close from '@material-ui/icons/MenuRounded';
import Icon from '@material-ui/core/Icon';

var MenuConfig = require('../Config/MenuConfig');


const styles = theme => ({
    button: {
        margin: theme.spacing.unit,
    },
    leftIcon: {
        marginRight: theme.spacing.unit,
    },
    rightIcon: {
        marginLeft: theme.spacing.unit,
    },
    iconSmall: {
        fontSize: 20,
    },
});


class MenuComponent extends Component {
    constructor(props) {
        super(props);
        this.currentAction = 1;
        this.Permission = [];
        this.IsAdmin = 0;
        this.state = {
            Status: 0,
            MenuOpen: false
        };

        this.MenuArray = MenuConfig.MenuArray;
        this.MenuGroup = MenuConfig.MenuGroup;
    }

    UpdateStatus(value, ID) {
        var currState = this.state;

        currState[ID] = value;

        this.setState(currState);
    }

    HandleToggle() {

        var currentState = this.state;
        currentState.MenuOpen = !currentState.MenuOpen;

        this.setState(currentState);
    }

    HandleClose(event) {
        if (this.anchorEl.contains(event.target)) {
            return;
        }

        this.state.MenuOpen = false;
        this.setState(this.state);
    }


    OnUpdateState(Data) {
        this.IsAdmin = Data.IsAdmin;
        this.Permission = Data.Permission;

        this.setState(this.state);
    }

    RenderAnimatedMenuIcon() {
        return <Button className={this.state.MenuOpen ? "hamburger hamburger--spin is-active" : "hamburger hamburger--spin"}
                    onClick={this.HandleToggle.bind(this)}
                    buttonRef={node => {
                        this.anchorEl = node;
                    }}
                    aria-owns={this.state.MenuOpen ? 'menu-list-grow' : null}
                    aria-haspopup="true"
            >
            <div className="hamburger-box">
                <div className="hamburger-inner"></div>
            </div>
        </Button>
    }

    render() {
        const classes = theme => ({
            button: {
                margin: theme.spacing.unit,
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

        var scrollbarStyles = {borderRadius: 5};
        var MenuButton = this.RenderAnimatedMenuIcon();

        /*
         <Button
         buttonRef={node => {
         this.anchorEl = node;
         }}
         aria-owns={this.state.Open ? 'menu-list-grow' : null}
         aria-haspopup="true"
         onClick={this.handleToggle.bind(this)}
         variant="contained"
         className={classes.button}
         >
         Menu
         <MenuRounded className={classes.rightIcon}/>

         </Button>
         */

        return (

            <div className="layout-menu">
                <div className={classes.root}>

                    {MenuButton}
                    <Popper open={this.state.MenuOpen} anchorEl={this.anchorEl} transition disablePortal
                            style={{maxHeight: 500, overflow: 'auto'}}>
                        {({ TransitionProps, placement }) => (
                            <Grow
                                {...TransitionProps}
                                id="menu-list-grow"
                                style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom'}}
                                >

                                <Paper>
                                    <ClickAwayListener onClickAway={this.HandleClose.bind(this)}>
                                        <MenuList>
                                            {
                                                this.MenuArray.map(function (Element, index) {
                                                    var MenuIndex = this.Permission.indexOf(Element.ID);

                                                    if (MenuIndex >= 0 || this.IsAdmin) {
                                                        var ID = Element.ID;
                                                        var Name = Element.Name;
                                                        return <MenuItem key={index}
                                                                         onClick={this.onChooseAction.bind(this, ID)}>
                                                            <h4>{Name}</h4>
                                                        </MenuItem>;
                                                    }
                                                }.bind(this))
                                            }
                                        </MenuList>
                                    </ClickAwayListener>
                                </Paper>

                            </Grow>
                        )}
                    </Popper>
                </div>
            </div>
        );
    }

    onChooseAction(action, e) {
        this.HandleClose(e);
        if (this.currentAction !== 0 || 1) {
            var btn1 = document.getElementById("btn" + this.currentAction);
            if (btn1 != null) {
                btn1.className = "";
            }
        }

        this.currentAction = action;
        var btn = document.getElementById("btn" + this.currentAction);
        if (btn != null) {
            btn.className = "active";
        }

        this.props.onChooseAction(action);
    }
}

export default MenuComponent;