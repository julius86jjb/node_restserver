const express = require('express');
const { verificaToken } = require('../middlewares/autenticacion');
let Producto = require('../models/producto');

let app = express();


module.exports = app;


// Obtener todos los productos

app.get('/productos', (req, res) => {
    //devuelve todos los prods
    //populate: usuario categoria
    //paginado
    let desde = Number(req.query.desde || 0);
    let limite = Number(req.query.limite || 4);
    Producto.find({ disponible: true }) // Usuario.find({estado: true})
        .skip(desde)
        .limit(limite)
        .populate('usuario', 'nombre')
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }

            res.json({
                ok: true,
                productos,
            })



        })
});



// Obtener un producto por ID

app.get('/productos/:id', (req, res) => {
    let id = req.params.id;
    Producto.findById(id)
        .populate('usuario', 'nombre')
        .populate('categoria', 'descripcion')
        .exec((err, producto) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }

            if (!producto) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'El ID no es correcto'
                    }
                })
            }

            res.json({
                ok: true,
                producto,
            })



        })
        //populate: usuario categoria
});


// BUSCAR PRODCUTOS

app.get('/productos/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;

    let regexp = new RegExp(termino, 'i') // regexp = expresion regular  // 'i' para que sea insesible a mayusculas y todo eso...

    Producto.find({ nombre: regexp })
        .populate('categoria', 'nombre')
        .exec((err, prods) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }

            res.json({
                ok: true,
                productos: prods,
            })
        })
})

app.post('/productos', verificaToken, (req, res) => {
    let body = req.body;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
        usuario: req.usuario._id,
    })

    producto.save((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        res.status(201).json({ // el status 201 se lanza cuando se completa un nuevo registro... hay gente que lo usa y otros no
            ok: true,
            producto: productoDB
        })
    })

});

app.put('/productos/:id', verificaToken, (req, res) => { // ver alterntiva con FindById y .save() desarollado por fer
    let id = req.params.id;
    let body = req.body

    let modificaciones = {
        descripcion: body.descripcion,
        nombre: body.nombre_producto,
        precioUni: body.precioUni,
        categoria: body.categoria,
        disponible: body.disponible
    }

    Producto.findByIdAndUpdate(id, modificaciones, { new: true, runValidators: true }, (err, prodDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!prodDB) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        res.json({
            ok: true,
            categoria: prodDB
        });
    })
});

app.delete('/productos/:id', verificaToken, (req, res) => {
    // delete con bandera...disponible
    let id = req.params.id;
    let body = {
        disponible: false
    }

    Producto.findByIdAndUpdate(id, body, { new: true }, (err, productoBorrado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        if (!productoBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no encontrado'
                }
            })
        }

        res.json({
            ok: true,
            usuario: productoBorrado,
            mensaje: 'producto borrado'
        });

    })
});