const dbConnection = require('../dbConnection/mysqlConnection');

let connection = null;

const getConnection = async () => {
    if (connection === null) {
        connection = await dbConnection();
    }

    return connection;
}

exports.getUsuarioByUsername = async (username) => {
    const connection = await getConnection();
    
    const [rows] = await connection.query('SELECT * FROM usuario WHERE username = ?', [username]);

    if(rows.length === 0){
        return null;
    }

    return rows[0];
}
