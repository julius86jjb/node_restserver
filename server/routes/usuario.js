const express = require('express')
const bcrypt = require('bcrypt');
const _ = require('underscore')
const Usuario = require('../models/usuario')

const app = express()


app.get('/usuario', function(req, res) {

    let desde = Number(req.query.desde || 0);
    let limite = Number(req.query.limite || 5);

    Usuario.find({}, 'nombre email google estado role img') // Usuario.find({estado: true})
        .skip(desde)
        .limit(limite)
        .exec((err, usuarios) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                })
            }

            Usuario.count({}, (err, conteo) => { //  Usuario.count({estado: true}
                res.json({
                    ok: true,
                    usuarios, //usuarios: usuarios
                    cuantos: conteo
                })
            })


        })
})

app.post('/usuario', function(req, res) {

    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    })

    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        // usuarioDB.password = null;
        res.json({
            ok: true,
            usuario: usuarioDB
        })
    })

    // if (body.nombre === undefined) {
    //     res.status(400).json({
    //         ok: false,
    //         mensaje: "el nombre es necesario"
    //     });
    // } else {
    //     res.json({
    //         persona: body
    //     })
    // }


})

app.put('/usuario/:id', function(req, res) {
    let id = req.params.id;
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado'])
        // let body = req.body;

    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    })

})


// FORMA 1: borrado completo del registro de mongodb

// app.delete('/usuario/:id', function(req, res) {

//     let id = req.params.id;

//     Usuario.findByIdAndDelete(id, (err, usuarioBorrado) => {

//         if (err) {
//             return res.status(400).json({
//                 ok: false,
//                 err
//             })
//         }

//         if (!usuarioBorrado) {
//             return res.status(400).json({
//                 ok: false,
//                 err: {
//                     message: 'Usuario no encontrado'
//                 }
//             })
//         }

//         res.json({
//             ok: true,
//             usuario: usuarioBorrado
//         });

//     })
// })


// FORMA 2: borrado con bandera

app.delete('/usuario/:id', function(req, res) {

    let id = req.params.id;
    let body = {
        estado: false
    }

    Usuario.findByIdAndUpdate(id, body, { new: true }, (err, usuarioBorrado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            })
        }

        res.json({
            ok: true,
            usuario: usuarioBorrado
        });

    })
})

module.exports = app;

// mongodb+srv://julius86jjb:<password>@cluster0-qipgr.mongodb.net/cafe atlas to compass