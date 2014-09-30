// Generated by CoffeeScript 1.4.0
(function() {

  Class('InfoNumber')({
    prototype: {
      init: function(element, initData, graphicCombination) {
        this.element = typeof element === 'string' ? $(element) : element;
        this.template = this.element.find('.number-template').html();
        this.element.find('.number-placeholder').html('').append(this.template);
        this.numberInput = this.element.find('#block_number');
        this.bindEvents();
        if (initData) {
          this.initData = initData;
          this.setEditionMode();
        }
        if (graphicCombination) {
          this.layout = 'number-graphic-top';
        } else {
          this.layout = 'number-top';
        }
        return this.element.show();
      },
      bindEvents: function() {},
      setEditionMode: function() {
        return this.numberInput.val(initData.number);
      },
      getData: function() {
        var result;
        return result = {
          number: this.numberInput.val(),
          layout: this.layout
        };
      }
    }
  });

}).call(this);
