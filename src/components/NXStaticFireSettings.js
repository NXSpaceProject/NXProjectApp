import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import {
    Button,
    Title,
    Paragraph,
    Caption
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import RNPickerSelect from 'react-native-picker-select';

const NXStaticFireSettings = (props) => {
    const {t, i18n} = useTranslation();
  // const {fireLightStartThreshold} = props;
    const [dirty, setDirty] = useState(false);

    const changeContent = (value) => {
        props.updateSetting(value);
        setDirty(true);
    }

    const saveSettings = () => {
        props.saveSettings();
        setDirty(false);
    }

    return (
        <>
            <Caption>Light sensor threshold</Caption>
            <RNPickerSelect
                onValueChange={(value) => changeContent({fireLightStartThreshold: value})}
                items={[
                    { label: "10", value: 10 },
                    { label: "100", value: 100 },
                    { label: "200", value: 200 },
                    { label: "300", value: 300 },
                    { label: "400", value: 400 },
                    { label: "500", value: 500 },
                    { label: "600", value: 600 },
                    { label: "700", value: 700 },
                    { label: "800", value: 800 },
                    { label: "900", value: 900 },
                    { label: "1000", value: 1000 },
                ]}
            />

            <Button
                onPress={() => saveSettings() }
                disabled={!dirty}
                icon="content-save" mode="contained">
                { t("Save") }
            </Button>
        </>
    );
};

export default NXStaticFireSettings;

const styles = StyleSheet.create({
    bottom: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
    },
});