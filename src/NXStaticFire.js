// eslint-disable-next-line no-unused-vars
import React, {Component} from 'react';
import {
    Button, Avatar, Card, IconButton, Title,
    Paragraph, Badge, Dialog, Portal, Divider
} from 'react-native-paper';
import {Dimensions, View, Text, StyleSheet} from 'react-native';
import Bluetooth from "./Bluetooth";
import {withTranslation} from "react-i18next";
import base64 from "react-native-base64";
import {
    LineChart
} from "react-native-chart-kit";

const STATE_CHECKING_SYSTEMS = 0;
const STATE_GROUND_IDLE = 1;
const STATE_CHECK_ENGINE_START = 2;
const STATE_STARTUP = 3;
const STATE_CHECKING_FIRE_TEST_STARTED = 4;
const STATE_FIRE_TEST_STARTED = 5;
const STATE_FIRE_TEST_ENDED = 6;
const STATE_ABORT = 7;
const STATE_CELL_VALUE_INCORRECT = 8;
const STATE_SYSTEM_ERROR = 9;
const CELL_VALUE_WAITING_TIME = 1000;

class NXStaticFire extends Bluetooth {

    states = [
        "Checking systems", //0
        "Ready",            //1
        "NOT AVAILABLE",   //2
        "Startup",          //3
        "Checking fire test started",   //4
        "Test started",     //5
        "Test fired ended", //6
        "Aborted",          //7
        "Incorrect cell value",         //8
        "System error"      //9
    ];

    statesDescription = [
        "Checking systems",             //0
        "DESCRIPTION_READY",            //1
        "NOT AVAILABLE",               //2
        "Startup",                      //3
        "DESCRIPTION_CHECKING_FIRE_TEST_STARTED",     //4
        "DESCRIPTION_FIRE_TEST_STARTED",     //5
        "DESCRIPTION_TEST_FIRE_ENDED",  //6
        "Aborted",                      //7
        "DESCRIPTION_INCORRECT_CELL_VALUE",         //8
        "DESCRIPTION_SYSTEM_ERROR"      //9
    ];

    MINIMUM_CELL_SAFETY_VALUES = -50;

    MAXIMUM_CELL_SAFETY_VALUES = 50;

    COMMAND_CHANGE_STATE = "NX+SS=";

    /**
     * constructor
     */
    constructor(props) {
        super(props);
        this.state = {
            ...this.state,
            stateNumber: 0,
            state: "Disconnected",
            stateDescription: "DESCRIPTION_DISCONNECTED",
            acceleration: {
                x: 0, y: 0, z: 0
            },
            thrustData: [0],
            thrustTime: [0],
            confirmationMessage: false,
            maxThrust: 0,
            cellValue: 0,
            rebootConfirmationMessage: false
        };
    }

    /**
     * Get Device State
     * @returns {Promise<void>}
     */
    async getDeviceState() {
        //  const array = [0x73];
        //    const openValueBase64 = new Buffer(array).toString('base64');
        await this.wwor.writeWithoutResponse(base64.encode("NX+STATE"));
        //   await this.wwor.writeWithoutResponse(base64.encode("NX+LOGS"));
    }

    /**
     * Decode Protocol
     * @param decodedValue
     */
    decodeProtocol(decodedValue) {
        if (decodedValue.startsWith("NX+STATE=")) {
            const valuePos = decodedValue.indexOf("=") + 1;
            const stateNumber = this.getNXValue(decodedValue.substring(valuePos, valuePos+1));
            this.setState({
                state: this.states[stateNumber],
                stateDescription: this.statesDescription[stateNumber],
                stateNumber: parseInt(stateNumber)
            })
        }
        if (decodedValue.startsWith("N+W=")) {
            const thrust = this.getNXValue(decodedValue);
            const thrustArray = thrust.split(",");

            console.log(thrustArray[1] > this.state.maxThrust ? thrustArray[1] : this.state.maxThrust)

            //  if (thrustArray[1] - this.state.thrustData[this.state.thrustData.length-1] >= 1) {
            if (this.state.thrustData.length > 15) {
                this.state.thrustTime.shift();
                this.state.thrustData.shift();
            }
            this.setState({
                maxThrust: thrustArray[1] > this.state.maxThrust ? thrustArray[1] : this.state.maxThrust,
                thrustTime: [...this.state.thrustTime, thrustArray[0]],
                thrustData: [...this.state.thrustData, thrustArray[1]]
            });
            // }
        }
        if (decodedValue.startsWith("N+A=")) {
            const acceleration = this.getNXValue(decodedValue);
            const azArray = acceleration.split(",");
            this.setState({
                acceleration: {
                    x: azArray[0],
                    y: azArray[1],
                    z: azArray[2],
                }
            })
        }
        if (decodedValue.startsWith("C=")) {
            this.setState({
                cellValue: this.getNXValue(decodedValue)
            });
        }
    }

    /**
     * get NX decoded value
     * @param decodedValue
     * @returns {string}
     */
    getNXValue(decodedValue) {
        const valuePos = decodedValue.indexOf("=") + 1;
        return decodedValue.substring(valuePos);
    }

