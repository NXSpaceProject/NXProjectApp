// eslint-disable-next-line no-unused-vars
import React, {Component} from 'react';
import {
    Button, Avatar, Card, IconButton, Title, Subheading,
    Paragraph, Badge, Dialog, Portal, Divider
} from 'react-native-paper';
import {Dimensions, View, Text, StyleSheet, StatusBar, SafeAreaView, ScrollView} from 'react-native';
import Bluetooth from "./Bluetooth";
import {withTranslation} from "react-i18next";
import base64 from "react-native-base64";
import {
    LineChart
} from "react-native-chart-kit";
import SplashScreen from 'react-native-splash-screen'

import NXStaticFireSettings from './components/NXStaticFireSettings';

const STATE_CHECKING_SYSTEMS = 0;
const STATE_READY = 1;
const STATE_CHECK_ENGINE_START = 2;
const STATE_STARTUP = 3;
const STATE_CHECKING_FIRE_TEST_STARTED = 4;
const STATE_FIRE_TEST_STARTED = 5;
const STATE_FIRE_TEST_ENDED = 6;
const STATE_ABORT = 7;
const STATE_CELL_VALUE_INCORRECT = 8;
const STATE_SYSTEM_ERROR = 9;
const SYSTEM_ERROR_SD_NOT_WRITABLE = 10;
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
        "System error",      //9
        "SD Not writable"      //10
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
        "DESCRIPTION_SYSTEM_ERROR" ,     //9
        "SYSTEM_ERROR_SD_NOT_WRITABLE" //10
    ];

    MINIMUM_CELL_SAFETY_VALUES = -50;

    MAXIMUM_CELL_SAFETY_VALUES = 50;

    COMMAND_CHANGE_STATE = "NX+SS=";

    /**
     * constructor
     */
    constructor(props) {
        super(props);

        this.updateSetting = this.updateSetting.bind(this);
        this.saveSettings = this.saveSettings.bind(this);

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
            rebootConfirmationMessage: false,
            confirmationAbortMessage: false,
            fireLightStartThreshold: 0
        };
    }
    componentDidMount() {
        // do stuff while splash screen is shown
        // After having done stuff (such as async tasks) hide the splash screen
        SplashScreen.hide();
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
        console.log("DECODED VALUE:", decodedValue);
        if (decodedValue.startsWith("NX+STATE=")) {
            const valuePos = decodedValue.indexOf("=") + 1;
            const stateNumber = this.getNXValue(decodedValue.substring(valuePos, valuePos+2));
            this.setState({
                state: this.states[stateNumber],
                stateDescription: this.statesDescription[stateNumber],
                stateNumber: parseInt(stateNumber)
            })
        }
        if (decodedValue.startsWith("N+W=")) {
            const thrust = this.getNXValue(decodedValue);
            const thrustArray = thrust.split(",");
            let currentThrust = parseFloat(thrustArray[1]);
            console.log(currentThrust > this.state.maxThrust ?currentThrust : this.state.maxThrust);

            //  if (thrustArray[1] - this.state.thrustData[this.state.thrustData.length-1] >= 1) {
            if (this.state.thrustData.length > 15) {
                this.state.thrustTime.shift();
                this.state.thrustData.shift();
            }
            this.setState({
                maxThrust: currentThrust > this.state.maxThrust ? currentThrust : this.state.maxThrust,
                thrustTime: [...this.state.thrustTime, thrustArray[0]],
                thrustData: [...this.state.thrustData, currentThrust],
                cellValue: currentThrust
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
        if (this.isConnectedAndTestRunning() || this.isConnectedAndCheckingTest()) {
            this.setState({
                confirmationAbortMessage: true
            });
        } else if (this.state.connected) {
            let cellValue = await this.checkCellValue();
            if (cellValue > this.MINIMUM_CELL_SAFETY_VALUES && cellValue < this.MAXIMUM_CELL_SAFETY_VALUES) {
                this.setState({
                    confirmationMessage: true,
                    state: this.states[STATE_READY],
                    stateDescription: this.statesDescription[STATE_READY],
                    stateNumber: STATE_READY
                });
            } else {
                this.setState({
                    state: this.states[STATE_CELL_VALUE_INCORRECT],
                    stateDescription: this.statesDescription[STATE_CELL_VALUE_INCORRECT],
                    stateNumber: STATE_CELL_VALUE_INCORRECT}
                );
            }
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
        this.wwor.writeWithoutResponse(base64.encode("NX+SS=" + sendState + "\n")).then((response) => {
            console.log("NX+SS=" + sendState)
            this.setState({confirmationMessage: false});
        });
    }

    /**
     * Hide Dialog
     */
    hideDialog() {
        this.setState({
            confirmationMessage: false,
            state: this.states[STATE_READY],
            stateDescription: this.statesDescription[STATE_READY],
            stateNumber: STATE_READY
        });
    }

    /**
     * Hide Reboot Confirmation Dialog
     */
    hideRebootConfirmationDialog() {
        this.setState({rebootConfirmationMessage: false});
    }

    /**
     * Confirm Abort
     */
    confirmAbort() {
        this.wwor.writeWithoutResponse(base64.encode("NX+SS=" + STATE_ABORT + "\n")).then((response) => {
            this.setState({confirmationAbortMessage: false});
        });
    }
    /**
     * Hide Abort Confirmation Dialog
     */
    hideAbortConfirmationDialog() {
        this.setState({confirmationAbortMessage: false})
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
        return this.wwor.writeWithoutResponse(base64.encode("NX+SS=" + sendState + "\n"));
    }

    /**
     * Get current cell value
     */
    getCellValue() {
        this.wwor.writeWithoutResponse(base64.encode("NX+CEL\n")).then((response) => {
            console.log("NX+CEL");
        });
    }

    isConnectedAndSystemReady() {
        console.log('isready', this.state.connected, this.state.stateNumber)
        return this.state.connected === true && this.state.stateNumber == 1;
    }

    isConnectedAndTestRunning() {
        return this.state.connected === true && this.state.stateNumber === STATE_FIRE_TEST_STARTED;
    }

    isConnectedAndCheckingTest() {
        return this.state.connected === true && this.state.stateNumber === STATE_CHECKING_FIRE_TEST_STARTED;
    }

    updateSetting(value) {
        this.setState(
            value
        );
    }
    saveSettings() {
        this.wwor.writeWithoutResponse(base64.encode("NX+LT=" + this.state.fireLightStartThreshold + "\n")).then((response) => {

        });
    }

    buttonStartTestStyle() {
        if (this.isConnectedAndTestRunning() || this.state.stateNumber ===  STATE_CHECKING_FIRE_TEST_STARTED) {
            return style.buttonAbort;
            // return style.buttonConnected : style.buttonDisconnected
        } else if (this.state.connected === true) {
            return style.buttonConnected;
        }
    }
    buttonFireStaticMessages(t) {
        if (this.state.stateNumber === STATE_FIRE_TEST_STARTED || this.state.stateNumber ===  STATE_CHECKING_FIRE_TEST_STARTED) {
            return t("ABORT");
        }
        return t("Start Test");
        //   stateNumber === STATE_FIRE_TEST_STARTED ? t("ABORT") : t("Start Test")
    }


    /*   <View>
           <NXStaticFireSettings
               updateSetting={this.updateSetting}
               saveSettings={this.saveSettings}
           />
       </View>*/


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
            confirmationAbortMessage,
            maxThrust,
            cellValue,
            fireLightStartThreshold
        } = this.state;
        const {t} = this.props;

        return (
            <SafeAreaView>
                <ScrollView contentInsetAdjustmentBehavior="automatic">
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
                        <StaticFireStates
                            state={state}
                            stateNumber={stateNumber}
                            stateDescription={stateDescription}
                            t={t}/>
                        <View style={style.row}>
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
                                        content={t("Reboot system?")}
                                        style={style}
                                        confirm={() => this.confirmReboot()}
                                        hide={() => this.hideRebootConfirmationDialog()}
                                    />
                                </Dialog>

                                <Dialog visible={confirmationAbortMessage}
                                        onDismiss={() => this.hideAbortConfirmationDialog()}>
                                    <ModalConfirmation
                                        t={t}
                                        title={t("Abort")}
                                        content={t("Abort static fire test?")}
                                        style={style}
                                        confirm={() => this.confirmAbort()}
                                        hide={() => this.hideAbortConfirmationDialog()}
                                    />
                                </Dialog>
                            </Portal>
                            <Button
                                disabled={!connected}
                                style={this.buttonStartTestStyle()}
                                icon="fire" mode="contained" onPress={() => this.showConfirmationDialog()}>
                                {this.buttonFireStaticMessages(t)}
                            </Button>
                        </View>
                        <View style={style.row}>
                            <Button
                                disabled={!connected && stateNumber !== 3}
                                icon="weight" mode="contained" onPress={() => this.getCellValue()}>
                                {t("Load cell value") + ": " + cellValue + "gr"}
                            </Button>
                        </View>
                        <StaticFireChart
                            maxThrust={maxThrust}
                            thrustTime={thrustTime}
                            thrustData={thrustData}
                            t={t}
                        />
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }
}

const StaticFireChart = (attrs) => {
    const {maxThrust, thrustTime, thrustData, t} = attrs;
    let kgMax = (maxThrust / 1000).toFixed(4);
    let newtonMax = (kgMax * 9.80665).toFixed(4);
    return (
        <View>
            <Title>{t("Max Thrust")}: {newtonMax} N / {kgMax} KG</Title>
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
                    backgroundColor: "#ab0000",
                    backgroundGradientFrom: "#ab0000",
                    backgroundGradientTo: "#EB4D31",
                    decimalPlaces: 2, // optional, defaults to 2dp
                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    style: {
                        borderRadius: 16
                    },
                    propsForDots: {
                        r: "6",
                        strokeWidth: "2",
                        stroke: "#EB4D31"
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
    );
}

const StaticFireStates  = (attrs) => {
    const {t, stateDescription, state, stateNumber} = attrs;
    return (
        <View style={style.row}>
            <Card.Title
                title={t("State") + ": " + t(state)}
                subtitle={t(stateDescription)}
                subtitleNumberOfLines={2}
                left={(props) => <IconState props={props} stateNumber={stateNumber}/>}
                right={(props) => <></>}
            />
        </View>
    )
}

const IconState = (attrs) => {
    const {props, stateNumber} = attrs;
    let icon;
    let iconColor;
    switch (stateNumber) {
        case STATE_READY:
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
        case SYSTEM_ERROR_SD_NOT_WRITABLE:
            iconColor = style.stateIconError;
            icon = "exclamation";
            break;
    }
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
        /*backgroundColor: "#A1378B"*/
    },
    buttonAbort: {
        color: "#fff",
        backgroundColor: "#cc0000"
    },
    buttonReboot: {
        color: "#fff",
        backgroundColor: "#ffa500"
    }
});
export default withTranslation()(NXStaticFire);