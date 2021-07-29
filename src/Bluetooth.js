// eslint-disable-next-line no-unused-vars
import React, {Component} from 'react';
import {Button, Text, View, StyleSheet} from 'react-native';
import {PermissionsAndroid} from 'react-native';
import base64 from "react-native-base64";
import {BleManager} from 'react-native-ble-plx';

const DISCONNECTED = "Disconnected";
const DISCONNECTED_DESCRIPTION = "DESCRIPTION_DISCONNECTED";

class Bluetooth extends Component {
    /**
     * constructor
     */
    constructor() {
        super();
        this.bleManager = new BleManager();
        this.state = {
            connected: false,
            device: '',
            bleState: '',
            bleError: '',
            deviceFounded: false,
            decodedValue: ""
        };
        this.wwor = null;
        this.wwr = null;
        //console.log(base64)
    }

    /**
     * scanAndConnect
     */
    scanAndConnect() {
        const permission = requestLocationPermission();
        if (permission) {
            this.bleManager.startDeviceScan(null, null, (error, device) => {
                if (error) {
                    this.setState({
                        bleError: error.message,
                    });
                    // Handle error (scanning will be stopped automatically)
                    return;
                }

                // Check if it is a device you are looking for based on advertisement data
                // or other criteria.
                this.setState({
                    device: device,
                });
                console.log("Device:", this.state.device.name);
                if (this.state.device.name === 'BT05') {
                    this.setState({
                        deviceFounded: true,
                    });

                    // Stop scanning as it's not necessary if you are scanning for one device.
                    this.bleManager.stopDeviceScan();

                    // Proceed with connection.
                    this.state.device
                        .connect()
                        .then((device) => {
                            this.setState({
                                connected: true,
                            });
                            this.characteristics(device);
                        })
                        .catch((error) => {
                            // Handle errors
                        });
                }
            });
        }
    }

    async characteristics(device) {
        await device.discoverAllServicesAndCharacteristics();
        const services = await device.services();
     //   const characteristics = await services[1].characteristics();
        //console.log('Characteristics:', characteristics);

        // let j = 0;
        for (const service of services) {
            // j++;
            // console.log('service' + j, service);
            const characteristics = await service.characteristics();
            //let i = 0;
            for (const characteristic of characteristics) {
                if (characteristic.isWritableWithoutResponse) {
                    this.wwor = characteristic;
                    this.getDeviceState();
                }
                if (characteristic.isNotifiable) {
                    characteristic.monitor((error, characteristic2) => {
                        if (error) return console.error(error);
                        //    const buffer = Buffer.from(characteristic2.value, 'base64');
                        //     console.log('read', buffer);
                     //   console.log(base64.decode(characteristic2.value));
                        this.decodedValue = base64.decode(characteristic2.value);
                        this.decodeProtocol(this.decodedValue);
                    });
                }

            }
        }
    }
    /**
     * Connect
     */
    connectBluetooth() {
        const subscription = this.bleManager.onStateChange((state) => {
            this.setState({
                bleState: state,
            });
            if (state === 'PoweredOn') {
                this.scanAndConnect();
                subscription.remove();
            }
        }, true);
    }

    /**
     * Disconnect
     */
    disconnectBluetooth() {
        this.bleManager.cancelDeviceConnection(this.state.device.id).then(() => {
            this.setState({
                connected: false,
                state: DISCONNECTED,
                stateDescription: DISCONNECTED_DESCRIPTION,
                rocketState: DISCONNECTED,
                rocketStateDescription: DISCONNECTED_DESCRIPTION
            });
        });
    }

    /**
     * Toggle Bluetooth
     */
    toggleBluetooth() {
        if (this.state.connected === true) {
            this.disconnectBluetooth();
        } else {
            this.connectBluetooth();
        }
    }

}
export async function requestLocationPermission() {
    try {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
            {
                title: 'Location permission for bluetooth scanning',
                message: 'wahtever',
                buttonNeutral: 'Ask Me Later',
                buttonNegative: 'Cancel',
                buttonPositive: 'OK',
            },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Location permission for bluetooth scanning granted');
            return true;
        } else {
            console.log('Location permission for bluetooth scanning revoked');
            return false;
        }
    } catch (err) {
        console.warn(err);
        return false;
    }
}

export default Bluetooth;
