// Importa el módulo 'express' para crear una aplicación web.
import express from "express";

// Importa 'body-parser' para manejar el cuerpo de las solicitudes HTTP.
import bodyParser from "body-parser";

// Importa 'cors' para habilitar CORS (Cross-Origin Resource Sharing), permitiendo que la API sea accesible desde otros dominios.
import cors from "cors";

// Importa las rutas definidas en el archivo 'url_mappings.js'.
import routes from "./routes/url_mappings.js";

// Define el puerto en el que la aplicación escuchará las solicitudes. Utiliza el valor de la variable de entorno 'PORT', o 3000 si no está definida.
const PORT = process.env.PORT || 3000;

// Crea una instancia de una aplicación Express.
const app = express();

// Configura el middleware para parsear el cuerpo de las solicitudes en formato JSON.
app.use(bodyParser.json());

// Habilita CORS para permitir solicitudes desde otros orígenes.
app.use(cors());

// Monta las rutas definidas en el archivo de mapeo de URL, que gestionarán las diferentes solicitudes HTTP.
app.use(routes);

// Inicia el servidor y lo pone a escuchar en el puerto definido.
app.listen(PORT, () => {
    // Muestra un mensaje en la consola indicando que el servidor está en funcionamiento y en qué puerto.
    console.log("Server listening on port " + PORT);
});