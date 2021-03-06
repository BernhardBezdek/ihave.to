/*global $*/
/*global CONF*/
/*global Screens*/
/*global Template*/
/*global showMessage*/

(function () {
    "use strict";
    $(document).on(CONF.EVENTS.FORCED_CLICK, '#ui > .cmd > .screen',function () {
        if (!$(this).hasClass('removable')) {
            if (!$(this).is('.curent')) {

                var sScreenName = $(this).find('.screen-name').text();

                if (CONF.BOARD.PRIVATE.SCREENS[sScreenName] !== undefined) {

                    CONF.DOM.BOARD.find('.screen').empty();

                    CONF.DOM.BOARD.trigger('loadPosts', {
                        NAME: sScreenName,
                        SCREEN: CONF.BOARD.PRIVATE.SCREENS[sScreenName],
                        FROMTIME: false
                    });
                }

                CONF.DOM.CMD.find('#back').trigger(CONF.EVENTS.CLICK);

            } else {
                CONF.DOM.CMD.find('#back').trigger(CONF.EVENTS.CLICK);
            }
        } else {
            if (!$(this).hasClass('do')) {
                $(this).addClass('do');
            }
            else if ($(this).hasClass('do')) {
                $(this).removeClass('do');
            }
            if ($('.screen.removable.do').length > 0) {
                $('#trash_empty').attr('id', 'trash_empty'.replace('empty', 'full'));
                $('.counter').remove();
                $('#trash_full').parent().prepend(new Template({
                    SPAN: {
                        CLASSES: 'counter',
                        CONTENT: $('.do').length
                    }
                }).toHtml());
            } else {
                $('#trash_full').attr('id', 'trash_full'.replace('full', 'empty'));
                $('.counter').remove();
            }
        }

    }).on(CONF.EVENTS.CLICK, '#create-screen',function () {
            var oScreenName = $('#screen-name');
            var oDiff = JSON.parse('{"PRIVATE":{"SCREENS":{"' + oScreenName.val() + '":{}}}}');

            if (oScreenName.val() !== 'NEW_SCREEN_NAME'.translate() && oScreenName.val().trim().length > 0) {
                if (CONF.BOARD.PRIVATE.SCREENS[oScreenName.val().trim()] !== undefined) {
                    showMessage(oScreenName.val().trim() + ' ' + 'SCREEN_ALREADY_EXISTS'.translate(), 'error');
                } else {
                    if (CONF.BOARD.PRIVATE.SCREENS[oScreenName.val()] === undefined) {
                        var sScreenBgUrl = $('#screen-bg-url').val();
                        var sBackground = (sScreenBgUrl.isImageURL()) ? sScreenBgUrl : CONF.PROPS.STRING.SCREEN_DEFAULT_BG;
                        var oChange = {
                            BY: CONF.PROPS.INT.WHO,
                            META: {
                                BG: sBackground
                            },
                            POSTS: {}
                        };

                        oDiff.PRIVATE.SCREENS[oScreenName.val()] = oChange;
                        CONF.BOARD.PRIVATE.SCREENS[oScreenName.val()] = oChange;
                    }

                    // Need to remvove. Otherwise triggered cancel action will remove the image
                    $('input#screen-bg-url').remove();
                    $('#abort-create-screen').trigger('click');

                    CONF.DOM.UIWINDOW.children('.cmd').html(new Template(new Screens().getOverview()).toHtml());
                    CONF.COM.SOCKET.saveChanges(oDiff);

                    showMessage('SCREEN_WAS_CREATED'.translate(), 'notice');
                }
            } else {
                showMessage('INVALID_SCREEN_NAME'.translate(), 'error');
            }
        }).on('click', '#abort-create-screen', function () {

            if ($('input#screen-bg-url').length === 1) {
                var sUploadedBgVal = $('#screen-bg-url').val().trim().split('/').pop();

                if (sUploadedBgVal.length > 0) {
                    $.post('/unlink-wp', {image: sUploadedBgVal});
                }
            }
            $('#new_screen-ui').fadeOut(CONF.PROPS.INT.MASTERCLOCK / 4, function () {
                $(this).remove();
                $('#new_screen').removeClass('active');
            });
        });
})();