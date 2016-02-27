// ==UserScript==
// @name         Joara Freeboard Extend
// @namespace    http://joara.com/
// @version      0.1
// @description  조아라 자유게시판 확장기능. 현재 [댓글 알림 기능]이 있음.
// @author       Cenor
// @match        http://joara.com/board/free_board_view.html?*
// @match        http://www.joara.com/board/free_board_view.html?*
// @match        http://mw.joara.com/*
// @grant        none
// ==/UserScript==

'use strict';

function StorageGet(a){return JSON.parse(localStorage.getItem(a))}function StorageSet(a,b){return localStorage.setItem(a,JSON.stringify(b))}
function BookmarkAdd(a){if(!a)return 0;var b=StorageGet("BookmarkList"),c="http://mw.joara.com/api/v1/board_comment/list?sub_type=free&cur_page=1&PageSize=100&idx="+a,b=b.concat([a]);StorageSet("BookmarkList",b);$.getJSON(c,function(a){var b=this.url.split("idx=")[1],d=StorageGet("BookmarkComment");d[b]=a.data.paging.total_cnt;StorageSet("BookmarkComment",d)})}
function CheckComment(){var a=StorageGet("BookmarkList"),b=StorageGet("BookmarkComment"),c;for(c in a)$.getJSON("http://mw.joara.com/api/v1/board_comment/list?sub_type=free&cur_page=1&PageSize=100&idx="+a[c],function(a){var c=this.url.split("idx=")[1],d=b[c],e=a.data.paging.total_cnt;b[c]=e;StorageSet("BookmarkComment",b);d<e&&(d=Mobile?"http://mw.joara.com/#/board/free/detail/":"free_board_view.html?idx=",$("<a style='display: block; background: black; color: white; padding: 8px; margin: 8px; border-radius: 3px;' onclick='this.remove()'></a>").appendTo($("#Alerts")).attr("href",
d+c).text(a.data.items[e-1].comment))})}var Mobile="mw.joara.com"==document.location.host?1:0;CheckComment();setInterval(CheckComment,3E4);StorageGet("BookmarkList")||StorageSet("BookmarkList",[]);StorageGet("BookmarkComment")||StorageSet("BookmarkComment",{});$("body").append("<div id='Alerts' style='position: fixed; bottom: 32px; right: 32px;'></div>");
$("<button style='position: fixed; bottom: 0; left: 0; background: black; color: white; padding: 12px;'>\uc54c\ub9bc</button>").appendTo($("body")).bind("click",function(){BookmarkAdd(document.location.href.split("detail/")[1])});