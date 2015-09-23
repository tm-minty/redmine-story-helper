// ==UserScript==
// @name StoryHelper
// @description Помошник в разгребании стори в редмайне
// @author Timur Mingaliev
// @license MIT
// @version 0.1.14
// @include http://redmine.*
// @include https://redmine.*
// @grant GM_addStyle
// @grant GM_getValue
// @grant GM_setValue
// ==/UserScript==

(function (window, undefined) {
    var w;
    if (typeof unsafeWindow != undefined) {
        w = unsafeWindow
    } else {
        w = window;
    }

    if (w.self != w.top) {
        return;
    }

    if (/http(s)?:\/\/redmine\./.test(w.location.href)) {
        var stories = document.querySelectorAll('.model.story'),
            storage = getLocalStorage(),
            colors = ['#FFF', '#F00', '#0F0'],
            styles = [
                '.redmine-helper-info { position: fixed; bottom: 0; right: 0; background: rgba(255,255,255,.7); color: black; padding: 15px; }'
            ];

        Array.prototype.forEach.call(stories, function (story) {
            story.addEventListener('contextmenu', storyRightClick, false);

            if (getData(story.id).hidden) {
                hide(story);
            }
        });

        var styleNode = document.createElement('style'),
            styleSheet;

        styleNode.type = "text/css";
        document.head.appendChild(styleNode);

        styleSheet = styleNode.sheet;
        styles.forEach(function (style) {
            if (typeof GM_addStyle === 'function') {
                GM_addStyle(style);
            } else {
               styleSheet.insertRule(style);
            }
        });

        var helper = document.createElement('div');
        helper.className = 'redmine-helper-info';
        document.body.appendChild(helper);
        helper.addEventListener('click', showAll, false);

        updateHelper();
    }

    function storyRightClick(e) {
        e.preventDefault();
        hide(this);

        var data = getData(this.id);
        data.hidden = true;
        setData(this.id, data);

        updateLocalStorage();
        updateHelper();
    }

    function hide(item) {
        item.style.display = 'none';
    }

    function show(item) {
        item.style.display = '';
    }

    function showAll() {
        Array.prototype.forEach.call(stories, function (story) {
            if (getData(story.id).hidden) {
                show(story);

                var data = getData(story.id);
                data.hidden = false;
                setData(story.id, data);

                updateLocalStorage();
                updateHelper();
            }
        });
    }

    function getData(id) {
        return storage[id] || {hidden: false, color: null};
    }

    function setData(id, data) {
        if (!storage[id]) {
            storage[id] = getData(id);
        }

        for (i in data) {
            if (data.hasOwnProperty(i)) {
                storage[id][i] = data[i];
            }
        }
    }

    function getLocalStorage() {
        return JSON.parse(localStorage.getItem('storyHelper') || '{}');
    }

    function updateLocalStorage() {
        localStorage.setItem('storyHelper', JSON.stringify(storage));
    }

    function getHelperContent() {
        var count = 0;
        for (i in storage) {
            if (storage.hasOwnProperty(i)) {
                if (storage[i].hidden) {
                    count++;
                }
            }
        }

        if (count === 0) {
            return 'Все задачи видимы';
        } else {
            //              0   1    2    3    4    5   6   7   8   9
            var endings = [ '', 'а', 'и', 'и', 'и', '', '', '', '', '' ],
                lastNum = parseInt(count.toString().substr(-1, 1), 10);
            return 'Спрятано ' + count + ' задач' + endings[lastNum] + ', кликните, чтобы показать все';
        }
    }

    function updateHelper() {
        helper.innerHTML = getHelperContent();
    }
})(window);