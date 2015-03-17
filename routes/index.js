/*
 * GET home page.
 */
exports.indexbeta = function(req,res) {
  res.render('indexbeta');
};

exports.index = function(req, res){
    res.render('index');
};

exports.partials = function (req, res) {
    var name = req.params.name;
    res.render('partials/' + name);
};
