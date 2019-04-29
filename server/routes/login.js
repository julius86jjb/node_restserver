const express = require('express')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

const Usuario = require('../models/usuario')

const app = express()



app.post('/login', (req, res) => {


    let body = req.body;
    Usuario.findOne({ email: body.email }, (err, UsuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!UsuarioDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: '(Usuario) o password no encontrados'
                }
            })
        }
        if (!bcrypt.compareSync(body.password, UsuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o (password) no encontrados'
                }
            })
        }

        let token = jwt.sign({
            usuario: UsuarioDB
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN })

        res.json({
            ok: true,
            usuario: UsuarioDB,
            token: token
        })
    })



})

// Configuracion de Google 
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    // console.log(payload);
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}


app.post('/google', async(req, res) => {
    let token = req.body.idtoken;
    let googleUser = await verify(token)
        .catch(err => {
            res.status(403).json({
                ok: false,
                err
            })
        })
        // res.json({
        //     usuario: googleUser
        // })
    Usuario.findOne({ email: googleUser.email }, (err, UsuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (UsuarioDB) {
            // Existe el usuario pero no se ha autenticado por google
            if (UsuarioDB.google === false) {
                return res.status(400).json({
                        ok: false,
                        err: {
                            message: 'Este email ya está registrado para inicar sesion con login normal'
                        }
                    })
                    // Si anteriormente ya se ha autenticado con google, actualizamos el token
            } else {
                let token = jwt.sign({
                    usuario: UsuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN })

                return res.json({
                    ok: true,
                    usuario: UsuarioDB,
                    token
                })
            }
        } else {
            // si el user no existe en la db, es decir, la primera vez que se esta autenticando con ese email
            let usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)'; //para poder pasar la validacion de nuestra modelo

            usuario.save((err, UsuarioDB) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    })
                }

                let token = jwt.sign({
                    usuario: UsuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN })

                return res.json({
                    ok: true,
                    usuario: UsuarioDB,
                    token
                })

            })

        }
    })

})


module.exports = app;