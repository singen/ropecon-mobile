$('#main').live('pageshow', function(event) {
	$.mobile.showPageLoadingMsg()
});

$(document).bind('pageinit', function() {
	app.updateAndMove()

	$('#refresh-button').bind('tap', function() {
		$.mobile.showPageLoadingMsg()
		app.updateAndMove()
	})

	$('#now-button').bind('tap', function() {
		app.moveNow()
		if (app.anchorAdded) {
			app.iPhoneFixedScrollTo("#now")
		}
		return false
	})

	$('#search-button').bind('tap', function() {
		app.iPhoneFixedScrollTo("#main")
		return false
	})

	$('#pe-button').bind('tap', function() {
		app.iPhoneFixedScrollTo("#pe")
		return false
	})

	$('#la-button').bind('tap', function() {
		app.iPhoneFixedScrollTo("#la")
		return false
	})

	$('#su-button').bind('tap', function() {
		app.iPhoneFixedScrollTo("#su")
		return false
	})
})



var app = function($) {
		var pub = {}

		var fridaycutoff = moment("2012-07-28T04:00")
		var saturdaycutoff = moment("2012-07-29T04:00")
		var anchorAdded = false
		var nowbar = '<li class="ui-li ui-li-divider ui-bar-e" id="now">Tuleva ohjelma</li>'
		var initialcontent = '<li data-role="list-divider" id="pe">Perjantai</li>' + 
		'<li data-role="list-divider" id="la">Lauantai</li>' + 
		'<li data-role="list-divider" id="su">Sunnuntai</li>' + 
		'<li data-role="list-divider" id="end">Ropecon päättyy</li>'

		pub.anchorAdded = function() {
			return anchorAdded
		}

		pub.updateAndMove = function() {
			updateProgramme().done(function() {
				$.mobile.hidePageLoadingMsg()
				$('#programme').listview('refresh')
				if (anchorAdded) {
					iPhoneFixedScrollTo("#now")
				}
			})
		}

		pub.iPhoneFixedScrollTo = function(item) {
			$('#device').css('height', '200px')
			$('html, body').animate({
				scrollTop: $(item).offset().top - 40
			}, 1000, function() {
				setTimeout(function() {
					$('#device').css('height', '0px')
				}, 0)
			})
		}

		function updateProgramme() {
			var now = moment()
			anchorAdded = false
			$('#programme').html(initialcontent)
			return $.ajax({
				url: '20.xml',
				datatype: 'xml',
				success: function(data) {
					var items = $(data).find("item")
					$(items).each(function() {
						var date = moment($(this).attr("startday") + "T" + $(this).attr("starttime"))
						if (date < fridaycutoff) {
							addItem($('#la'), date, this, now)
						} else if (date < saturdaycutoff) {
							addItem($('#su'), date, this, now)
						} else if (date > saturdaycutoff) {
							addItem($('#end'), date, this, now)
						}
					})
				}
			})
		}

		function addItem(list, date, item, now) {
				var enddate = moment($(item).attr("endday") + "T" + $(item).attr("endtime"))
				if (date > now && anchorAdded === false) {
					list.before(nowbar)
					anchorAdded = true
				}
				var time
				if (enddate.diff(date, 'days', true) > 1) {
					time = date.format("D.M. HH:mm") + "-" + enddate.format("D.M. HH:mm")
				} else {
					time = date.format("HH:mm") + "-" + enddate.format("HH:mm") + " Kesto: " + enddate.diff(date, 'minutes') + " min"
				}
				var type = ''
				$(item).find('type').each(function() {
					type += $(this).text() + ' '
				})
				var organizers = $(item).find('organizer')
				var people = ''
				organizers.each(function(index) {
					if (index + 1 < organizers.size()) {
						people += $(this).text() + ', '
					} else {
						people += $(this).text() + ' '
					}
				})
				var additionalname = $(item).attr('itemname')
				var name = ''
				if(additionalname != "") {
					name = $(item).attr("name") + ": " + additionalname
				} else {
					name = $(item).attr("name")
				}
				var loc = $(item).attr("location")
				var filtertext = type + people + ' ' + name + ' ' + loc
				list.before('<li data-filtertext="' + filtertext + '" data-time="' + date.unix() + '">' +
				'<p class="ui-li-desc"><strong>Aika: ' + time + '</strong></p>' + 
				'<h3 class="ui-li-heading">' + name + '</h3>' + 
				'<p class="ui-li-desc"><strong>Paikka: ' + loc + ' Kategoria: ' + type + '</strong></p>' + 
				'<p class="item-desc-with-wrap">' + $(item).attr("description") + '<br>Järjestäjä: ' + people + '</p>' + '</li>')
			}


		pub.moveNow = function() {
			anchorAdded = false
			now = moment()
			$('#nowlink').remove()
			$('#now').remove()
			$('#programme > li').each(function() {
				var start = $(this).attr('data-time')
				if (start > now.unix()) {
					$(this).before(nowbar)
					anchorAdded = true
					return false
				}
			})
			$('#programme').listview('refresh')
		}
		return pub
	}(jQuery)
