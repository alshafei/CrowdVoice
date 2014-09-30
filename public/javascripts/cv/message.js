Class('Message')({
    prototype : {
        init : function (element, options) {
            this.options = {
                closeBtn : '.close-message',
                effect   : true
            };
            $.extend(this.options, options);
            this.element        = typeof element == "string" ? $(element) : element;
            this.closeBtn       = $(this.options.closeBtn);
            this.mainHeader     = $('.main-header');
            this.voiceSubtitle  = $('.voice-subtitle');
            this.userWindow     = $(window);
            this._bindEvents();
        },

        _bindEvents: function () {
            var closeBtn = this.element.children().children(this.options.closeBtn),
                that = this;
            closeBtn.click(function () {
                that.hide();
                return false;
            });
            this.userWindow.bind('resize smartresize', function(){
                that.setTopPosition();
            });
            this.voiceSubtitle.bind('excerpt.toggle', function(){
                that.setTopPosition();
            });
        },

        hide: function () {
            var that = this;
            (this.options.effect ? this.element.fadeOut(function () {
                that.element.trigger('flash.close')
            }) : this.element.hide() && this.element.trigger('flash.close'));
            $('.with-announcement').removeClass('with-announcement');
        },

        setTopPosition: function(){
            var newTopPosition = this.mainHeader.height();
            this.element.css('top', newTopPosition);
        }
    }
});
