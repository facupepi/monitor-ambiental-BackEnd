// Importa las referencias a la base de datos desde la configuración.
import dbRefs from "../config.js";

// Función para obtener mediciones de un recurso específico de una estación.
export const getMeasurement = async (req, res) => {
    try {
        // Obtiene los parámetros de la solicitud: ID de la estación y tipo de recurso.
        const stationID = req.params['stationid'];
        const resource = req.params['resource'];
        const limit = req.query.limit; // Límite opcional de resultados a devolver.

        // Verifica que los parámetros 'stationID' y 'resource' sean cadenas no vacías.
        if ((typeof stationID !== 'string' || stationID.trim() === '') || (typeof resource !== 'string' || resource.trim() === '')) {
            return res.status(400).send({msg: "Los parámetros 'stationID' y 'resource' deben ser strings no vacíos"});
        }

        // Convierte el límite en un número. Si no es válido, establece un límite por defecto de 100.
        let limitNumber = Number(limit);
        if (!limit || isNaN(limitNumber) || limitNumber <= 0) {
            limitNumber = 100;
        }

        // Crea una referencia al nodo de la base de datos para la estación y el recurso.
        const stationRef = await dbRefs.Stations.child(stationID).child(resource);
        const data = (await stationRef.get()).val(); // Obtiene los datos del recurso.

        // Si no hay datos disponibles, responde con un error 404.
        if (!data) {
            return res.status(404).send({msg: "No hay mediciones de " + resource + " disponibles"});
        }

        // Convierte los datos en un array de objetos, añadiendo el ID de cada medición.
        const dataArray = Object.entries(data).map(([key, value]) => ({id: key, ...value}));

        // Ajusta el límite si es mayor que el número total de elementos.
        if (limitNumber > dataArray.length) {
            limitNumber = dataArray.length;
        }

        // Invierte el array para obtener las mediciones más recientes primero.
        const reversedItemsArray = dataArray.reverse();

        // Toma solo los elementos hasta el límite especificado.
        const limitedDataArray = reversedItemsArray.slice(0, limitNumber);

        // Devuelve las mediciones en la respuesta.
        res.send(limitedDataArray);
    } catch (error) {
        // Maneja cualquier error del servidor y envía un mensaje de error.
        console.error("Error obteniendo las mediciones del recurso solicitado", error);
        res.status(500).send({msg: "Error del servidor"});
    }
};

// Función para obtener una medición específica por su ID.
export const getMeasurementByID = async (req, res) => {
    // Obtiene los parámetros de la solicitud: ID de la estación, recurso y medición.
    const stationID = req.params['stationid'];
    const resource = req.params['resource'];
    const measurementID = req.params['measurementid'];

    // Verifica que los parámetros sean cadenas no vacías.
    if ((typeof stationID !== 'string' || stationID.trim() === '') ||
        (typeof resource !== 'string' || resource.trim() === '') ||
        (typeof measurementID !== 'string' || measurementID.trim() === '')) {
        return res.status(400).send({msg: "Los parámetros 'stationID', 'resource' y 'measurementID' deben ser strings no vacíos"});
    }

    try {
        // Crea una referencia al nodo de la base de datos para la medición específica.
        const snapshot = await dbRefs.Stations.child(stationID).child(resource).child(measurementID).once('value');
        // Si la medición no existe, responde con un error 404.
        if (!snapshot.exists()) {
            return res.status(404).send({msg: "Medición de " + resource + " no encontrada"});
        }
        // Obtiene los datos de la medición y los envía en la respuesta.
        const data = snapshot.val();
        res.send({id: measurementID, ...data});
    } catch (error) {
        // Maneja cualquier error del servidor y envía un mensaje de error.
        console.error("Error obteniendo la medicion del recurso solicitado", error);
        res.status(500).send({msg: "Error del servidor"});
    }
};

// Función para crear una nueva medición en la base de datos.
export const postMeasurement = async (req, res) => {
    // Obtiene los parámetros de la solicitud y los datos del cuerpo de la solicitud.
    const stationID = req.params['stationid'];
    const resource = req.params['resource'];
    const data = req.body;

    // Verifica que los parámetros sean cadenas no vacías.
    if ((typeof stationID !== 'string' || stationID.trim() === '') || (typeof resource !== 'string' || resource.trim() === '')) {
        return res.status(400).send({msg: "Los parámetros 'stationID' y 'resource' deben ser strings no vacíos"});
    }

    try {
        // Crea una referencia al nodo de la base de datos para la estación y el recurso.
        const stationRef = await dbRefs.Stations.child(stationID).child(resource);
        // Agrega los datos como una nueva entrada en la base de datos.
        const newRef = await stationRef.push(data);
        // Responde con un estado 201 y la nueva medición creada.
        res.status(201).send({id: newRef.key, ...data});
    } catch (error) {
        // Maneja cualquier error del servidor y envía un mensaje de error.
        console.error("Error creando la medición del recurso solicitado", error);
        res.status(500).send({msg: "Error del servidor"});
    }
};
