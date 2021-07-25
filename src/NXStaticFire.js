// eslint-disable-next-line no-unused-vars
import React, {Component} from 'react';
import { Button, Avatar, Card, IconButton, Title,
    Paragraph, Badge, Dialog, Portal
} from 'react-native-paper';
import {Dimensions, View, Text, StyleSheet} from 'react-native';
import Bluetooth from "./Bluetooth";
import {withTranslation} from "react-i18next";
import base64 from "react-native-base64";
import {
    LineChart
} from "react-native-chart-kit";

class NXStaticFire extends Bluetooth {

    states = [
        "Checking systems",
        "Ready",
        "Checking engine",
        "Startup",
        "Test started",
        "Aborted",
        "Shutdown",
        "System error"
    ];

    statesDescription = [
        "Checking systems",
        "DESCRIPTION_READY",
        "Checking engine",
        "Startup",
        "Static fire test started",
        "Landed",
        "Aborted",
        "DESCRIPTION_SHUTDOWN",
        "DESCRIPTION_SYSTEM_ERROR"
    ];

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
            maxThrust: 0
        };
        console.log("NXFire")
    }

    /**
     * Get Device State
     * @returns {Promise<void>}
     */
    async getDeviceState() {
        //  const array = [0x73];
        //    const openValueBase64 = new Buffer(array).toString('base64');
        await this.wwor.writeWithoutResponse(base64.encode("NX+STATE"));
        await this.wwor.writeWithoutResponse(base64.encode("NX+LOGS"));
    }

    /**
     * Decode Protocol
     * @param decodedValue
     */
    decodeProtocol(decodedValue) {
        if (decodedValue.startsWith("NX+STATE=")) {
            console.log(decodedValue)
            const valuePos = decodedValue.indexOf("=") + 1;
            const stateNumber = decodedValue.substring(valuePos);
            this.setState({
                state: this.states[stateNumber],
                stateDescription: this.statesDescription[stateNumber],
                stateNumber: stateNumber
            })
        }
        if (decodedValue.startsWith("N+W=")) {
            const valuePos = decodedValue.indexOf("=") + 1;
            const thrust = decodedValue.substring(valuePos);
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
            const valuePos = decodedValue.indexOf("=") + 1;
            const acceleration = decodedValue.substring(valuePos);
            const azArray = acceleration.split(",");
            this.setState({
                acceleration: {
                    x: azArray[0],
                    y: azArray[1],
                    z: azArray[2],
                }
            })
        }
    }

    confirm() {
        let sendState = (this.state.stateNumber === 5) ? 7 : 3;
        this.wwor.writeWithoutResponse(base64.encode("NX+SS=" + sendState)).then((response) => {
            console.log("NX+SS=" + sendState)
            this.setState({confirmationMessage: false});
        });
    }

    hideDialog() {
        this.setState({confirmationMessage: false});
    }

    showConfirmationDialog() {
       this.setState({confirmationMessage: true});
    }

    /**
     * Render
     * @returns {*}
     */
    render() {
        const {connected, device, bleState, bleError,
            state,
            stateDescription,
            acceleration,
            thrustData,
            thrustTime,
            stateNumber,
            confirmationMessage,
            maxThrust
        } = this.state;
        const {t} = this.props;

        console.log('State ', stateNumber);
        return (
            <View  style={style.container}>
                <View style={style.row}>
                    <Button
                        style={connected ? style.buttonConnected : style.buttonDisconnected}
                        icon="bluetooth" mode="contained" onPress={() => this.toggleBluetooth()}>
                        {connected ? t("Connected") : t("Connect by bluetooth") }
                    </Button>
                </View>

                <View style={style.row}>
                    <Card.Title
                        title={t("State") + ": "+ t(state)}
                        subtitle={t(stateDescription)}
                        subtitleNumberOfLines={2}
                        left={(props) => <Avatar.Icon style={style.stateIconReady} {...props} icon="fire" />}
                        right={(props) => <IconButton {...props} icon="folder" onPress={() => {}} />}
                    />

                    <View style={style.accelerometer}>
                        <Avatar.Text style={style.accelerometerIcon} size={50} label={acceleration.x} />
                        <Avatar.Text style={style.accelerometerIcon} size={50} label={acceleration.y} />
                        <Avatar.Text style={style.accelerometerIcon} size={50} label={acceleration.z} />
                    </View>
                </View>
                <View>
                    <Portal>
                        <Dialog visible={confirmationMessage} onDismiss={() => this.hideDialog()}>
                            <Dialog.Title>{t("Alert")}</Dialog.Title>
                            <Dialog.Content>
                                <Paragraph>{t("Be careful, the static fire test will start")}</Paragraph>
                            </Dialog.Content>
                            <Dialog.Actions>
                                <Button style={style.buttonConnected} onPress={() =>this.confirm()}>{t("Confirm")}</Button>
                                <Button style={style.buttonDisconnected} onPress={() =>this.hideDialog()}>{t("Cancel")}</Button>
                            </Dialog.Actions>
                        </Dialog>
                    </Portal>
                    <Button
                        style={connected ? style.buttonConnected : style.buttonDisconnected}
                        icon="fire" mode="contained" onPress={() => this.showConfirmationDialog()}>
                        {stateNumber === 5 ? t("Running Test") : t("Start Test") }
                    </Button>
                </View>
                <View>
                    <Text>{t("Test Fire")}</Text>
                    <Text>{t("Max Thrust")}: {maxThrust*0.0098} N / {maxThrust*0.001} KG</Text>
                    <LineChart
                        data={{
                            labels: thrustTime,
                            datasets: [
                                {
                                    data: thrustData
                                }
                            ]
                        }}
                        width={Dimensions.get("window").width-20} // from react-native
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
                            propsForLabels:{
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
const style = StyleSheet.create({
    accelerometer: {
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection:'row',
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
    }
});
export default withTranslation()(NXStaticFire);