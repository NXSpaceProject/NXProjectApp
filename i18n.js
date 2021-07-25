import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// the translations
// (tip move them in a JSON file and import them)
const resources = {
    en: {
        translation: {
            "Alert": "Alert",
            "Be careful, the static fire test will start": "Be careful, the static fire test will start",
            "Cancel": "Cancel",
            "Connect": "Connect",
            "Confirm": "Confirm",
            "Connect by bluetooth": "Connect by bluetooth",
            "Connected": "Connected",
            "Disconnected": "Disconnected",
            "Recorded flights": "Recorded flights",
            "Running Test": "Running Test",
            "State": "State",
            "Static Test Fire": "Static Test Fire",
            "Start Test": "Start Test",
            //States
            "Checking systems": "Checking systems",
            "Ready": "Ready",
            "Shutdown": "Shutdown",
            "System error": "System error",
            //State Descriptions
            "DESCRIPTION_DISCONNECTED": "The rocket is ready to begin the launch sequence",
            "DESCRIPTION_READY": "The rocket is ready to begin the launch sequence",
            "DESCRIPTION_SHUTDOWN": "El sistema se encuentra apagado",
            "DESCRIPTION_SYSTEM_ERROR": "¡Ha ocurrido un error en el sistema! Revise las conexiones y vuelva a intentarlo nuevamente",
        }
    },
    es: {
        translation: {
            "Alert": "Alerta",
            "Be careful, the static fire test will start": "Tenga Cuidado, se iniciará la prueba estatica de fuego",
            "Cancel": "Cancelar",
            "Connect": "Conectar",
            "Confirm": "Confirmar",
            "Connect by bluetooth": "Conectar por bluetooth",
            "Connected": "Conectado",
            "Disconnected": "Desconectado",
            "Recorded flights": "Vuelos registrados",
            "Running Test": "Corriendo la prueba",
            "State": "Estado",
            "Static Test Fire": "Static Test Fire",
            "Start Test": "Comenzar la prueba",
            //States
            "Checking systems": "Chequeando sistemas",
            "Ready": "Listo",
            "Shutdown": "Sistema apagado",
            "System error": "Error del sistema",
            //State Descriptions
            "DESCRIPTION_DISCONNECTED": "Para comenzar, apriete el botón",
            "DESCRIPTION_READY": "¡Todo en orden! El cohete está listo para comenzar la secuencia de lanzamiento",
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