    /**
     * Show confirmation dialog before start static fire test
     */
    async showConfirmationDialog() {
        let cellValue = await this.checkCellValue();
        if (cellValue > this.MINIMUM_CELL_SAFETY_VALUES && cellValue < this.MAXIMUM_CELL_SAFETY_VALUES) {
            this.setState({
                confirmationMessage: true,
                state: this.states[STATE_GROUND_IDLE],
                stateDescription: this.statesDescription[STATE_GROUND_IDLE],
                stateNumber: STATE_GROUND_IDLE
            });
        } else {
            this.setState({
                state: this.states[STATE_CELL_VALUE_INCORRECT],
                stateDescription: this.statesDescription[STATE_CELL_VALUE_INCORRECT],
                stateNumber: STATE_CELL_VALUE_INCORRECT}
            );
        }
    }

    /**
     * Check current cell value
     * @returns {Promise<unknown>}
     */
    async checkCellValue() {
        this.getCellValue();
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(this.state.cellValue);
            }, CELL_VALUE_WAITING_TIME);
        });
    }

    /**
     * Confirm static fire test
     */
    confirm() {
        let sendState = (this.state.stateNumber === STATE_FIRE_TEST_STARTED) ? STATE_ABORT : STATE_STARTUP;
        this.wwor.writeWithoutResponse(base64.encode("NX+SS=" + sendState)).then((response) => {
            console.log("NX+SS=" + sendState)
            this.setState({confirmationMessage: false});
        });
    }

    hideDialog() {
        this.setState({
            confirmationMessage: false,
            state: this.states[STATE_GROUND_IDLE],
            stateDescription: this.statesDescription[STATE_GROUND_IDLE],
            stateNumber: STATE_GROUND_IDLE
        });
    }


    hideRebootConfirmationDialog() {
        this.setState({rebootConfirmationMessage: false});
    }

    /**
     * Reboot System confirmation
     */
    showRebootConfirmationDialog() {
        this.setState({rebootConfirmationMessage: true})
    }

    /**
     * Reboot System
     */
    confirmReboot() {
        this.sendNXState(0).then(() => {
            this.setState({rebootConfirmationMessage: false});
            this.disconnectBluetooth();
        })
    }

    /**
     * Change NX system state
     * @param sendState
     * @returns {Promise<Characteristic>}
     */
    sendNXState(sendState) {
        return this.wwor.writeWithoutResponse(base64.encode("NX+SS=" + sendState));
    }

    /**
     * Get current cell value
     */
    getCellValue() {
        this.wwor.writeWithoutResponse(base64.encode("NX+CELL")).then((response) => {
            console.log("NX+CELL");
        });
    }

    isConnectedAndSystemReady() {
        console.log('isready', this.state.connected, this.state.stateNumber)
        return this.state.connected === true && this.state.stateNumber == 1;
    }

    /**
     * Render
     * @returns {*}
     */
    render() {
        const {
            connected, device, bleState, bleError,
            state,
            stateDescription,
            acceleration,
            thrustData,
            thrustTime,
            stateNumber,
            confirmationMessage,
            rebootConfirmationMessage,
            maxThrust,
            cellValue,
        } = this.state;
        const {t} = this.props;

        console.log('State ', stateNumber);
        return (
            <View style={style.container}>
                <View style={style.row}>
                    <Button
                        style={connected ? style.buttonConnected : style.buttonDisconnected}
                        icon="bluetooth" mode="contained" onPress={() => this.toggleBluetooth()}>
                        {connected ? t("Connected") : t("Connect by bluetooth")}
                    </Button>
                </View>
                <View style={style.row}>
                    <Button
                        disabled={!connected}
                        style={connected ? style.buttonReboot : style.buttonDisconnected}
                        icon="power-off" mode="contained" onPress={() => this.showRebootConfirmationDialog()}>
                        {connected ? t("Reboot") : t("Disconnected")}
                    </Button>
                </View>
                <View style={style.row}>
                    <Card.Title
                        title={t("State") + ": " + t(state)}
                        subtitle={t(stateDescription)}
                        subtitleNumberOfLines={2}
                        left={(props) => <IconState props={props} stateNumber={stateNumber}/>}
                        right={(props) => <IconButton {...props} icon="folder" onPress={() => {
                        }}/>}
                    />
                </View>
                <View>
                    <Portal>
                        <Dialog visible={confirmationMessage} onDismiss={() => this.hideDialog()}>
                            <ModalConfirmation
                                t={t}
                                title={t("Alert")}
                                content={t("Be careful, the static fire test will start")}
                                style={style}
                                confirm={() => this.confirm()}
                                hide={() => this.hideDialog()}
                            />
                        </Dialog>
                        <Dialog visible={rebootConfirmationMessage}
                                onDismiss={() => this.hideRebootConfirmationDialog()}>
                            <ModalConfirmation
                                t={t}
                                title={t("Reboot system")}
                                content={t("Be careful!")}
                                style={style}
                                confirm={() => this.confirmReboot()}
                                hide={() => this.hideRebootConfirmationDialog()}
                            />
                        </Dialog>
                    </Portal>
                    <Button
                        disabled={!connected}
                        style={connected ? style.buttonConnected : style.buttonDisconnected}
                        icon="fire" mode="contained" onPress={() => this.showConfirmationDialog()}>
                        {stateNumber === 5 ? t("Running Test") : t("Start Test")}
                    </Button>
                    <Divider/>
                    <Button
                        disabled={!connected && stateNumber !== 3}
                        icon="weight" mode="contained" onPress={() => this.getCellValue()}>
                        {t("Cell Value")}
                    </Button>
                    <Text>{t("Current Cell Value")}: {cellValue}</Text>
                </View>
                <View>
                    <Text>{t("Test Fire")}</Text>
                    <Text>{t("Max Thrust")}: {maxThrust * 0.0098} N / {maxThrust * 0.001} KG</Text>
                    <LineChart
                        data={{
                            labels: thrustTime,
                            datasets: [
                                {
                                    data: thrustData
                                }
                            ]
                        }}
                        width={Dimensions.get("window").width - 20} // from react-native
                        height={220}
                        yAxisLabel={""}
                        yAxisSuffix={"G"}
                        chartConfig={{
                            backgroundColor: "#e26a00",
                            backgroundGradientFrom: "#e26a00",
                            backgroundGradientTo: "#ffa726",
                            decimalPlaces: 2, // optional, defaults to 2dp
                            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                            style: {
                                borderRadius: 16
                            },
                            propsForDots: {
                                r: "6",
                                strokeWidth: "2",
                                stroke: "#ffa726"
                            },
                            propsForLabels: {
                                fontSize: 7
                            }
                        }}
                        bezier
                        style={{
                            marginVertical: 8,
                            borderRadius: 16
                        }}
                    />
                </View>
            </View>
        );
    }
}

