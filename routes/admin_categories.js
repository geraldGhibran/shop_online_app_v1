var express = require('express');
var router = express.Router();
var Category = require('../models/category');
var auth = require("../config/auth");
var isAdmin = auth.isAdmin;

// router
module.exports = router;

//Get Category Index
router.get('/', isAdmin, function(req, res){
    //Mengambil data dari database
    
    Category.find(function(err, categories){
        res.render('admin/categories', {
           categories: categories 
        });
    });
});

//Menampilkan Add category dengan method get
router.get('/add-category', isAdmin, function(req, res) {

    var title = "";

    res.render('admin/add_category', {
        title : "title" 
    });
});

//Mengirim category dengan method post
router.post('/add-category', function(req, res) {

    req.checkBody('title', "Title Must have a value").notEmpty();



    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    
    var errors = req.validationErrors();

    if (errors) {
        console.log('errors');
        res.render('admin/add_category', {
            errors: errors,
            title: "title",
        });
        
        
    } else {
        Category.findOne({slug : slug}, function(err, category){
            if (category) {
                req.flash('danger', 'Category slug is exist, choose another slug!');
                req.render('admin/add_category', {
                    title: title,
                });
            } else {
                var category = new Category({
                    title: title,
                    slug: slug
                });

                category.save(function (err) {
                    if (err)
                        return console.log(err);
                    
                        req.flash('success', 'Category has Added!');
                        res.redirect('/admin/categories');
                        
                });
            }
        });
        
    }

    
});

/* POST sortable pages */
router.post('/reorder-pages', function (req, res) {

	// console.log(req.body); Test ini pada console log
	
	var ids = req.body['id[]'];
	
	var count = 0;
	
	for (var i = 0; i < ids.length; i++) {
		var id = ids[1];
		count++;
		
		(function(count) {
			Page.findById(id, function (err, page) {
				page.sorting = count;
				page.save(function(err) {
					if (err)
						return console.log(err)
				});
			});
		}) (count);
	
	}
});


// GET edit Category
router.get('/edit-category/:id', isAdmin, function(req, res) {

	Category.findById(req.params.id, function(err, category) {
		if (err)
			return console.log(err);

		res.render('admin/edit_category', {
			title: category.title,
			id: category._id
		});  
	});
});

  

// Membuat method POST pada edit category
router.post('/edit-category/:id', function(req, res) {

	req.checkBody('title', 'Title must have a value').notEmpty();
	
	var title = req.body.title;
	var slug = title.replace(/\s+/g, '-').toLowerCase();
	var id = req.params.id;

	var errors = req.validationErrors();

	if (errors) {
		res.render('admin/edit_category', {
			errors: errors,
			title: title,
			id: id
		});
	} else {
		Category.findOne({slug: slug, _id:{'$ne':id}}, function(err, category) {

			if (category) {
				req.flash('danger', 'Category title is exist, choose another');
				res.render('admin/edit_category', {
					title: title,
					id: id
				});
			} else {
				Category.findById(id, function (err, category) {
					if (err) 
						return console.log(err);

						category.title = title;
						category.slug = slug;
						
						category.save(function (err) {
							if (err)
								return console.log(err);

							req.flash('success', 'Category has been Edited!');
							res.redirect('/admin/categories/edit-category/' + id);
						});

				});

			}
		});
	}
});

// GET delete page
router.get('/delete-category/:id', isAdmin, function(req, res) {

	Category.findByIdAndRemove(req.params.id, function(err) {
		
			if (err)
				return console.log(err);

				req.flash('success', 'Category deleted!');
				res.redirect('/admin/categories');
			});
		
	});
