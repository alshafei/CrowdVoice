Class('VoiceElement').inherits(Widget)({
    ELEMENT_CLASS  : '',
    HTML           : '\
        <div class="voice-box disabled">\
            <a href="" class="close-voice-box" data-method="delete" rel="nofollow" />\
            <div class="voice-cont">\
                <a class="source-url" href="">\
                    <img class="thumb-preview" />\
                </a>\
                <h3></h3>\
                <p class="description"></p>\
            </div>\
            <div class="voice-action">\
                <ul class="actions">\
                    <li>\
                        <a class="twitter cv-hover-twitter-brand-color" target="_blank">\
                            <i class="icon icon-twitter"></i>\
                        </a>\
                    </li>\
                    <li>\
                        <a class="facebook cv-hover-facebook-brand-color" target="_blank">\
                            <i class="icon icon-facebook"></i>\
                        </a>\
                    </li>\
                </ul>\
                <div class="flag-div has-cv-tooltip">\
                    <a href="" class="vote-post flag cv-hover-danger-brand-color" data-method="post" rel="nofollow">\
                        <i class="icon icon-flag"></i>\
                    </a>\
                    <div class="cv-tooltip cv-tooltip--top flag-tip" data-post-id="">\
                        <span class="cv-tooltip__arrow">\
                            <span class="cv-tooltip__arrow-item"></span>\
                        </span>\
                        <div class="media-type-info cv-tooltip-inner">\
                            <strong class="media-type-title"></strong>\
                            <p class="flag-tooltip">\
                                <span>Flag Inappropiate Content</span>\
                            </p>\
                        </div>\
                    </div>\
                </div>\
            </div>\
            <div class="voice-unmoderated">\
                <ul class="clearfix">\
                    <li class="up flag-div">\
                        <a class="vote-post thumb" rel="nofollow">\
                            <i class="allow-post icon icon-thumbs-up"></i>\
                            <span class="text">Allow</span>\
                        </a>\
                    </li>\
                    <li class="down flag-div">\
                        <a class="vote-post thumb" rel="nofollow">\
                            <i class="deny-post icon icon-thumbs-down"></i>\
                            <span class="text">Deny</span>\
                        </a>\
                    </li>\
                </ul>\
                <div style="clear:both"></div>\
            </div>\
        </div>\
    ',
    VOICE_TYPE_HTML : '\
        <div class="voice-content-type-wrapper">\
            <i class="post-icon-type"></i>\
            <b class="time-ago"></b>\
        </div>\
    ',
    PLAY_ICON : '<i class="icon icon-play"></i>',
    prototype     : {
        id            : 0,
        URL           : null,
        postURL       : null,
        approved      : false,
        description   : null,
        imageWidth    : 0,
        imageHeight   : 0,
        thumbURL      : null,
        coverURL      : null,
        negativeVotes : 0,
        positiveVotes : 0,
        overallScore  : 0,
        sourceService : null,
        sourceType    : null,
        sourceURL     : null,
        title         : null,
        voiceID       : 0,
        createdAt     : null,
        timeAgo       : null,
        service       : null,
        sourceElement : null,
        contentElement: null,
        disabled      : false,
        thumbElement  : null,
        tags          : [],
        flagElement   : null,

        init : function(config) {
            Widget.prototype.init.call(this, config);

            var voice = this;

            // Build thumbURL
            var protocol = window.location.protocol;
            var bucket = protocol + "//crowdvoice-production-bucket.s3.amazonaws.com/uploads/";

            var date    = new Date(this.createdAt);
            var model   = 'image';
            var version = 'thumb_';

            timestamp = date.getTime();

            timestampToUS = new Date(timestamp - (6 * 60 * 60 * 1000));

            var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

            var year    = timestampToUS.getUTCFullYear();
            var month   = months[timestampToUS.getUTCMonth()];
            var day     = (timestampToUS.getUTCDate() < 10 ? '0' : '') + timestampToUS.getUTCDate();


            if (this.image && typeof this.image == "string") {
                this.thumbURL = bucket + year + '/' + month + '/' + day + '/post/image/' + this.id + '/' + version + this.image;
                this.coverURL = bucket + year + '/' + month + '/' + day + '/post/image/' + this.id + '/' + this.image;
            } else {
                this.thumbURL = this.image ? this.image.thumb.url : '';
                this.coverURL = this.image ? this.image.url : '';
            }


            this.sourceElement = this.element.find('a.source-url');
            this.contentElement = this.element.find('.voice-cont');

            this.URL     = this.getURL();
            this.postURL = this.isRawImage() ? this.coverURL : this.sourceURL;

            this.flagElement = this.element.find('a.vote-post.flag.cv-hover-danger-brand-color');

            this.thumbElement = this.element.find('.thumb-preview');

            this.setupElements()._bindEvents();

            this.thumbElement.css({
                width  : voice.imageWidth,
                height : voice.imageHeight,
                background : "#EEE url('/images/image-placeholder.gif') no-repeat 50% 50%"
            });

            this.thumbElement.bind('load', function() {
                voice.thumbElement.addClass('set').css({background : 'none'});
                // CV.voicesContainer.delayedEvent.dispatch('isotope-relayout');
            });

            this.thumbElement.bind('error', function() {
                voice.thumbElement.addClass('na')[0].removeAttribute('src');
                voice.thumbElement.css({background : "#EEE url('/images/image-not-available.gif') no-repeat 50% 50%"});
            });

            if (!this.approved) {
                this.element.find('.vote-post.thumb').bind('click', function(ev) {
                    ev.preventDefault();

                    var b = $(ev.currentTarget),
                        p = b.parent();

                    if (p.hasClass('down_hover')) return;

                    $.post(this.href, function(data) {
                        p.siblings().hide();

                        if (p.hasClass('down')) {
                            p.addClass('down_hover');
                        } else {
                            p.addClass('up_hover');
                            voice.element.removeClass('unmoderated');
                            voice.element.find('.voice-unmoderated').remove();
                        }
                    });

                    return false;
                });
            }

        },

        setupElements : function() {
            var voice = this;

            this.element.addClass(this.sourceType);

            if (!this.approved) {
                this.element.addClass('unmoderated');

                this.element.find('.up.flag-div a').attr({
                    'href' : window.location.pathname + '/posts/' + voice.id + '/votes.json?rating=1'
                });

                this.element.find('.down.flag-div a').attr({
                    'href' : window.location.pathname + '/posts/' + voice.id + '/votes.json?rating=-1'
                });
            } else {
                this.element.find('.voice-unmoderated').hide();
            }

            this.element.attr({
                'data-post-id'    : this.id,
                'data-created-at' : this.createdAt
            });

            if (CV.isAdmin) {
                this.element.find('a.close-voice-box').bind('click', function() {
                    var element = $(this);

                    var c = confirm("Are you sure you want to delete this?");

                    if (c) {
                        $.ajax({
                            url : window.location.pathname + '/posts/' + voice.id,
                            type : 'delete',
                            data: $.extend({ authenticity_token : $('meta[name=csrf-token]').attr('content')}, {method : 'delete'}),
                            success : function(data) {

                                
                                CV.voicesContainer.element.isotope('remove', voice.element);
                                CV.voicesContainer.element.isotope('layout');
                                
                                voice.destroy();
                            }

                        });
                    }

                    return false;
                });
            } else {
                this.element.find('a.close-voice-box').hide();
            }

            this.sourceElement.attr({
                'data-type'      : voice.sourceType,
                'data-title'     : voice.title,
                'data-permalink' : voice.URL,
                'data-ago'       : voice.timeAgo,
                'data-id'        : voice.id,
                'data-voted'     : false,
                'data-service'   : voice.service,
                'href'           : voice.postURL
            });

            this.element.find('h3').html(this.title);

            if (this.sourceType == 'link') {
                this.sourceElement.after(this.constructor.VOICE_TYPE_HTML);
            } else {
                this.sourceElement.append(this.constructor.VOICE_TYPE_HTML);
            }

            var date = moment(this.timeAgo).format('MMM-DD-YYYY');

            this.element.find('.time-ago').html(date);

            if (this.sourceType == 'link' || this.sourceType == 'image') {
                this.element.find('p.description').html(this.description);
            } else {
                this.sourceElement.append(this.constructor.PLAY_ICON);
            }

            this.element.find('.post-icon-type').addClass('icon-' + this.sourceType);

            this.element.find('a.facebook').attr({
                'href' : 'http://facebook.com/sharer.php?u=' + voice.URL
            });

            this.element.find('a.twitter').attr({
                'href' : 'http://twitter.com/intent/tweet?text=' +  escape(voice.title) + '&url=' + escape(voice.URL) +'&via=crowdvoice'
            });

            this.flagElement.attr({
                href : window.location.pathname + '/posts/' + voice.id + '/votes.json?rating=-1'
            });

            return this;
        },

        _bindEvents : function _bindEvents() {
            var voice = this;

            this.contentElement.bind('click', function(event) {
                event.preventDefault();
                window.CV.OverlaysController.showOverlay(this);
            }.bind(this));

            this.flagElement.bind('click', function() {
                var self = $(this);

                $.ajax({
                    url: this.href,
                    data: $.extend({ authenticity_token : $('meta[name=csrf-token]').attr('content')}, $(this).data('params')),
                    type: $(this).data('method'),
                    dataType: 'json',
                    success: function (data) {
                        // that._handleSuccess(data, self);

                        post_id = voice.id;
                        // flag = $('div[data-post-id=' + post_id + ']');

                        //Logic for flags
                        if (voice.flagElement.hasClass('flag')){

                            voice.element.find('.flag-tooltip span').addClass('flagged').html('Unflag Content');
                            voice.flagElement.attr('data-voted', true);
                            voice.flagElement.toggleClass('flag flag-pressed').attr('href', [voice.flagElement.attr('href').split('?')[0], 'rating=1'].join('?') );

                        } else if (voice.flagElement.hasClass('flag-pressed')){

                            voice.element.find('.flag-tooltip span').removeClass('flagged').html('Flag Inappropiate Content');
                            voice.flagElement.attr('data-voted', false);
                            voice.flagElement.toggleClass('flag flag-pressed').attr('href', [voice.flagElement.attr('href').split('?')[0], 'rating=-1'].join('?') );
                        }
                    }
                });

                return false;
            })

            return this;
        },

        isRawImage : function() {
            var flickrRegExp  = /^https?:\/\/(?:www\.)?flickr\.com\/photos\/[-\w@]+\/\d+/i;
            var twitpicRegExp = /^https?:\/\/(?:www\.)?twitpic\.com\/[^\/]+$/i;
            var yfrogRegExp   = /^https?:\/\/(?:www\.)?yfrog\.com\/[^\/]+$/i;
            var isRawImage = false;

            if (this.sourceType === 'image') {
                if (this.sourceURL.search(flickrRegExp) == -1) {
                    isRawImage = true;
                }

                if (this.sourceURL.search(twitpicRegExp) == -1) {
                    isRawImage = true;
                }

                if (this.sourceURL.search(yfrogRegExp) == -1) {
                    isRawImage = true;
                }
            }

            return isRawImage;
        },

        getURL : function() {
            var params = $.deparam.querystring();
            var voice  = window.location.origin + window.location.pathname;
            var url = voice + '?post=' + this.id;

            if (params.tags) {
                url = url + '&tags=' + params.tags;
            }

            if (params.all) {
                url = url + '&all=' + params.all;
            }

            return url;
        },

        setImage : function() {
            var voice = this;
            if (!this.thumbElement.hasClass('na') || !this.thumbElement.hasClass('set')) {
                this.thumbElement.attr({
                    'src'   : voice.thumbURL,
                    'width' : voice.imageWidth,
                    'height' : voice.imageHeight
                });
            }
        },

        _activate : function() {
            Widget.prototype._activate.call(this);

            this.element.removeClass('disabled');
        },

        _deactivate : function() {
            Widget.prototype._deactivate.call(this);

            this.element.addClass('disabled');
        },

        /**
         * Returns an array of its siblings filtered by the passed sourceTypes.
         * @property getSiblingsBySourceType <public> [Function]
         * @argument sourceTypes <required> [Array]
         * @example voiceElementInstance.getSiblingsBySourceType(['link']);
         * @return this.parent.children | filter [Array]
         */
        getSiblingsBySourceType : function getSiblingsBySourceType(sourceTypes) {
            var childs, currentIndex;

            if (this.parent === 'undefined') {
                return [];
            }

            return this.parent.children.filter(function(child) {
                return sourceTypes.some(function(type) {
                    if (child.sourceType === type) {
                        return child;
                    }
                });
            });
        },

        /**
         * Returns its previous sibling with the same sourceType if found.
         * @property getPreviousSiblingBySourceType <public> [Function]
         * @argument sourceTypes <required> [Array]
         * @example voiceElementInstance.getPreviousSiblingBySourceType(['image', 'video']);
         * @return this.parent.children[ previous ] [VoiceElement | undefined]
         */
        getPreviousSiblingBySourceType : function getPreviousSiblingBySourceType(sourceTypes) {
            var childs, currentIndex;

            if (this.parent === 'undefined') {
                return;
            }

            childs = this.parent.children.filter(function(child) {
                return sourceTypes.some(function(type) {
                    if (child.sourceType === type) {
                        return child;
                    }
                });
            });

            currentIndex = childs.indexOf(this);

            if (currentIndex === 0) {
                return;
            }

            return childs[currentIndex - 1];
        },

        /**
         * Returns its next sibling with the same sourceType if found.
         * @property getNextSiblingBySourceType <public> [Function]
         * @argument sourceTypes <required> [Array]
         * @example voiceElementInstance.getNextSiblingBySourceType(['image']);
         * @return this.parent.children[ next ] [VoiceElement | undefined]
         */
        getNextSiblingBySourceType : function getNextSiblingBySourceType(sourceTypes) {
            var childs, currentIndex;

            if (this.parent === 'undefined') {
                return;
            }

            childs = this.parent.children.filter(function(child) {
                return sourceTypes.some(function(type) {
                    if (child.sourceType === type) {
                        return child;
                    }
                });
            });

            currentIndex = childs.indexOf(this);

            if (currentIndex === (childs.length - 1)) {
                return;
            }

            return childs[currentIndex + 1];
        }
    }
});
