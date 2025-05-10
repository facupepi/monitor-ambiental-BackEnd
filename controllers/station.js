// Importa las referencias a la base de datos desde la configuración
import dbRefs from "../config.js";

// Controlador para obtener todas las estaciones de monitoreo
export const getStations = async (req, res) => {
    // Obtiene el límite de estaciones a devolver y si se deben incluir las mediciones
    const limit = req.query.limit;
    const includeMeasurements = req.query.measurements === 'true';

    try {
        // Obtiene todos los datos de las estaciones desde la base de datos
        const data = (await dbRefs.Stations.get()).val();
        if (!data) {
            // Si no hay datos, devuelve un error 404
            return res.status(404).send({ msg: "No hay centrales disponibles" });
        }

        // Convierte los datos en un arreglo con formato adecuado
        const dataArray = Object.entries(data).map(([key, value]) => ({ id: key, ...value }));

        // Convierte el límite a un número, con un valor predeterminado de 100 si no se especifica
        let limitNumber = Number(limit);
        if (!limit || isNaN(limitNumber) || limitNumber <= 0) {
            limitNumber = 100;
        }

        // Mapea las estaciones para incluir información básica y, opcionalmente, las mediciones
        const limitedStations = dataArray.map(station => {
            const response = {
                id: station.id,
                name: station.name,
                location: station.location,
            };

            // Si se solicita, incluye las mediciones recientes para diferentes recursos
            if (includeMeasurements) {
                const itemsMapper = {
                    co: getLimitedItems(station, 'co', limitNumber),
                    h2: getLimitedItems(station, 'h2', limitNumber),
                    lpg: getLimitedItems(station, 'lpg', limitNumber),
                    alcohol: getLimitedItems(station, 'alcohol', limitNumber),
                    propane: getLimitedItems(station, 'propane', limitNumber),
                    ch4: getLimitedItems(station, 'ch4', limitNumber),
                    temperature: getLimitedItems(station, 'temperature', limitNumber),
                    humidity: getLimitedItems(station, 'humidity', limitNumber),
                };

                // Solo agrega los datos que no están vacíos a la respuesta
                Object.keys(itemsMapper).forEach(key => {
                    if (itemsMapper[key].length > 0) {
                        response[key] = itemsMapper[key];
                    }
                });
            }

            return response;
        });

        // Devuelve las estaciones limitadas
        res.send(limitedStations);
    } catch (error) {
        // Manejo de errores del servidor
        console.error("Error obteniendo las centrales:", error);
        res.status(500).send({ msg: "Error del servidor" });
    }
};

// Controlador para obtener una estación específica por ID
export const getStationByID = async (req, res) => {
    const stringID = req.params.id; // ID de la estación
    const limit = req.query.limit; // Límite de mediciones
    const includeMeasurements = req.query.measurements === 'true'; // Flag para incluir mediciones

    try {
        // Convierte el límite a un número, con un valor predeterminado de 100 si no se especifica
        let limitNumber = Number(limit);
        if (!limit || isNaN(limitNumber) || limitNumber <= 0) {
            limitNumber = 100;
        }

        // Obtiene los datos de la estación por ID desde la base de datos
        const snapshot = await dbRefs.Stations.child(stringID).once('value');
        if (!snapshot.exists()) {
            // Si la estación no existe, devuelve un error 404
            return res.status(404).send({ msg: "Central no encontrada" });
        }
        const data = snapshot.val();

        // Formatea la respuesta con la información básica de la estación
        const response = {
            id: stringID,
            name: data.name,
            location: data.location,
        };

        // Si se solicita, incluye las mediciones recientes para diferentes recursos
        if (includeMeasurements) {
            const itemsMapper = {
                co: getLimitedItems(data, 'co', limitNumber),
                h2: getLimitedItems(data, 'h2', limitNumber),
                lpg: getLimitedItems(data, 'lpg', limitNumber),
                alcohol: getLimitedItems(data, 'alcohol', limitNumber),
                propane: getLimitedItems(data, 'propane', limitNumber),
                ch4: getLimitedItems(data, 'ch4', limitNumber),
                temperature: getLimitedItems(data, 'temperature', limitNumber),
                humidity: getLimitedItems(data, 'humidity', limitNumber),
            };

            // Solo agrega los datos que no están vacíos a la respuesta
            Object.keys(itemsMapper).forEach((key) => {
                if (itemsMapper[key].length > 0) {
                    response[key] = itemsMapper[key];
                }
            });
        }

        // Devuelve los datos de la estación
        res.send(response);
    } catch (error) {
        // Manejo de errores del servidor
        console.error("Error obteniendo la central:", error);
        res.status(500).send({ msg: "Error del servidor" });
    }
};

// Función auxiliar para obtener un número limitado de mediciones de un tipo específico
export const getLimitedItems = (data, type, limitNumber) => {
    const items = data[type] || {}; // Obtiene los datos del tipo especificado o un objeto vacío

    const itemsArray = Object.values(items); // Convierte los datos en un arreglo

    // Ajusta el límite si es mayor que el número de elementos disponibles
    if (limitNumber > itemsArray.length) {
        limitNumber = itemsArray.length;
    }

    const reversedItemsArray = itemsArray.reverse(); // Invierte el arreglo para obtener los elementos más recientes

    // Devuelve los elementos limitados
    return reversedItemsArray.slice(0, limitNumber);
};

// Controlador para crear una nueva estación
export const postStation = async (req, res) => {
    const data = req.body; // Datos de la nueva estación
    try {
        // Crea una nueva referencia en la base de datos con los datos proporcionados
        const newRef = await dbRefs.Stations.push(data);
        // Devuelve la estación creada con su nuevo ID
        res.status(201).send({ id: newRef.key, ...data });
    } catch (error) {
        // Manejo de errores del servidor
        console.error("Error creando la central:", error);
        res.status(500).send({ msg: "Error del servidor" });
    }
};

// Controlador para actualizar una estación existente por ID
export const putStation = async (req, res) => {
    const id = req.params.id; // ID de la estación a actualizar
    const updates = req.body; // Datos a actualizar
    try {
        // Actualiza los datos de la estación en la base de datos
        await dbRefs.Stations.child(id).update(updates);
        res.send({ msg: "Central actualizada exitosamente" });
    } catch (error) {
        // Manejo de errores del servidor
        console.error("Error actualizando la central:", error);
        res.status(500).send({ msg: "Error del servidor" });
    }
};

// Controlador para eliminar una estación por ID
export const deleteStation = async (req, res) => {
    const id = req.params.id; // ID de la estación a eliminar
    try {
        // Elimina la estación de la base de datos
        await dbRefs.Stations.child(id).remove();
        res.send({ msg: "Central eliminada exitosamente" });
    } catch (error) {
        // Manejo de errores del servidor
        console.error("Error eliminando la central:", error);
        res.status(500).send({ msg: "Error del servidor" });
    }
};
