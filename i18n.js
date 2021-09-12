import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// the translations
// (tip move them in a JSON file and import them)
const resources = {
    en: {
        translation: {
            "Alert": "Alert",
            "Abort": "Abort",
            "Aborted": "Aborted",
            "Be careful, the static fire test will start": "Be careful, the static fire test will start",
            "Cancel": "Cancel",
            "Checking fire test started": "Checking fire test started!",
            "Connect": "Connect",
            "Confirm": "Confirm",
            "Connect by bluetooth": "Connect by bluetooth",
            "Connected": "Connected",
            "Current load cell value": "Current load cell value",
            "Disconnected": "Disconnected",
            "Load cell value": "Load cell value",
            "Max Thrust": "Max Thrust",
            "Recorded flights": "Recorded flights",
            "Running Test": "Running Test",
            "Reboot": "Reboot",
            "State": "State",
            "Static Test Fire": "Static Test Fire",
            "Start Test": "Start Test",
            //States
            "Checking systems": "Checking systems",
            "Incorrect cell value": "Incorrect cell value",
            "Ready": "Ready",
            "Test fired ended": "Prueba de fuego estático finalizada",
            "Shutdown": "Shutdown",
            "System error": "System error",
            "SD Not writable": "SD Not writable",
            //State Descriptions
            "DESCRIPTION_DISCONNECTED": "To start, press the 'Connect via Bluetooth' button",
            "DESCRIPTION_READY": "All ready! The motor is ready to start firing sequence",
            "DESCRIPTION_CHECKING_FIRE_TEST_STARTED": "DESCRIPTION_CHECKING_FIRE_TEST_STARTED",
            "DESCRIPTION_TEST_FIRE_ENDED": "The test completed successfully!",
            "DESCRIPTION_INCORRECT_CELL_VALUE": "The load cell value is outside normal parameters, check connections.",
            "DESCRIPTION_SHUTDOWN": "The system is shutdown",
            "DESCRIPTION_SYSTEM_ERROR": "A system error has occurred! Please check the connections and try again",
            "SYSTEM_ERROR_SD_NOT_WRITABLE": "ERROR: Cannot write to SD card",
        }
    },
    es: {
        translation: {
            "Alert": "Alerta",
            "Abort": "Abortar",
            "Aborted": "Abortado",
            "Be careful, the static fire test will start": "Tenga Cuidado, se iniciará la prueba estática de fuego",
            "Cancel": "Cancelar",
            "Checking fire test started": "¡ENCENDIDO INCIADO!",
            "Connect": "Conectar",
            "Confirm": "Confirmar",
            "Connect by bluetooth": "Conectar por bluetooth",
            "Connected": "Conectado",
            "Current load cell value": "Valor actual de la celda de carga",
            "Disconnected": "Desconectado",
            "Load cell value": "Celda de carga",
            "Max Thrust": "Máximo Empuje",
            "Recorded flights": "Vuelos registrados",
            "Running Test": "Corriendo la prueba",
            "Reboot": "Reiniciar",
            "State": "Estado",
            "Static Test Fire": "Static Test Fire",
            "Start Test": "Comenzar la prueba",
            //States
            "Checking systems": "Chequeando sistemas",
            "Ready": "Listo",
            "Test fired ended": "Test fired ended",
            "Incorrect cell value": "Error en la celda de carga",
            "Shutdown": "Sistema apagado",
            "System error": "Error del sistema",
            "SD Not writable": "Error en SD",
            //State Descriptions
            "DESCRIPTION_DISCONNECTED": "Para comenzar, apriete el botón 'Conectar por Bluetooth'",
            "DESCRIPTION_READY": "¡Todo en orden! El motor está listo para comenzar la secuencia de disparo",
            "DESCRIPTION_CHECKING_FIRE_TEST_STARTED": "¡Se inicio el encendido del motor!",
            "DESCRIPTION_INCORRECT_CELL_VALUE": "El valor de la celda de carga está fuera de los parametros normales, verifique las conexiones",
            "DESCRIPTION_TEST_FIRE_ENDED": "¡La prueba finalizó correctamente!",
            "DESCRIPTION_SHUTDOWN": "El sistema se encuentra apagado",
            "DESCRIPTION_SYSTEM_ERROR": "¡Ha ocurrido un error en el sistema! Revise las conexiones y vuelva a intentarlo nuevamente",
            "SYSTEM_ERROR_SD_NOT_WRITABLE": "ERROR: No es posible escribir en la tarjeta SD",
        }
    }
};

i18n
    .use(initReactI18next) // passes i18n down to react-i18next
    .init({
        resources,
        lng: "es",

        keySeparator: false, // we do not use keys in form messages.welcome

        interpolation: {
            escapeValue: false // react already safes from xss
        }
    });

export default i18n;