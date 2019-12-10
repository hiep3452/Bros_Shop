const Products = require("../models/product");

var ITEM_PER_PAGE = 12;
var SORT_ITEM;
var sort_value = "Giá thấp tới cao";
var ptype;
var pprice;
var psize;
var plabel;
var plowerprice;
var price;

exports.getIndexProducts = (req, res, next) => {
  Products.find()
    .limit(8)
    .then(products => {
      res.render("index", {
        title: "Trang chủ",
        user: req.user,
        trendings: products
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Products.find({ _id: `${prodId}` })
    .then(product => {
      res.render("product", {
        title: `${product[0].name}`,
        user: req.user,
        prod: product[0]
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getProducts = (req, res, next) => {
  ptype = req.query.type !== undefined ? req.query.type : ptype;
  pprice = req.query.price !== undefined ? req.query.price : 999999;
  psize = req.query.size !== undefined ? req.query.size : psize;
  plabel = req.query.label !== undefined ? req.query.label : plabel;
  plowerprice = pprice !== 999999 ? pprice - 50 : 0;
  plowerprice = pprice == 1000000 ? 200 : plowerprice;
  SORT_ITEM = req.query.orderby;

  if (SORT_ITEM == -1) {
    sort_value = "Giá cao tới thấp";
    price = "-1";
  }
  console.log(pprice);
  console.log(plowerprice);

  var page = +req.query.page || 1;
  let totalItems;

  Products.find({
    size: new RegExp(psize, "i"),
    price: { $gt: plowerprice, $lt: pprice },
    labels: new RegExp(plabel, "i")
  })

    .countDocuments()
    .then(numProduct => {
      totalItems = numProduct;
      return Products.find({
        size: new RegExp(psize, "i"),
        price: { $gt: plowerprice, $lt: pprice },
        labels: new RegExp(plabel, "i")
      })
        .skip((page - 1) * ITEM_PER_PAGE)
        .limit(ITEM_PER_PAGE)
        .sort({
          price
        });
    })

    // Products
    //   .find
    //   //  {
    //   //productType: [new RegExp(ptype, "i")],
    //   //   size: new RegExp(psize, "i"),
    //   //   labels: new RegExp(plabel, "i"),
    //   //   price: { $gt: plowerprice, $lt: pprice }
    //   // }
    //   ()

    .then(products => {
      res.render("products", {
        title: "Danh sách sản phẩm",
        user: req.user,
        allProducts: products,
        currentPage: page,
        hasNextPage: ITEM_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEM_PER_PAGE),
        ITEM_PER_PAGE: ITEM_PER_PAGE,
        sort_value: sort_value
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.postNumItems = (req, res, next) => {
  ITEM_PER_PAGE = parseInt(req.body.numItems);
  res.redirect("back");
};
