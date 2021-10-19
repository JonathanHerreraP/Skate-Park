// Importamos modulo pg, se crea new pool con campos requeridos:
const {Pool} = require("pg");
const pool = new Pool ({

    user: "postgres",
    host: "localhost",
    database: "skatepark",
    password: "postgres",
    port: 5432,
})

// Registro de un nuevo usuario, INSERT en base de datos:
async function nuevoUsuario(email, nombre, password, anos_experiencia, especialidad, foto){
    const result = pool.query(
        `INSERT INTO skaters (email, nombre, password, anos_experiencia, especialidad, foto, estado) values ('${email}', '${nombre}', '${password}', ${anos_experiencia}, '${especialidad}', '${foto}', 'false')`
    )
}

//Funcion para obtener todos los usuarios, usado en las tablas dinamicas:
async function getUsuarios(){
    const result = await pool.query(`SELECT * FROM skaters`);
    return result.rows
}

//Funcion para modificar estado usuario en la pagina de Admin:
async function setUsuarioStatus(id, estado){
    const result = await pool.query(`UPDATE skaters SET estado = ${estado} WHERE id = ${id} RETURNING*`);

    const usuario = result.rows[0];
    return usuario
}

//Funcion para obtener y validar usuario en el Login:
async function getUsuario(email, password){
    const result = await pool.query(`SELECT * FROM skaters WHERE email = '${email}' AND password = '${password}'`);
    console.log("este es el getUsuario:"+ JSON.stringify(result.rows[0]))
    return result.rows[0];
}

//Funcion para actualizar datos usuario:
async function actualizaUsuario(email, nombre, password, anos_experiencia, especialidad){
    const result = await pool.query(`UPDATE skaters SET nombre = '${nombre}', password = '${password}', anos_experiencia = ${anos_experiencia}, especialidad = '${especialidad}' WHERE email = '${email}' RETURNING*`);

    const usuario = result.rows[0];
    return usuario
}

//Funcion para eliminar datos usuario:
async function eliminaUsuario(email, nombre, password, anos_experiencia, especialidad){
    const result = await pool.query(`DELETE FROM skaters WHERE email = '${email}' RETURNING*`);

    const usuario = result.rows[0];
    return usuario
}
//Exportacion de funciones:
module.exports={ nuevoUsuario, getUsuarios, setUsuarioStatus, getUsuario, actualizaUsuario, eliminaUsuario }