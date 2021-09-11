/**
 * @format
 */
import * as React from 'react';
import {AppRegistry} from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import App from './App';
//import Bte from './src/Bte';
import {name as appName} from './app.json';
import './i18n';

export default function Main() {
    return (
        <PaperProvider>
            <App />
        </PaperProvider>
    );
}

AppRegistry.registerComponent(appName, () => Main);
