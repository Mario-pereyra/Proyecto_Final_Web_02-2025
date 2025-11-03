const dbConnection = require('../dbConnection/mysqlConnection');

let connection = null;
const getConnection = async () => {
    connection = connection || await dbConnection();
    return connection;
}

const getPhonesByContactId = async (contactId) => {
    const connection = await getConnection();

    const [rows] = await connection.query('SELECT * FROM telefonoContacto WHERE contactoId = ? order by telefonoContactoId', [contactId]);
    return rows;
}

const getContactsByUserId = async (userId) => {
    const connection = await getConnection();

    const [rows] = await connection.query('SELECT * FROM contacto where usuarioId = ?', [userId]);

    for(let contact of rows) {
        contact.telefonos = await getPhonesByContactId(contact.contactoId);
        contact.telefono = contact.telefonos.length > 0 ? contact.telefonos[0].nroTelefono : "";
    }

    return rows;
}
const getContactById = async (id) =>{
    const connection = await getConnection();

    const [rows] = await connection.query('SELECT * FROM contacto WHERE contactoId = ?', [id]);

    if (rows.length === 0) {
        return null;
    }
    const contacto = rows[0];
    contacto.telefonos = await getPhonesByContactId(id);;

    contacto.telefono = contacto.telefonos.length > 0 ? contacto.telefonos[0].nroTelefono : "";

    return contacto;
}

const createContact = async (contacto) => {
    const {
        nombreContacto,
        email,
        usuarioId,
        imagenId,
        telefonos
    } = contacto;
    
    const connection = await getConnection();

    const existeImage = !isNaN(imagenId) && imagenId > 0;

    const data = [nombreContacto, email, usuarioId, imagenId];
    const sql = 'INSERT INTO contacto (nombreContacto, email, usuarioId, imagenId) values (?,?,?,?)';

    const [result] = await connection.query(sql, data);
    const contactoId = result.insertId;

    if(existeImage){
        await connection.query('UPDATE imagen SET temporal = 0 WHERE imagenId = ?', [imagenId]);
    }

    for (let telefono of telefonos) {
        const data = [telefono.nroTelefono, contactoId];
        const sql = 'INSERT INTO telefonoContacto (nroTelefono, contactoId) values (?,?)';
        await connection.query(sql, data);
    }

    const contact = await getContactById(contactoId);
    return contact;
}


const deleteContact = async (id) => {
    const connection = await getConnection();
    const oldContactVersion = await getContactById(id);

    if(oldContactVersion.imagenId && oldContactVersion.imagenId > 0){
        await connection.query('UPDATE imagen SET temporal = 1 WHERE imagenId = ?', [oldContactVersion.imagenId]);
    }

    const [rows] = await connection.query('DELETE FROM contacto WHERE contactoId = ?', [id]);
    return rows.affectedRows;
}

const updateContact = async (contact) => {
    const {
        contactoId,
        nombreContacto,
        email,
        imagenId,
        telefonos
    } = contact;

    const oldContactVersion = await getContactById(contactoId);

    const connection = await getConnection();

    const existeImage = !isNaN(imagenId) && imagenId > 0;
    const data = [nombreContacto, email, existeImage ?  imagenId : null, contactoId];
    const sql = 'UPDATE contacto SET nombreContacto = ?, email = ?, imagenId = ? WHERE contactoId = ?';

    const [result] = await connection.query(sql, data);
    if(existeImage){
        await connection.query('UPDATE imagen SET temporal = 0 WHERE imagenId = ?', [imagenId]);        
    }
    if(oldContactVersion.imagenId && oldContactVersion.imagenId !== imagenId){
        await connection.query('UPDATE imagen SET temporal = 1 WHERE imagenId = ?', [oldContactVersion.imagenId]);
    }

    for (let telefono of oldContactVersion.telefonos) {
        const telefonoExisteEnNewContact = telefonos.find(t => t.telefonoContactoId == telefono.telefonoContactoId);
        if(telefonoExisteEnNewContact){
            continue;
        }
        const data = [telefono.telefonoContactoId];
        const sql = 'DELETE FROM telefonoContacto WHERE telefonoContactoId = ?';
        await connection.query(sql, data);
    }

    for (let telefono of telefonos) {

        if(telefono.telefonoContactoId && telefono.telefonoContactoId != 0){


            const data = [telefono.nroTelefono, telefono.telefonoContactoId];
            const sql = 'UPDATE telefonoContacto SET nroTelefono = ? WHERE telefonoContactoId = ?';
            await connection.query(sql, data);

            
            continue;
        }
        const data = [telefono.nroTelefono, contactoId];
        const sql = 'INSERT INTO telefonoContacto (nroTelefono, contactoId) values (?,?)';
        await connection.query(sql, data);
    }

    const updatedContact = await getContactById(contactoId);
    return updatedContact;
}

module.exports = {
    getContactsByUserId,
    createContact,
    getContactById,
    deleteContact,
    updateContact
};