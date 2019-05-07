const express = require('express');
const { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion');
const _ = require('underscore');

let app = express();

let Categoria = require('../models/categoria');


app.get('/categoria', verificaToken, function(req, res) {


    Categoria.find({}) // Usuario.find({estado: true})
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, categorias) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }

            res.json({
                ok: true,
                categorias,
            })



        })
})

app.get('/categoria/:id', verificaToken, function(req, res) {

    let id = req.params.id;
    Categoria.findById(id, (err, categoria) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!categoria) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID no es correcto'
                }
            })
        }

        res.json({
            ok: true,
            categoria,
        })



    })
})


app.post('/categoria', verificaToken, function(req, res) {

    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id,
    })

    categoria.save((err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        // usuarioDB.password = null;
        res.json({
            ok: true,
            categoria: categoriaDB
        })
    })

})


app.put('/categoria/:id', [verificaToken, verificaAdminRole], function(req, res) {
    let id = req.params.id;
    let body = req.body

    let descCategoria = {
        descripcion: body.descripcion
    }

    Categoria.findByIdAndUpdate(id, descCategoria, { new: true, runValidators: true }, (err, catDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!catDB) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        res.json({
            ok: true,
            categoria: catDB
        });
    })

})


app.delete('/categoria/:id', function(req, res) {

    let id = req.params.id;

    Categoria.findByIdAndRemove(id, [verificaToken, verificaAdminRole], (err, categoriaBorrada) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        if (!categoriaBorrada) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Categoria no encontrada'
                }
            })
        }

        res.json({
            ok: true,
            message: 'Categoría Borrada'
        });

    })
})

module.exports = app;