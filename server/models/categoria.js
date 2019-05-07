const mongoose = require('mongoose');

const Usuario = require('../models/usuario');

let Schema = mongoose.Schema;


let categoriaSchema = new Schema({
    descripcion: {
        type: String,
        unique: true,
        required: [true, 'La descripción es obligatoria']
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario'
    }
});
categoriaSchema.methods.toJSON = function() {
    let cat = this;
    let categoriaObject = cat.toObject();
    console.log(categoriaObject)
    return categoriaObject;
}



module.exports = mongoose.model('Categoria', categoriaSchema)