// ==UserScript==
// @name         Joara Extend
// @namespace    http://joara.com/
// @version      0.3
// @description  조아라 확장기능. 현재 [자유게시판 댓글 알림 기능], [소설 댓글 알림 기능] 이 있음.
// @author       Cenor
// @match        http://joara.com/*
// @match        http://www.joara.com/*
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

function BoardBookmarkAdd(id)
{
	if(!id) return;
	
	var BoardBookmarkList = StorageGet("BoardBookmarkList");
	var url = "http://mw.joara.com/api/v1/board_comment/list?sub_type=free&cur_page=1&PageSize=100&idx=" + id;
	
	StorageSet("BoardBookmarkList", BoardBookmarkList.concat([id]));
	
	$.getJSON(url, function(Data)
	{
		var id = this.url.split("idx=")[1];
		var BoardBookmarkComment = StorageGet("BoardBookmarkComment");
		
		BoardBookmarkComment[id] = Data.data.paging.total_cnt;
		StorageSet("BoardBookmarkComment", BoardBookmarkComment);
	});
}

function CheckBoardComment()
{
	var BoardBookmarkList = StorageGet("BoardBookmarkList");
	var BoardBookmarkCommentList = StorageGet("BoardBookmarkComment");
	
	for(var i in BoardBookmarkList)
	{
		var url = "http://mw.joara.com/api/v1/board_comment/list?sub_type=free&cur_page=1&PageSize=100&idx=" + BoardBookmarkList[i];
		
		$.getJSON(url, function(Data)
		{
			var id = this.url.split("idx=")[1].split("&")[0];
			var BoardBookmarkComment = BoardBookmarkCommentList[id];
			var BoardBookmarkCommentNew = Data.data.paging.total_cnt;
			
			BoardBookmarkCommentList[id] = BoardBookmarkCommentNew;
			StorageSet("BoardBookmarkComment", BoardBookmarkCommentList);
			
			if (BoardBookmarkComment < BoardBookmarkCommentNew)
			{
				$("<a onclick='this.remove()'></a>") .appendTo($("#Alerts")) .attr("href", Fburl + id) .text(Data.data.items[BoardBookmarkCommentNew - 1].comment);
			}
		});
	}
}

function NovelBookmarkAdd(id)
{
	if(!id) return;
	
	var NovelBookmarkList = StorageGet("NovelBookmarkList");
	var url = "http://" + WWW + "joara.com/modules/json/comment_book.php?mode=show&page=%2Fliterature%2Fview%2Fbook_comment.html&page_size=10&book_code=" + id;
	
	StorageSet("NovelBookmarkList", NovelBookmarkList.concat([id]));
	
	$.getJSON(url, function(Data)
	{
		var id = this.url.split("book_code=")[1];
		var NovelBookmarkComment = StorageGet("NovelBookmarkComment");
		
		NovelBookmarkComment[id] = Data.cmt_totalcnt;
		StorageSet("NovelBookmarkComment", NovelBookmarkComment);
	});
}

function CheckNovelComment()
{
	var NovelBookmarkList = StorageGet("NovelBookmarkList");
	var NovelBookmarkCommentList = StorageGet("NovelBookmarkComment");
	
	for(var i in NovelBookmarkList)
	{
		var url = "http://" + WWW + "joara.com/modules/json/comment_book.php?mode=show&page=%2Fliterature%2Fview%2Fbook_comment.html&page_size=10&book_code=" + NovelBookmarkList[i];
		
		$.getJSON(url, function(Data)
		{
			var id = this.url.split("book_code=")[1].split("&")[0];
			var NovelBookmarkComment = NovelBookmarkCommentList[id];
			var NovelBookmarkCommentNew = Data.cmt_totalcnt;
			
			NovelBookmarkCommentList[id] = NovelBookmarkCommentNew;
			StorageSet("NovelBookmarkComment", NovelBookmarkCommentList);
			
			if (NovelBookmarkComment < NovelBookmarkCommentNew)
			{
				$("<a onclick='this.remove()'></a>") .appendTo($("#Alerts")) .attr("href", Nvurl + id) .text(Data.commentList[0].comment);
			}
		});
	}
}



var Mobile = "mw.joara.com" == document.location.host ? 1 : 0;
var WWW = "www.joara.com" == document.location.host ? "www." : "";
var Fburl = Mobile ? "http://mw.joara.com/#/board/free/detail/" : "free_board_view.html?idx=";
var Nvurl = "http://www.joara.com/literature/view/book_view.html?book_code=";

CheckBoardComment();
CheckNovelComment();
setInterval(CheckBoardComment, 30000);
setInterval(CheckNovelComment, 60000);

if(!StorageGet("BoardBookmarkList")) StorageSet("BoardBookmarkList", []);
if(!StorageGet("BoardBookmarkComment")) StorageSet("BoardBookmarkComment", {});
if(!StorageGet("NovelBookmarkList")) StorageSet("NovelBookmarkList", []);
if(!StorageGet("NovelBookmarkComment")) StorageSet("NovelBookmarkComment", {});

$("body").append("<div id='Alerts'></div>");

$("<style></style>").appendTo($("body")).text(
"#Alerts {position: fixed; bottom: 32px; right: 32px;}" + 
"#Alerts > a {display: block; background: black; color: white; padding: 12px; margin: 8px; border-radius: 3px; z-index: 10;}");

if(Mobile) 
{
	$(document).on("DOMSubtreeModified", "#board_content", function()
	{
		if(!($("#BoardBookmarkBtn")[0])) 
			$("<button id='BoardBookmarkBtn'>\uc54c\ub9bc</button>") .appendTo($(".left")) .bind("click", function()
			{
				BoardBookmarkAdd(document.location.href.split("detail/")[1]);
			});
	});
}

else
{
	$("<a class='common_btn'><span>\uc54c\ub9bc</span></a>") .appendTo($(".btnL")) .bind("click", function()
	{
		if(document.location.href.indexOf("book_code") != -1) NovelBookmarkAdd(document.location.href.split("book_code=")[1].split("&")[0]);
		else BoardBookmarkAdd(document.location.href.split("idx=")[1].split("&")[0]);
	});
}