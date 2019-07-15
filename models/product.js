var mongoose = require('mongoose');

//Product Schema
var ProductSchema = mongoose.Schema({
    title : {
        type : String,
        require : true
    },
    slug : {
        type: String
    },
    desc : {
        type: String,
        require: true
    },
    category : {
        type : String,
        require : true
    },
    price : {
        type : Number,
        require : true
    },
    image: {
        type : String
    }
});

var Product = module.exports = mongoose.model('Product', ProductSchema);