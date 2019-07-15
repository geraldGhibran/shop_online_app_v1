var express = require("express");
var router = express.Router();
var auth = require("../config/auth");
var isAdmin = auth.isAdmin;

// Get Category model.
var Page = require("../models/page");

// Get pages index
router.get("/", isAdmin, function(req, res) {
  // mengambil data dari database
  Page.find({})
    .sort({ sorting: 1 })
    .exec(function(err, pages) {
      res.render("admin/pages", {
        pages: pages
      });
    });
});

// Membuat add page dengan method GET
router.get("/add-page", isAdmin, function(req, res) {
  var title = "";
  var slug = "";
  var content = "";

  res.render("admin/add_page", {
    title: title,
    slug: slug,
    content: content
  });
});

// Membuat method POST pada add page
router.post("/add-page", function(req, res) {
  req.checkBody("title", "Title must have a value").notEmpty();
  req.checkBody("content", "Content must have a value").notEmpty();

  var title = req.body.title;
  var slug = req.body.slug.replace(/\s+/g, "-").toLowerCase();
  if (slug == "") slug = title.replace(/\s+/g, "-").toLowerCase();

  var content = req.body.content;

  var errors = req.validationErrors();

  if (errors) {
    res.render("admin/add_page", {
      errors: errors,
      title: title,
      slug: slug,
      content: content
    });
  } else {
    Page.findOne({ slug: slug }, function(err, page) {
      if (page) {
        req.flash("danger", "Page slug is exist, choose another slug");
        res.render("admin/add_page", {
          title: title,
          slug: slug,
          content: content
        });
      } else {
        var page = new Page({
          title: title,
          slug: slug,
          content: content,
          sorting: 100
        });

        page.save(function(err) {
          if (err) return console.log(err);

          // add here
          Page.find({})
            .sort({ sorting: 1 })
            .exec(function(err, pages) {
              if (err) {
                console.log(err);
              } else {
                req.app.locals.pages = pages;
              }
            });

          req.flash("success", "Page added!");
          res.redirect("/admin/pages");
        });
      }
    });
  }
});

// Sort pages function
function sortPages(ids, callback) {
  var count = 0;

  for (var i = 0; i < ids.length; i++) {
    var id = ids[i];
    count++;

    (function(count) {
      Page.findById(id, function(err, page) {
        page.sorting = count;
        page.save(function(err) {
          if (err) return console.log(err);
          ++count;
          if (count >= ids.length) {
            callback();
          }
        });
      });
    })(count);
  }
}

// Membuat POST sortable pages
router.post("/reorder-pages", function(req, res) {
  // console.log(req.body);

  var ids = req.body["id[]"];

  sortPages(ids, function() {
    Page.find({})
      .sort({ sorting: 1 })
      .exec(function(err, pages) {
        if (err) {
          console.log(err);
        } else {
          req.app.locals.pages = pages;
        }
      });
  });
});

// GET edit page
router.get("/edit-page/:slug", isAdmin, function(req, res) {
  Page.findOne({ slug: req.params.slug }, function(err, page) {
    if (err) return console.log(err);

    res.render("admin/edit_page", {
      title: page.title,
      slug: page.slug,
      content: page.content,
      id: page._id
    });
  });
});

// Membuat method POST pada edit page
router.post("/edit-page/:slug", function(req, res) {
  req.checkBody("title", "Title must have a value").notEmpty();
  req.checkBody("content", "Content must have a value").notEmpty();

  var title = req.body.title;
  var slug = req.body.slug.replace(/\s+/g, "-").toLowerCase();
  if (slug == "") slug = title.replace(/\s+/g, "-").toLowerCase();

  var content = req.body.content;
  var id = req.body.id;

  var errors = req.validationErrors();

  if (errors) {
    res.render("admin/edit_page", {
      errors: errors,
      title: title,
      slug: slug,
      content: content,
      id: id
    });
  } else {
    Page.findOne({ slug: slug, _id: { $ne: id } }, function(err, page) {
      if (page) {
        req.flash("danger", "Page slug is exist, choose another slug");
        res.render("admin/edit_page", {
          title: title,
          slug: slug,
          content: content,
          id: id
        });
      } else {
        Page.findById(id, function(err, page) {
          if (err) return console.log(err);

          page.title = title;
          page.slug = slug;
          page.content = content;

          page.save(function(err) {
            if (err) return console.log(err);

            // add here
            Page.find({})
              .sort({ sorting: 1 })
              .exec(function(err, pages) {
                if (err) {
                  console.log(err);
                } else {
                  req.app.locals.pages = pages;
                }
              });

            req.flash("success", "Page has been update!");
            res.redirect("/admin/pages/edit-page/" + page.slug);
          });
        });
      }
    });
  }
});

// GET delete page
router.get("/delete-pages/:id", isAdmin, function(req, res) {
  Page.findByIdAndRemove(req.params.id, function(err) {
    if (err) return console.log(err);

    // add here
    Page.find({})
      .sort({ sorting: 1 })
      .exec(function(err, pages) {
        if (err) {
          console.log(err);
        } else {
          req.app.locals.pages = pages;
        }
      });

    req.flash("success", "Page deleted!");
    res.redirect("/admin/pages/");
  });
});

// export
module.exports = router;