const IconState = (attrs) => {
    const {props, stateNumber} = attrs;
    let icon;
    let iconColor;
    switch (stateNumber) {
        case STATE_GROUND_IDLE:
            icon = "check";
            iconColor = style.stateIconReady;
            break;
        case STATE_STARTUP:
            icon = "fire";
            iconColor = style.stateIconAlert;
            break;
        case STATE_CHECKING_FIRE_TEST_STARTED:
            icon = "fire";
            iconColor = style.stateIconAlert;
            break;
        case STATE_FIRE_TEST_STARTED:
            icon = "fire";
            iconColor = style.stateIconAlert;
            break;
        case STATE_FIRE_TEST_ENDED:
            icon = "fire";
            iconColor = style.stateIconReady;
            break;
        case STATE_ABORT:
            icon = "exclamation";
            iconColor = style.stateIconError;
            break;
        case STATE_CELL_VALUE_INCORRECT:
            icon = "weight";
            iconColor = style.stateIconError;
            break;
        case STATE_SYSTEM_ERROR:
            iconColor = style.stateIconError;
            icon = "exclamation";
            break;
    }
    /*
    const STATE_CHECKING_SYSTEMS = 0;
    const STATE_GROUND_IDLE = 1;
    const STATE_CHECK_ENGINE_START = 2;
    const STATE_STARTUP = 3;
    const STATE_CHECKING_FIRE_TEST_STARTED = 4;
    const STATE_FIRE_TEST_STARTED = 5;
    const STATE_FIRE_TEST_ENDED = 6;
    const STATE_ABORT = 7;
    const STATE_SHUTDOWN = 8;
    const STATE_SYSTEM_ERROR = 9;
    */
    /*  if (stateNumber == 1) {
          icon = "check";
      }

      if (stateNumber == 1) {
          icon = "fire";
      }*/
    console.log(icon);
    return (<>
        <Avatar.Icon style={iconColor} {...props} icon={icon}/>
    </>);
}

const ModalConfirmation = (attrs) => {
    const {t, style, confirm, hide, title, content} = attrs;
    return (
        <>
            <Dialog.Title>{title}</Dialog.Title>
            <Dialog.Content>
                <Paragraph>{content}</Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
                <Button style={style.buttonConnected}
                        onPress={() => confirm()}>{t("Confirm")}</Button>
                <Button style={style.buttonDisconnected}
                        onPress={() => hide()}>{t("Cancel")}</Button>
            </Dialog.Actions>
        </>
    );
}
const style = StyleSheet.create({
    accelerometer: {
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    accelerometerIcon: {
        margin: 15
    },
    stateIconReady: {
        backgroundColor: "#008000"
    },
    stateIconError: {
        backgroundColor: "#ab5a46"
    },
    stateIconAlert: {
        backgroundColor: "#ffa500"
    },
    container: {
        flex: 1,
        flexDirection: "column",
        padding: 10,
        alignItems: 'stretch',
        justifyContent: 'flex-start',
    },
    row: {
        marginBottom: 10
    },
    buttonConnected: {
        color: "#fff",
        backgroundColor: "#008000"
    },
    buttonDisconnected: {
        color: "#fff",
        backgroundColor: "#A1378B"
    },
    buttonReboot: {
        color: "#fff",
        backgroundColor: "#ffa500"
    }
});
export default withTranslation()(NXStaticFire);