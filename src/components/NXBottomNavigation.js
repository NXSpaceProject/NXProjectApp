import * as React from 'react';
import { BottomNavigation, Text } from 'react-native-paper';
import NXHome from '../NXHome';
import NXStaticFire from '../NXStaticFire';

//const MusicRoute = () => <Text>Music</Text>;

const AlbumsRoute = () => <Text></Text>;

const NXBottomNavigation = (props) => {
    const [index, setIndex] = React.useState(0);
    const [routes] = React.useState([
        { key: 'static', title: 'Static fire', icon: 'fire' },
        { key: 'pad', title: 'Launch Pad', icon: 'wallet-outline' },
        { key: 'home', title: 'Rocket', icon: 'rocket' },
    ]);

    const renderScene = BottomNavigation.SceneMap({
        home: NXHome,
        pad: AlbumsRoute,
        static: NXStaticFire,
    });

    return (
        <BottomNavigation
            navigationState={{ index, routes }}
            onIndexChange={setIndex}
            renderScene={renderScene}
        />
    );
};

export default NXBottomNavigation;