/**
 * @format
 */
import * as React from 'react';
import {AppRegistry} from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import Hello from './Hello';
//import Bte from './src/Bte';
import {name as appName} from './app.json';
import './i18n';

export default function Main() {
    return (
        <PaperProvider>
            <Hello />
        </PaperProvider>
    );
}

AppRegistry.registerComponent(appName, () => Main);
