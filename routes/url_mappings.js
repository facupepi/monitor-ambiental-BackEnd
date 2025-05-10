// Importa el módulo 'express' para crear un enrutador.
import express from 'express';

// Importa las funciones del controlador relacionadas con las estaciones.
import { getStations, getStationByID, postStation, putStation, deleteStation } from "../controllers/station.js";

// Importa las funciones del controlador relacionadas con las mediciones.
import { getMeasurement, getMeasurementByID, postMeasurement } from "../controllers/measurement.js";

// Importa la función de controlador para la verificación de estado del servidor (ping).
import { ping } from "../controllers/ping.js";

// Crea un enrutador de Express para definir las rutas de la API.
const router = express.Router();

// Define un endpoint 'ping' para verificar si el servidor está activo.
router.get('/ping', ping);

// Define una ruta para obtener mediciones de una estación específica y recurso.
router.get('/stations/:stationid/measurement/:resource', getMeasurement);

// Define una ruta para obtener una medición específica por su ID.
router.get('/stations/:stationid/measurement/:resource/:measurementid', getMeasurementByID);

// Define una ruta para crear una nueva medición para un recurso de una estación.
router.post('/stations/:stationid/measurement/:resource', postMeasurement);

// Define una ruta para obtener todas las estaciones.
router.get('/stations', getStations);

// Define una ruta para obtener una estación específica por su ID.
router.get('/stations/:id', getStationByID);

// Define una ruta para crear una nueva estación.
router.post('/stations', postStation);

// Define una ruta para actualizar una estación existente por su ID.
router.put('/stations/:id', putStation);

// Define una ruta para eliminar una estación existente por su ID.
router.delete('/stations/:id', deleteStation);

// Exporta el enrutador para que pueda ser utilizado en otros archivos del proyecto.
export default router;
