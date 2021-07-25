import React, {Component} from 'react';
import {Button, Text, View, StyleSheet} from 'react-native';
import {PermissionsAndroid} from 'react-native';
import {BleManager} from 'react-native-ble-plx';
//import { Buffer } from 'buffer';
//global.Buffer = Buffer; // very important
import base64 from 'react-native-base64';
import NXBar from './src/components/NXBar';
import NXBottomNavigation from './src/components/NXBottomNavigation';

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
  },
});

class Hello extends Component {
  /**
   * constructor
   */
  constructor() {
    super();
    this.state = {

    };
  }

  /**
   * Render
   * @returns {*}
   */
  render() {
 //   const {connected, device, bleState, bleError} = this.state;
    return (
        <>
          <NXBar/>
          <NXBottomNavigation/>
        </>
    )
  }
}

export default Hello;
