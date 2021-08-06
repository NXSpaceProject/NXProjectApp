import * as React from 'react';
import { Appbar } from 'react-native-paper';
import { StyleSheet } from 'react-native';

const NXBar = ({ navigation, previous }) => (
        <Appbar.Header>
            {previous ? <Appbar.BackAction onPress={navigation.goBack} /> : null}
            <Appbar.Content title="NX Project" subtitle="Rocket"/>
            <Appbar.Action
                icon="dots-vertical"
                onPress={() => console.log('Back')}
            />
        </Appbar.Header>
);

export default NXBar;

const styles = StyleSheet.create({
    bottom: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
    },
});