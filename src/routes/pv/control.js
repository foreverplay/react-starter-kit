function copyControlBind() {
    console.log('123')
    return
    var tempoffsettopu = 15;
    var tempheightbottomu = 15
    $('.lyrics-imgs-group').on('touchstart', '#tooltop', function(event) {
        tempoffsettopu = $('.imgcontrol').offset().top
    })
    $('.lyrics-imgs-group').on('touchend', '#tooltop', function(event) {
        tempoffsettopu = $(this).offset().top
        if (tempheightbottomu) {
            var index = checkChosen(tempheightbottomu)
            tempheightbottomu = $('#dashed-pv' + index).offset().top - $('.imgcontrol').offset().top - 30
            $('#tooltop').css({
                'display': 'block',
                'top': tempheightbottomu + 'px',
            })
            topUpdateImg(index)
        }
    })
    $('.lyrics-imgs-group').on('touchmove', '#tooltop', function(event) {
        event.preventDefault()
        var canmove = true
        tempheightbottomu = event.touches[0].pageY - tempoffsettopu - 35;
        if (tempheightbottomu <= 15) {
            tempheightbottomu = 15
            canmove = false
        }
        var tmpbtmtop = $('#toolbottom').offset().top - $('.imgcontrol').offset().top
        if (tmpbtmtop - tempheightbottomu < 50) {
            tempheightbottomu = tmpbtmtop - 50
            canmove = false
        }
        pageScroll(event.touches[0].clientY, canmove)
        $('#tooltop').css({
            'display': 'block',
            'top': tempheightbottomu + 'px',
        })
    })
    $('.lyrics-imgs-group').on('mousedown', '#tooltop', function(event) {
        mousemoveing = true
        tempoffsettopu = $('.imgcontrol').offset().top
    })
    $('.lyrics-imgs-group').on('mouseup', '#tooltop', function(event) {
        mousemoveing = false
        tempoffsettopu = $(this).offset().top
        if (tempheightbottomu) {
            var index = checkChosen(tempheightbottomu)
            tempheightbottomu = $('#dashed-pv' + index).offset().top - $('.imgcontrol').offset().top - 30
            $('#tooltop').css({
                'display': 'block',
                'top': tempheightbottomu + 'px',
            })
            topUpdateImg(index)
        }
    })
    $('.lyrics-imgs-group').on('mousemove', '#tooltop', function(event) {
        if (!mousemoveing) {
            return
        }
        event.preventDefault()
        var canmove = true
        tempheightbottomu = event.pageY - tempoffsettopu - 35;
        if (tempheightbottomu <= 15) {
            tempheightbottomu = 15
            canmove = false
        }
        var tmpbtmtop = $('#toolbottom').offset().top - $('.imgcontrol').offset().top
        if (tmpbtmtop - tempheightbottomu < 50) {
            tempheightbottomu = tmpbtmtop - 50
            canmove = false
        }
        pageScroll(event.clientY, canmove)
        $('#tooltop').css({
            'display': 'block',
            'top': tempheightbottomu + 'px',
        })
    })
    var tempoffsettop = 65;
    var tempheightbottom = 65
    var alllyricsH = $('.change-lyrics-all-content-group').height()
    $('.lyrics-imgs-group').on('touchstart', '#toolbottom', function(event) {
        tempoffsettop = $('.imgcontrol').offset().top
    })
    $('.lyrics-imgs-group').on('touchend', '#toolbottom', function(event) {
        tempoffsettop = $(this).offset().top
        if (tempheightbottom) {
            var index = checkChosen(tempheightbottom)
            tempheightbottom = $('#dashed-pv' + index).offset().top - $('.imgcontrol').offset().top + 10
            $('#toolbottom').css({
                'display': 'block',
                'top': tempheightbottom + 'px',
            })
            btmUpdateImg(index)
        }
    })
    $('.lyrics-imgs-group').on('touchmove', '#toolbottom', function(event) {
        event.preventDefault()
        var canmove = true
        tempheightbottom = event.touches[0].pageY - tempoffsettop - 35;
        // 最大边界
        var maxtop = alllyricsH - 65;
        if (tempheightbottom > maxtop) {
            tempheightbottom = maxtop
            canmove = false
        }
        // 最小边界
        if (tempheightbottom <= 95) {
            tempheightbottom = 95
            canmove = false
        }
        // 相对边界边界
        var tmptoptop = $('#tooltop').offset().top - $('.imgcontrol').offset().top
        if (tempheightbottom - tmptoptop < 50) {
            tempheightbottom = tmptoptop + 50
            canmove = false
        }
        pageScroll(event.touches[0].clientY, canmove)
        $('#toolbottom').css({
            'display': 'block',
            'top': tempheightbottom + 'px',
        })
        return
    })
    var mousemoveing = false;
    $('.lyrics-imgs-group').on('mousedown', '#toolbottom', function(event) {
        mousemoveing = true
        tempoffsettop = $('.imgcontrol').offset().top
    })
    $('.lyrics-imgs-group').on('mouseup', '#toolbottom', function(event) {
        mousemoveing = false
        tempoffsettop = $(this).offset().top
        if (tempheightbottom) {
            var index = checkChosen(tempheightbottom)
            tempheightbottom = $('#dashed-pv' + index).offset().top - $('.imgcontrol').offset().top + 10
            $('#toolbottom').css({
                'display': 'block',
                'top': tempheightbottom + 'px',
            })
            btmUpdateImg(index)
        }
    })
    $('.lyrics-imgs-group').on('mousemove', '#toolbottom', function(event) {
        if (!mousemoveing) {
            return
        }
        var canmove = true
        event.preventDefault()
        tempheightbottom = event.pageY - tempoffsettop - 35;
        // 最大边界
        var maxtop = alllyricsH - 65;
        if (tempheightbottom > maxtop) {
            tempheightbottom = maxtop
            canmove = false
        }
        if (tempheightbottom <= 65) {
            tempheightbottom = 65
            canmove = false
        }
        var tmptoptop = $('#tooltop').offset().top - $('.imgcontrol').offset().top
        if (tempheightbottom - tmptoptop < 50) {
            tempheightbottom = tmptoptop + 50
            canmove = false
        }
        pageScroll(event.clientY, canmove)
        $('#toolbottom').css({
            'display': 'block',
            'top': tempheightbottom + 'px',
        })
        return
    })
}
export {copyControlBind};