
// Fake bill database for example

var bills = [
    { id: 0, serial: 'X18084287225', denomination: 20, currency: 'euro' }
  , { id: 1, serial: 'M81450250492', denomination: 10, currency: 'euro' }
  , { id: 2, serial: 'V20393535199', denomination: 5, currency: 'euro' }
];

function get(id, fn) {
  if (bills[id]) {
    fn(null, bills[id]);
  } else {
    fn(new Error('Bill ' + id + ' does not exist'));
  }
}

module.exports = {
  
  // /bills
  
  index: function(req, res){
    res.render(bills);
  },

  // /bills/:id

  show: function(req, res, next){
    get(req.params.id, function(err, bill){
      if (err) return next(err);
      res.render(bill);
    });
  },
  
  // /bills/:id/edit
  
  edit: function(req, res, next){
    get(req.params.id, function(err, bill){
      if (err) return next(err);
      res.render(bill);
    });
  },
  
  // PUT /bills/:id
  
  update: function(req, res, next){
    var id = req.params.id;
    get(id, function(err){
      if (err) return next(err);
      var bill = bills[id] = req.body.bill;
      bill.id = id;
      req.flash('info', 'Successfully updated _' + bill.serial + '_.');
      res.redirect('back');
    });
  }
};