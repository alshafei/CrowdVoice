// Generated by CoffeeScript 1.3.3

Class('InfoSidebar')({
  prototype: {
	init: function(element, data) {
		var infoboxData, _i, _len, _ref;
		this.element			= typeof element === 'string' ? $(element) : element;
		this.element.data('neon', this);
		this.tabController		= this.element.find('.info-tab-controller');
		this.voiceHeadline		= $('.main-header');
		this.voicesScroller		= $('.voices-scroller');
		this.announcementBar    = $('.flash-message');
		this.preloadMask		= this.element.find('.preload-mask');
		this.scrollMask			= this.element.find('.scroll-mask');
		this.userWindow			= $(window);
		this.currentImages		= 0;
		this.currentCharts		= 0;
		if (data !== null) {
			this.infoboxesData = data;
			_ref = this.infoboxesData;
			for (_i = 0, _len = _ref.length; _i < _len; _i++) {
					infoboxData = _ref[_i];
					this.addInfobox(infoboxData);
			}
		}
		this.totalImages		= this.scrollMask.find('.infobox').find('.graphic img').length;
		this.totalCharts		= this.scrollMask.find('.infobox').find('.graphic.high-chart').length;
		this.expandedWidth		= this.element.width();
		this.shown				= true;
		this.needsRecalc		= window.innerWidth <= 768 ? true : false;
		this.animationTime		= 300;
		this.collapsedWidth		= 0;
		this.expandCollapseAnimationTime = 300;

		this.scrollMask.jScrollPane({autoReinitialise: false});
		this.scrollMask.height(this.setSize());
		this.preloadMask.show();
		// check if it should be hidden when initialized due screen size
		this.responsiveHide();
		this.bindEvents();
	},
	addInfobox: function(infoboxData) {
		var infobox = new InfoBox(infoboxData, '.infobox-sidebar-template', true).render();
		return this.scrollMask.append(infobox.addClass('collapsed'));
	},
	reportLoad: function(type) {
		switch (type) {
			case 'image':
				this.currentImages++;
			break;
			case 'chart':
				this.currentCharts++;
			break;
		}
		if (this.currentImages === this.totalImages && this.currentCharts === this.totalCharts) {
			return this.infoboxMeasures();
		}
	},
	bindEvents: function() {
		var that = this;
		// report image loading states
		this.scrollMask.find('.infobox').find('.graphic img').each(function(i, el) {
			el = $(el);
			el.load(function() {
				that.reportLoad('image');
			}).error(function() {
				that.reportLoad('image');
			}).attr('src', el.attr('src'));
		});
		// sidebar toggle
		this.tabController.click(function() {
			return that.toggle();
		// triggered outside
		}).bind('infoSidebar.hide', function() {
			if (that.shown) {
				return that.hide();
			}
		});
		// refresh scroll calculations upon resize
		this.userWindow.smartresize(function() {
			that.scrollMask.height(that.setSize());
			return that.scrollMask.data('jsp').reinitialise();
		}).resize(function(){
			that.responsiveHide();
		});

		this.scrollMask.delegate('.infobox.active .infobox-extract, .infobox.active .infobox-extract .highcharts-container, .infobox.collapsed', 'click', function(ev) {
			if (ev.target.tagName !== 'a' && ev.target.tagName !== 'A') {
				// var infoboxTarget = $(ev.target).closest('.infobox').removeClass('active');
				var infoboxTarget = $(ev.target).closest('.infobox');
				return that.resetAndExpand(infoboxTarget);
			} else {
				return;
			}
		});
	},
	responsiveHide: function(){
		var windowWidth = window.innerWidth;
		if (windowWidth <= 1024 && this.shown) {
			this.needsRecalc = true;
			this.hide();
		}
	},
	setSize: function() {
		return this.element.height();
	},
	toggle: function() {
		return this.shown ? this.hide() : this.show();
	},
	hide: function() {
		var that = this,
			scrollerWidth = this.voicesScroller.width(),
			newScrollerWidth = scrollerWidth + this.expandedWidth;

		this.element.addClass('closed');

		this.voicesScroller.animate({
			left: 0
		}, this.animationTime, function() {
			that.userWindow.trigger('smartresize');
		});
		this.announcementBar.removeClass('with-infosidebar');
		this.tabController.addClass('close-control');
		this.shown = false;
	},
	show: function() {
		var that				= this,
			scrollerWidth		= this.voicesScroller.width(),
			newScrollerWidth	= scrollerWidth - this.expandedWidth;

		if ( this.needsRecalc ) {
			this.infoboxMeasures();
			this.needsRecalc = false;
		}
		this.tabController.removeClass('close-control');

		this.element.removeClass('closed');

		this.voicesScroller.animate({
			left: this.expandedWidth
		}, this.animationTime, function() {
			that.userWindow.trigger('smartresize');
		});

		this.announcementBar.addClass('with-infosidebar');
		this.shown = true;
	},
	infoboxMeasures: function() {
		var collapsedState			= this.scrollMask.find('.infobox.collapsed'),
			collapsedBoxes			= collapsedState.find('.infobox-extract'),
			expandedBoxes			= collapsedState.find('.infobox-complete'),
			expandedBoxesChildren	= expandedBoxes.children(),
			urlVars					= this.getUrlVars();
		// this.preloadMask.show();
		collapsedBoxes.each(function() {
			var boxHeight = parseInt($(this).outerHeight(true), 10) + 10;
			return $(this).parent('.infobox').attr('data-collapsed-height', boxHeight);
		});

		collapsedState.removeClass('collapsed').addClass('expanded');

		expandedBoxes.each(function() {
			var boxHeight = parseInt($(this).outerHeight(true), 10);
			return $(this).parent('.infobox').attr('data-expanded-height', boxHeight);
		});

		collapsedState.removeClass('expanded').addClass('collapsed');

		if (urlVars.infoboxId !== null) {
			return this.resetAndExpand($('.infobox[id="' + urlVars.infoboxId + '"]'));
		} else {
			return this.resetAndExpand();
		}
	},
	toggleInfobox: function(infoboxPosition) {
		var currentInfobox = $('.infobox[position="' + infoboxPosition + '"]');
		this.expandInfobox(currentInfobox);
	},
	resetAndExpand: function(infobox) {
		var callback,
			_this = this;

		callback = _.debounce(function() {
			if (infobox !== null) {
				_this.scrollMask.find('.infobox').removeClass('active');

				infobox.find('.infobox-extract').animate({
					opacity: 0
				}, _this.expandCollapseAnimationTime, function() {
					infobox.animate({
						height: infobox.attr('data-expanded-height')
					}, _this.expandCollapseAnimationTime, function() {
						infobox.removeClass('collapsed').addClass('expanded');
						_this.scrollMask.data('jsp').reinitialise();
						infobox.find('.infobox-complete').animate({
							opacity: 1
						}, _this.expandCollapseAnimationTime, function() {
							_this.scrollMask.find('.infobox').addClass('active');
							_this.scrollView(infobox);
							return _this.preloadMask.hide();
						});
					});
				});
			} else {
				_this.scrollMask.data('jsp').reinitialise();
				return _this.preloadMask.hide();
			}
		}, 100);

		this.scrollMask.find('.infobox').each(function(i, el) {
			el = $(el);
			el.find('.infobox-complete').animate({
				opacity: 0
			}, _this.expandCollapseAnimationTime, function() {
				el.animate({
					height: el.attr('data-collapsed-height')
				}, _this.expandCollapseAnimationTime, function() {
					el.removeClass('expanded').addClass('collapsed');
					el.find('.infobox-extract').animate({
						opacity: 1
					}, _this.expandCollapseAnimationTime, function() {
						_this.scrollMask.find('.infobox').addClass('active');
						_this.preloadMask.hide();
						return callback();
					});
				});
			});
		});
	},
	scrollView: function(element){
		var _this = this;
		if (element.attr('position') != '0') {
			_this.scrollMask.data('jsp').scrollToElement(element);
		}
	},
	getUrlVars: function(){
		var vars = [],
			hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&'),
			hash;
		for(var i = 0; i < hashes.length; i++){
			hash = hashes[i].split('=');
			vars.push(hash[0]);
			vars[hash[0]] = hash[1];
		}
		return vars;
	}
  }
});
