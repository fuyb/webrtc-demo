import { Button } from 'react-bootstrap';
import { ButtonToolbar } from 'react-bootstrap';
import React from 'react';

class ButtonBox extends React.Component {
    constructor(props) {
        super(props);
    }

    render () {
        return (
            <div id={"buttonBox"} className={"buttonbox"}>
                <div>
                    <ButtonToolbar>
                        <Button 
                         style={{marginRight: "0.5rem"}} 
                         variant="outline-primary"
                         onClick={this.props.onStart}
                        >
                        开始
                        </Button>
                        <Button 
                         style={{marginRight: "0.5rem", marginLeft: "0.5rem"}} 
                         variant="outline-success"
                         onClick={this.props.onConnect}
                        >
                        连接
                        </Button>
                        <Button style={{marginLeft: "0.5rem"}}
                         variant="outline-danger"
                         onClick={this.props.onDisconnect}
                        >
                        断开
                        </Button>
                    </ButtonToolbar>
                </div>
            </div>
        );
    }
}

export default ButtonBox;
