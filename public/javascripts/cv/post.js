/*
    Tooltip
    Filters
    Carousel
    Votes
    Overlay
*/
Class('Post')({
    detectUrl: function(url) {
        switch(true) {
            case this.isVideo(url):
                return 'video';
                break;
            case this.isImage(url):
                return 'image';
                break;
            case this.isLink(url):
                return 'link';
                break;
            default:
                return false;
                break;
        }
    },

    isVideo: function (url) {
        var regex = /^https?:\/\/(?:www\.)?(youtube\.com\/watch\?.*v=[^&]|vimeo\.com\/(?:.*#)?(\d+))/i;
        return regex.test(url);
    },

    isImage: function (url) {
        var regex = /^https?:\/\/(?:www\.)?(flickr\.com\/photos\/[-\w@]+\/\d+|twitpic\.com\/[^\/]+$|yfrog\.com\/[^\/]+$|.*\/.*\.(jpe?g|png|gif)(?:\?.*)?$)/i;
        return regex.test(url);
    },

    isLink: function (url) {
        var regex = /^https?:\/\/([\w-]+\.([\w-]+)){1,}([\/?#].*)?$/i;
        return regex.test(url);
    },

    prototype: {
        init: function (element, options) {
            this.options = {
                postPlaceHolder: '.post-paceholder',
                tooltipImage    : null,
                tooltipVideo    : null,
                tooltipLink     : null,
                carousel        : null,
                postFilter      : null,
                votes           : null,
                overlays        : null
            };
            $.extend(this.options, options);

            this.element = typeof element == "string" ? $(element) : element;
            this.postPlaceHolder = $(this.options.postPlaceHolder);
            this.inputPost = $(this.element.children('input'));
            this.inputFile = $(this.element.children('.post-paceholder').children('input'));
            this.form = this.element.parent();
            this.lastSearch = '';
            this._setInput();
            this._bindEvents();
        },

        _showTooltip: function(type) {
            $('.post-type .tooltip').hide();
            $('.tooltip.notice').hide();
            $('.media > a').removeClass('active')
            $('#post_remote_image_url').val('');
            this.options.carousel.clear();

            switch(type) {
                case 'video':
                    this.options.tooltipVideo.show();
                    break;
                case 'image':
                    $('#image_description').val('');
                    $('#image_title').val('');
                    $('#post_copyright').val('');

                    this.options.tooltipImage.show();
                    break;
                case 'link':
                    $('.carousel-image').find("img:not('.carousel-loader')").hide();
                    $('.carousel-loader').show();
                    this.options.carousel.show();
                    this._call_for_page_info();
                    this.options.tooltipLink.show();
                    break;
            }
        },

        _bindEvents: function () {
            var that    = this,
                input   = this.inputPost,
                placeHolder     = this.postPlaceHolder,
                tooltipImage    = this.options.tooltipImage,
                tooltipLink     = this.options.tooltipLink,
                inputFile       = this.inputFile,
                carousel        = this.options.carousel,
                postFilter      = this.options.postFilter,
                overlays        = this.options.overlays,
                votes           = this.options.votes;

            placeHolder.children('span').click(function () {
                placeHolder.hide();
                input.focus();
            });

            input.blur(function () {
                if (input.val() === "") {
                    placeHolder.show();
                    $('.video-tool').removeClass('active');
                    tooltipImage._hide_extra_data();
                    tooltipLink._hide_extra_data();
                } else {
                    placeHolder.hide();
                }
            });

            input.focus(function () {
                placeHolder.hide();
            });

            inputFile.change(function () {
                var fileValue = $(this).val();
                if(fileValue) {
                    placeHolder.hide();
                    fileValue = fileValue.split("\\");
                    fileValue = fileValue[fileValue.length - 1];
                    input.val(fileValue);
                    that._showTooltip('image');
                }
            });

            input.keyup(function (e) {
                if ((e.which <= 90 && e.which >= 48 && e.which != 86) || e.which == 8){
                    that._showTooltip(that.constructor.detectUrl($(this).val()));
                }
            });

            input.bind('paste',function () {
                setTimeout(function(){
                    that._showTooltip(that.constructor.detectUrl(input.val()));
                }, 250);
            });

            this.form.submit(function () {
                if(input.val() && (that.constructor.detectUrl(input.val()) || inputFile.val())) {
                    if (this.lastSearch != input.val()){

                        $(this).ajaxSubmit({
                            dataType: 'json',
                            type: 'post',
                            success: function (data) {
                                if(data.post) {
                                    this.lastSearch = input.val();
                                    that.inputFile.val('');
                                    input.val('').blur();
                                    $.get('/' + window.currentVoice.slug + '/posts/' + data.post.id, function(html) {
                                        var post    = $(html);
                                        $('.post-type .tooltip').hide();
                                        $('.media > a').removeClass('active')
                                        postFilter.toggleModerator(true);
                                        carousel.clear();

                                        $('.voices-container').prepend(post);
                                        post.find('img.thumb-preview').bind('load',function(){
                                            //if thumbnail bug, hide it
                                            if ($(this).attr('src').indexOf('thumb_link-default.png') > 0){
                                                $(this).hide();
                                            }
                                            overlays.unbindEvents().bindEvents();
                                            votes.unbindEvents().bindEvents();
                                            $('.voices-container')
                                                .isotope('addItems', post)
                                                .isotope('reloadItems')
                                                .isotope({ sortBy: 'original-order' })
                                                .isotope();
                                        });

                                    });
                                    // TODO: show tooltip confirmation
                                } else { //error -- doesn't work with $.ajax error callback
                                    for(var error in data){
                                        $('.post-type .tooltip').hide();
                                        $('.media > a').removeClass('active');

                                        if (data.hasOwnProperty(error) && error == 'source_url'){
                                            $('.tooltip.notice .moderate-tooltip').html('Url '+data[error]);
                                            $('.tooltip.notice').show();
                                        }
                                    }
                                }
                            }
                        });
                    }
                }
                return false;
            });
        },

        _setInput: function () {
            var input = this.inputPost,
                placeHolder = this.postPlaceHolder;
            if (input.val() === "") { placeHolder.show(); }
            else { placeHolder.hide(); }
        },

        _call_for_page_info: function(){
            var carousel = this.options.carousel;
          $.ajax({
              url: "/remote_page_info",
              type: 'POST',
              data: "url=" + encodeURIComponent(this.inputPost[0].value),
              error: function() {
                  // TODO: What to do when fail
                  // console.log('ERROR getting info')
              },
              success: function(data, status, xhr) {
                  carousel.loadHash(data);
                  $('.carousel-image').find("img:not('.carousel-loader')").show();
                  $('.carousel-loader').hide();

                  // wait a bit before doing another ajax call
                  setTimeout(function() { ajaxBusy = false; }, 2000);
              },
              dataType: "json"
          });
        }
    }
});
