import * as React from 'react';
import { List } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

const NxFileList = (props) => {
    const {t, i18n} = useTranslation();
    const {files} = props;
    return (
        <List.Section title="Flash memory">
            <List.Accordion
                title={t("Recorded flights")}
                left={props => <List.Icon {...props} icon="folder"/>}>
                {files && (
                    <>
                        <List.Item title="First item"/>
                        <List.Item title="Second item"/>
                    </>
                )}
            </List.Accordion>
        </List.Section>
    );
};

export default NxFileList;

const styles = StyleSheet.create({
    bottom: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
    },
});