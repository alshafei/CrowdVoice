Class('MediaFeedSearch').inherits(Widget)({
    prototype     : {
        image       : true,
        video       : true,
        link        : true,
        types       : ['image', 'video', 'link'],
        delayedEvent : null,
        init : function(config) {
            Widget.prototype.init.call(this, config);

            var mediaFeedSearch = this;

            mediaFeedSearch.element.find('.results-feedback').hide();
            mediaFeedSearch.element.find('.search-clear').hide();

            var checkboxes = ['image', 'video', 'link'];

            checkboxes.forEach(function(checkbox) {
                mediaFeedSearch.element.find('input.' + checkbox).bind('click', function() {
                    if (this.checked) {
                        mediaFeedSearch[checkbox] = true;
                    } else {
                        mediaFeedSearch[checkbox] = false;
                    }

                    mediaFeedSearch.types = [];

                    _.each(checkboxes, function(cb) {
                        if (mediaFeedSearch[cb] === true) {
                            mediaFeedSearch.types.push(cb);
                        }
                    });

                    mediaFeedSearch.search();

                    CV.voicesContainer.delayedEvent.dispatch('isotope-relayout');
                });
            });

            this.delayedEvent = new DelayedEventEmitter({waitingTime : 300});

            this.element.find('input.search').bind('keydown', function(e) {
                if (e.keyCode == 13) {
                    e.preventDefault();     
                };

                mediaFeedSearch.delayedEvent.dispatch('search');
            });

            this.delayedEvent.bind('search', function() {

                mediaFeedSearch.search();
            });

            this.element.find('.search-clear').bind('click', function() {
                mediaFeedSearch.reset();
            });
        },

        reset : function() {
            this.element.find('input.search').val('');

            this.element.find('.found').html(0);

            this.search();
        },

        search : function () {
            var mediaFeedSearch = this;
            
            var voices = CV.voicesContainer.children;

            var elements = [];

            var removedElements = [];
            
            var result = [];
            
            var query = this.element.find('input.search').val();

            _.each(voices, function(voice) {
                removedElements.push(voice.element[0]);
                voice.deactivate();
            });

            CV.voicesContainer.element.isotope('remove', removedElements);

            _.each(voices, function(voice) {
                if (mediaFeedSearch.types.indexOf(voice.sourceType) !== -1) {
                    query                   = query.toLowerCase();
                    
                    var voiceTitle          = voice.title.toLowerCase();
                    var voiceDescription    = voice.description.toLowerCase();
                    
                    if (query !== '') {
                        if (voiceTitle.search(query) !== -1 || voiceDescription.search(query) !== -1) {
                            result.push(voice);
                        }    
                    } else {
                        result.push(voice);
                    }
                } else {
                    voice.deactivate();
                }
            });

            CV.voicesContainer.filteredResults = result;

            var foundCount = result.length;

            if (result.length === voices.length) {
                foundCount = 0;
            }

            mediaFeedSearch.element.find('.found').html(foundCount);

            if (query === '') {
                mediaFeedSearch.element.find('.results-feedback').hide();
                mediaFeedSearch.element.find('.search-clear').hide();
            } else {
                mediaFeedSearch.element.find('.results-feedback').show();
                mediaFeedSearch.element.find('.search-clear').show();
            }
            
            CV.voicesContainer.currentPage = 1;

            result = result.slice(0, 59);

            _.each(result, function(voice) {
                elements.push(voice.element[0])
                voice.activate();

                _.defer(function() {
                    if (voice.element.visible(true)) {
                        voice.setImage();
                    };
                });
            });

            CV.voicesContainer.element.isotope('appended', elements);

            CV.voicesContainer.element.isotope('layout');
        }
    }
});
