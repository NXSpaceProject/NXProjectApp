// eslint-disable-next-line no-unused-vars
import React, {Component} from 'react';
import { Button, Avatar, Card, IconButton, Title, Paragraph, Badge    } from 'react-native-paper';
import {View, Text, StyleSheet} from 'react-native';
import Bluetooth from "./Bluetooth";
import {withTranslation} from "react-i18next";
import base64 from "react-native-base64";
import NxFileList from "./components/NXFileList";

class NXHome extends Bluetooth {

/*
      CHECKING_SYSTEMS, //0
      GROUND_IDLE, //1
      CHECK_ENGINE_START, //2
      STARTUP, //3
      LIFTOFF, //4
      ASCENDING, //5
      DESCENDING, //6
      LANDED, //7
      ABORT, //8
      SHUTDOWN, //9
      SYSTEM_ERROR, //10
 */
    rocketStates = [
        "Checking systems",
        "Ready",
        "Checking engine",
        "Startup",
        "Liftoff",
        "Ascending",
        "Descending",
        "Landed",
        "Aborted",
        "Shutdown",
        "System error"
    ];

    rocketStatesDescription = [
        "Checking systems",
        "DESCRIPTION_READY",
        "Checking engine",
        "Startup",
        "Liftoff",
        "Ascending",
        "Descending",
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
            rocketState: "Disconnected",
            rocketStateDescription: "DESCRIPTION_DISCONNECTED",
            acceleration: {
                x: 0, y: 0, z: 0
            }
        };
        console.log("NXhome")
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
            const valuePos = decodedValue.indexOf("=") + 1;
            const rocketStateNumber = decodedValue.substring(valuePos);
            this.setState({
                rocketState: this.rocketStates[rocketStateNumber],
                rocketStateDescription: this.rocketStatesDescription[rocketStateNumber],
                rocketStateNumber: rocketStateNumber
            })
        }
        if (decodedValue.startsWith("NX+LOGS=")) {
            const valuePos = decodedValue.indexOf("=") + 1;
            const flightLog = decodedValue.substring(valuePos);
            console.log(flightLog)
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

    /**
     * Render
     * @returns {*}
     */
    render() {
        const {connected, device, bleState, bleError, rocketState, rocketStateDescription, acceleration} = this.state;
        const {t} = this.props;
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
                      title={t("State") + ": "+ t(rocketState)}
                      subtitle={t(rocketStateDescription)}
                      subtitleNumberOfLines={2}
                      left={(props) => <Avatar.Icon style={style.stateIconReady} {...props} icon="rocket" />}
                      right={(props) => <IconButton {...props} icon="folder" onPress={() => {}} />}
                  />


                  <View style={style.accelerometer}>
                       <Avatar.Text style={style.accelerometerIcon} size={100} label={acceleration.x} />
                       <Avatar.Text style={style.accelerometerIcon} size={100} label={acceleration.y} />
                       <Avatar.Text style={style.accelerometerIcon} size={100} label={acceleration.z} />
                    </View>
                  <NxFileList/>
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
        backgroundColor: "#008000"
    },
    buttonDisconnected: {
        backgroundColor: "#A1378B"
    }
});
export default withTranslation()(NXHome);