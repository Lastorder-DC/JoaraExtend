// ==UserScript==
// @name         Joara Freeboard Extend
// @namespace    http://joara.com/
// @version      0.2
// @description  조아라 자유게시판 확장기능. 현재 [댓글 알림 기능]이 있음.
// @author       Cenor
// @match        http://joara.com/board/*
// @match        http://www.joara.com/board/*
// @match        http://mw.joara.com/*
// @grant        none
// ==/UserScript==

'use strict';

function StorageGet(Name)
{
	return JSON.parse(localStorage.getItem(Name));
}

function StorageSet(Name, Data)
{
	return localStorage.setItem(Name, JSON.stringify(Data));
}

function BookmarkAdd(id)
{
	if(!id) return;
	
	var BookmarkList = StorageGet("BookmarkList");
	var url = "http://mw.joara.com/api/v1/board_comment/list?sub_type=free&cur_page=1&PageSize=100&idx=" + id;
	
	StorageSet("BookmarkList", BookmarkList.concat([id]));
	
	$.getJSON(url, function(Data)
	{
		var id = this.url.split("idx=")[1];
		var BookmarkComment = StorageGet("BookmarkComment");
		
		BookmarkComment[id] = Data.data.paging.total_cnt;
		StorageSet("BookmarkComment", BookmarkComment);
	});
}

function CheckComment()
{
	var BookmarkList = StorageGet("BookmarkList");
	var BookmarkCommentList = StorageGet("BookmarkComment");
	
	for(var i in BookmarkList)
	{
		var url = "http://mw.joara.com/api/v1/board_comment/list?sub_type=free&cur_page=1&PageSize=100&idx=" + BookmarkList[i];
		
		$.getJSON(url, function(Data)
		{
			var id = this.url.split("idx=")[1].split("&")[0];
			var BookmarkComment = BookmarkCommentList[id];
			var BookmarkCommentNew = Data.data.paging.total_cnt;
			
			BookmarkCommentList[id] = BookmarkCommentNew;
			StorageSet("BookmarkComment", BookmarkCommentList);
			
			if (BookmarkComment < BookmarkCommentNew)
			{
				$("<a onclick='this.remove()'></a>") .appendTo($("#Alerts")) .attr("href", Fburl + id) .text(Data.data.items[BookmarkCommentNew - 1].comment);
			}
		});
	}
}



var Mobile = "mw.joara.com" == document.location.host ? 1 : 0;
var Fburl = Mobile ? "http://mw.joara.com/#/board/free/detail/" : "free_board_view.html?idx=";

CheckComment();
setInterval(CheckComment, 30000);

if(!StorageGet("BookmarkList")) StorageSet("BookmarkList", []);
if(!StorageGet("BookmarkComment")) StorageSet("BookmarkComment", {});

$("body").append("<div id='Alerts'></div>");

$("<style></style>").appendTo($("body")).text(
"#Alerts {position: fixed; bottom: 32px; right: 32px;}" + 
"#Alerts > a {display: block; background: black; color: white; padding: 8px; margin: 8px; border-radius: 3px; z-index: 10;}");

if(Mobile) 
{
	$(document).on("DOMSubtreeModified", "#board_content", function()
	{
		if(!($("#BookmarkBtn")[0])) 
			$("<button id='BookmarkBtn'>\uc54c\ub9bc</button>") .appendTo($(".left")) .bind("click", function()
			{
				BookmarkAdd(document.location.href.split("detail/")[1]);
			});
	});
}

else
{
	$("<a class='common_btn'><span>\uc54c\ub9bc</span></a>") .appendTo($(".btnL")) .bind("click", function()
	{
		BookmarkAdd(document.location.href.split("idx=")[1].split("&")[0]);
	});
}