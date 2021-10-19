//Importamos modulos necesarios:
const express = require("express");
const app = express();
const exphbs = require("express-handlebars");
const Handlebars = require('handlebars');
const expressFileUpload = require("express-fileupload");
const pg = require("pg")
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const secretKey = "llavesecreta";

//Helper "inc" para arreglar id comience en 1 y no en 0:
Handlebars.registerHelper("inc", function(value, options)
{
    return parseInt(value) + 1;
});

//Importamos funciones desde consultas:
const { nuevoUsuario, getUsuarios, setUsuarioStatus, getUsuario, actualizaUsuario, eliminaUsuario } = require("./consultas.js")

//Se levanta servidor en el puerto 3000:
app.listen(3000, console.log("Servidor escuchando en el puerto 3000"));

//uso del body parser:
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//uso de la carpeta public:
app.use(express.static(__dirname+'/public'))
app.use(express.static(__dirname+'/public/img'))

// Uso del express fileupload para carga de archivos con tamaño máximo de 5Mb:
app.use(expressFileUpload({
    limits:5000000, 
    abortOnLimit:true, 
    responseOnLimit:"El archivo cargado excede los 5Mb"
}));

//Uso de bootstrap:
app.use("/css", express.static(__dirname + "/node_modules/bootstrap/dist/css"))

//Uso de handlebars:
app.engine("handlebars",exphbs({
    defaultLayout:"main",
    layoutsDir:`${__dirname}/views/mainLayout`
}));

app.set("view engine", "handlebars");

//Pagina de inicio, pasamos los usuarios para la tabla:
app.get("/", async(req, res)=>{
    try{
        const usuarios = await getUsuarios()
        res.render("index", { usuarios });
       }
       catch(e){
           console.log(e);
       }
});

//pagina de registro:
app.get("/Registro", function(req, res){
    res.render("Registro")
});

//pagina de Login:
app.get("/Login", function(req, res){
    res.render("Login");
});

//pagina de datos:
app.get("/Datos", function(req, res){
    res.render("Datos");
});


//Ruta Post para registro, crea nuevoUsuario en base de datos:
app.post("/Registro", async(req, res)=>{
const {email, nombre, password, anos_experiencia, especialidad, foto} = req.body;

try{
    const usuario = await nuevoUsuario(email, nombre, password, anos_experiencia, especialidad, foto);
    
    // Sube imagen cargada al servidor en la carpeta public/img :
    const { fotito } =req.files;
    const { name } = fotito
    fotito.mv(`${__dirname}/public/img/${name}`)
    res.render("Login");    
}
catch(e){
    console.log("Ocurrio un error:" + e);
}
});

//Ruta para vista Admin:
app.get("/Admin", async(req, res)=>{
   // Se le pasa el arreglo de usuarios para despues iterarlo y mostrarlo en la vista:
   try{
    const usuarios = await getUsuarios()
    res.render("Admin", { usuarios });
   }
   catch(e){
       console.log(e);
   }
})

//Ruta PUT para el set status de usuario:
app.put("/usuarios", async(req, res)=>{
    const {id, estado}= req.body;
    try{
        const usuario = await setUsuarioStatus(id, estado);
        res.status(200).send(usuario)
    }
    catch(e){
        console.log(e);
    }
})

//Ruta POST para verificacion de credenciales, genera token firmado y su tiempo expiracion:
app.post("/verificar", async function(req, res){
    const { email, password } = req.body;
    const user =await getUsuario(email, password);

    if (user){
        console.log("Si existe user")
        if (user.estado){
            const token = jwt.sign(
                {
                    exp: Math.floor(Date.now()/ 1000)+200, 
                    data: user, 
                },
                secretKey
            )
            res.send(token);
            
            console.log("usuario existe y está validado por el Admin")   
        }
        else{
            res.status(401).send({
                error: "Este usuario no ha sido validado por el Admin",
                code:401
            })
            console.log("Este usuario existe en la base, pero no ha sido validado")
        }
    }

    else{
        res.status(404).send({
            error: "Este usuario no está registrado",
            code:404
        })
        console.log("No existe este usuario")
    }
})

//Ruta PUT para actualizar usuario en base de datos:
app.put("/actualizar", async(req, res)=>{
    const {email, nombre, password, anos_experiencia, especialidad} = req.body;
    
    try{
        const usuario = await actualizaUsuario(email, nombre, password, anos_experiencia, especialidad);
        res.render("Login");    
    }
    catch(e){
        console.log("Error:" + e);
    }
    });

//Ruta POST para eliminar usuario en base de datos:
app.post("/eliminar", async(req, res)=>{
    const {email, nombre, password, anos_experiencia, especialidad} = req.body;
    
    try{
        const usuario = await eliminaUsuario(email, nombre, password, anos_experiencia, especialidad);
        res.render("Login");    
    }
    catch(e){
        console.log("Error:" + e);
    }
    });