import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// the translations
// (tip move them in a JSON file and import them)
const resources = {
    en: {
        translation: {
            "Alert": "Alert",
            "Aborted": "Aborted",
            "Be careful, the static fire test will start": "Be careful, the static fire test will start",
            "Cancel": "Cancel",
            "Checking fire test started": "Checking fire test started!",
            "Connect": "Connect",
            "Confirm": "Confirm",
            "Connect by bluetooth": "Connect by bluetooth",
            "Connected": "Connected",
            "Disconnected": "Disconnected",
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
            "Shutdown": "Shutdown",
            "System error": "System error",
            //State Descriptions
            "DESCRIPTION_DISCONNECTED": "The rocket is ready to begin the launch sequence",
            "DESCRIPTION_READY": "The rocket is ready to begin the launch sequence",
            "DESCRIPTION_CHECKING_FIRE_TEST_STARTED": "DESCRIPTION_CHECKING_FIRE_TEST_STARTED",
            "DESCRIPTION_TEST_FIRE_ENDED": "DESCRIPTION_TEST_FIRE_ENDED",
            "DESCRIPTION_INCORRECT_CELL_VALUE": "El valor de la celda de carga está fuera de los parametros normales, verifique las conexiones",
            "DESCRIPTION_SHUTDOWN": "El sistema se encuentra apagado",
            "DESCRIPTION_SYSTEM_ERROR": "¡Ha ocurrido un error en el sistema! Revise las conexiones y vuelva a intentarlo nuevamente",
        }
    },
    es: {
        translation: {
            "Alert": "Alerta",
            "Aborted": "Abortado",
            "Be careful, the static fire test will start": "Tenga Cuidado, se iniciará la prueba estatica de fuego",
            "Cancel": "Cancelar",
            "Checking fire test started": "¡ENCENDIDO INCIADO!",
            "Connect": "Conectar",
            "Confirm": "Confirmar",
            "Connect by bluetooth": "Conectar por bluetooth",
            "Connected": "Conectado",
            "Disconnected": "Desconectado",
            "Recorded flights": "Vuelos registrados",
            "Running Test": "Corriendo la prueba",
            "Reboot": "Reiniciar",
            "State": "Estado",
            "Static Test Fire": "Static Test Fire",
            "Start Test": "Comenzar la prueba",
            //States
            "Checking systems": "Chequeando sistemas",
            "Ready": "Listo",
            "Incorrect cell value": "Error en la celda de carga",
            "Shutdown": "Sistema apagado",
            "System error": "Error del sistema",
            //State Descriptions
            "DESCRIPTION_DISCONNECTED": "Para comenzar, apriete el botón",
            "DESCRIPTION_READY": "¡Todo en orden! El cohete está listo para comenzar la secuencia de lanzamiento",
            "DESCRIPTION_CHECKING_FIRE_TEST_STARTED": "¡Se inicio el encendido del motor!",
            "DESCRIPTION_INCORRECT_CELL_VALUE": "El valor de la celda de carga está fuera de los parametros normales, verifique las conexiones",
            "DESCRIPTION_TEST_FIRE_ENDED": "DESCRIPTION_TEST_FIRE_ENDED",
            "DESCRIPTION_SHUTDOWN": "El sistema se encuentra apagado",
            "DESCRIPTION_SYSTEM_ERROR": "¡Ha ocurrido un error en el sistema! Revise las conexiones y vuelva a intentarlo nuevamente",
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