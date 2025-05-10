// Importa el módulo 'admin' de Firebase para interactuar con los servicios de Firebase.
import admin from "firebase-admin";

// Importa 'dotenv' para manejar las variables de entorno.
import dotenv from 'dotenv';

// Carga las variables de entorno desde un archivo .env.
dotenv.config();

// Convierte la cadena JSON almacenada en la variable de entorno 'FIREBASE_CONFIG' en un objeto JavaScript.
const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);

// Inicializa la aplicación de Firebase con las credenciales del servicio.
admin.initializeApp({
    // Autentica la aplicación con las credenciales del servicio obtenidas de la variable de entorno.
    credential: admin.credential.cert(serviceAccount),                    
    // Define la URL de tu Firebase Realtime Database.
    databaseURL: "https://monitoreo-de-gases-default-rtdb.firebaseio.com"
});

// Crea una referencia a la base de datos en tiempo real usando el SDK admin.
const db = admin.database();

// Hace referencia a un nodo llamado "Lecturas" y "Stations" en la base de datos.
const Lecturas = db.ref("Lecturas");

const Stations = db.ref("stations")

// Exporta la referencia para que se pueda usar en otras partes de la aplicación para leer/escribir datos sobre las lecturas de los sensores.

export default {Lecturas, Stations}