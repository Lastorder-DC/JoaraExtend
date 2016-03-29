// ==UserScript==
// @name         Joara Extend
// @namespace    http://joara.com/
// @Ver      0.7
// @description  조아라 확장기능. 현재 [자유게시판 댓글 알림], [소설 댓글 알림], [소설 임시 저장], [마나 자동 회수] 등의 기능들이 있음.
// @author       Cenor
// @match        http://joara.com/*
// @match        http://www.joara.com/*
// @match        http://mw.joara.com/*
// @grant        none
// ==/UserScript==

'use strict';

var Ver = 7;
var t;
var dlh = document.location.href;
var Mobile = "mw.joara.com" == document.location.host ? 1 : 0;
var WWW = "www.joara.com" == document.location.host ? "www." : "";
var Fburl = Mobile ? "http://mw.joara.com/#/board/free/detail/" : "http://www.joara.com/board/free_board_view.html?idx=";
var Nvurl = "http://www.joara.com/literature/view/book_comment.html?book_code=";

var u = 
{
	b : 
	{
		b : "http://mw.joara.com/api/v1/board_comment/list?sub_type=free&cur_page=1&PageSize=100&idx=",
		n : "http://" + WWW + "joara.com/modules/json/comment_book.php?mode=show&page=%2Fliterature%2Fview%2Fbook_comment.html&page_size=10&book_code="
	},
	
	t : 0
}

if( dlh.indexOf("book_view") != -1) u.t = "n";
else if( dlh.indexOf("free_board_view") != -1) u.t = "b";
else u.t = 0;

var s = 
{
	// Storage
	// Get, Set
	
	g : function(Name) {return JSON.parse(localStorage.getItem(Name))},
	s : function(Name, Data) {return localStorage.setItem(Name, JSON.stringify(Data))}
}

var bm = 
{
	// Bookmark
	// Edit, Check, On, Off, Toggle, Alert, Save Alert
	// Board Data, Novel Data, Alert DAta
	
	ed : function()
	{
		
	},
	
	ch : function()
	{
		for(var i in bm.dat)
		{
			$.getJSON(u.b[bm.dat[i][0]] + bm.dat[i][1] + "&&" + i, function(Data)
			{
				var i = this.url.split("&&")[1];
				var t = Data.data;
				var d = bm.dat[i][2];
				var dn = t.paging.total_cnt;
				
				bm.dat[i][2] = dn;
				s.s("Bookmark", bm.dat);
				
				if (d < dn)
					bm.al(bm.dat[i][1] + ' / ' + t.items[dn - 1].member_name + " : " + t.items[dn - 1].comment, bm.dat[i][1]);
				
			});
		}
	},
	
	on : function(id)
	{
		$.getJSON(u.b[u.t] + id, function(Data)
		{
			var id = this.url.split("idx=")[1];
			var data = Data.data.paging.total_cnt;
			var Bookmark = [u.t, id, data];
			
			bm.dat.push(Bookmark);
			
			s.s("Bookmark", bm.dat);
		});
		
		alert("이 글이 알림 설정되었습니다.");
	},
	
	off : function(i)
	{
		bm.dat.splice(i, (i ? i : 1));
		s.s("Bookmark", bm.dat);
		
		alert("이 글이 알림 해제되었습니다.");
	},
	

	tg : function(id)
	{
		if(!id) return;
		
		for(var i in bm.dat)
		{
			if(bm.dat[i][1] == id)
			{
				bm.off(i);
				return;
			}
		}
		
		bm.on(id);
	},
	
	al : function(txt, flag)
	{
		var id = txt.split(' / ')[0];
		var a = function()
		{
			txt = $(this).attr('txt');
			
			s.s("Alert", $.grep(bm.a, function(val){return val != txt}));
			document.location.href = $(this).attr('url');
		};
		
		if(flag) bm.a.push(txt);
		s.s("Alert", bm.a);
		
		$("#al_ico") .attr("fill", "green") .css('animation', 'ale 1s ease-in-out infinite');
		var a = $("<li></li>") .click(a) .text(txt) .appendTo($("#al")) .attr("txt", $('<div/>').text(txt).html()) .attr("url", Fburl + id);
	},
	
	dat : (t = s.g("Bookmark")) ? t : [],
	a : (t = s.g("Alert")) ? t : []
}

function NovelAutosave()
{
	var title = $("#la_subject").val();
	var text = $("#write_cont").val();
	
	if(!title || !text) return;
}





setTimeout(bm.ch, 1000);
setInterval(bm.ch, 60000);

if(s.g("JEV") < Ver) s.s("JEV", Ver);

/*
if(document.location.pathname.indexOf("literature_part_write") != -1)
{
	setInterval(NovelAutosave, 300000);
	
	$(".tbl_write").before("<a id='tempsave' class='common_btn' style='cursor: pointer'><span>임시 저장 글</span></a>");
	$(".tbl_write").before("<ul id='savelist'></ul>");
	
	$("#tempsave").click(function(){$("#savelist").toggle()});
	
	for(var i in s.g(""))
	
	$("<li>testtestest</li>") .appendTo($("#savelist")) .click(function(){});
}*/


$("body").append('<svg id="al_ico" width="32" height="32" viewBox="0 0 512 512"><path d="m454.6 374.6l-35.9-35.9c-12-12-18.7-28.3-18.7-45.3v-112.6c0-69.1-47.1-130.2-112.4-145.2 0.1-1.2 0.4-2.4 0.4-3.7 0-17.6-14.4-32-32-32s-32 14.4-32 32c0 1.2 0.2 2.4 0.4 3.6-64.3 14.4-112.4 71.7-112.4 140.4v117.5c0 17-6.7 33.3-18.7 45.3l-35.9 35.9c-6 6-9.4 14.1-9.4 22.6v0c0 19.2 15.5 34.7 34.7 34.7h109.3v16c0 35.3 28.7 64 64 64s64-28.7 64-64v-16h109.3c19.2 0 34.7-15.5 34.7-34.7v0c0-8.5-3.4-16.6-9.4-22.6z"/></svg>');
$("body").append("<ul id='al'></ul>");

for(var i in bm.a) bm.al(bm.a[i]);

$("<style></style>").appendTo($("body")).text(
"@keyframes ale { 0% {transform: scale(1);} 25% {transform: scale(1.25);} 75% {transform: scale(0.75);} 100% {transform: scale(0.875);} }" +

"#al_ico {position: fixed; bottom: 16px; left: 16px; z-index: 100;}" +
"#al {position: fixed; width: 256px; height: 256px; background: white; bottom: 48px; left: 48px; border: 1px solid gray; border-radius: 3px; box-shadow: 0 3px 5px #888; transform: scale(0); transition: .25s ease-in-out; transform-origin: bottom left; z-index: 100; overflow-y: scroll;}" + 
"#al_ico:hover + #al, #al:hover {transform: scale(1);}" +
"#al > li {border-bottom: 1px solid gray; padding: 12px; cursor: pointer; overflow: hidden; font-family: 'Nanum Gothic', 'Malgun Gothic';}" + 

"#tempsave {margin: 8px; float: right; cursor: pointer;}" + 
"#savelist {display: none; position: fixed; top: 15%; right: 64px; width: 256px; min-height: 512px; backgrond: whitesmoke; border: 2px solid gray;}" + 
"#savelist > li {list-style: initial; margin: 14px; margin-left: 2.5em; cursor: pointer; z-index: 10;}" +
"#savelist > li:hover {border-bottom: 1px solid;}");

if(Mobile) 
{
	$(document).on("DOMSubtreeModified", "#board_content", function()
	{
		if(!($("#BoardBookmarkBtn")[0])) 
			$("<button id='BoardBookmarkBtn'>\uc54c\ub9bc</button>") .appendTo($(".left")) .click(function()
			{
				bm.tg(dlh.split("detail/")[1]);
			});
	});
}

else
{
	$("<a class='common_btn' style='cursor: pointer'><span>\uc54c\ub9bc</span></a>") .appendTo($(".btnL")) .click(function()
	{
		if(dlh.indexOf("book_code") != -1) NovelBookmarkToggle(dlh.split("book_code=")[1].split("&")[0]);
		else bm.tg(dlh.split("idx=")[1].split("&")[0]);
	});
}



$.get("https://rawgit.com/kimtaeyoon49/JoaraExtend/master/Ver.txt", function(Data)
{
	if(parseInt(s.g("JoaraExtendVer")) < Data)
	{
		if(confirm("조아라 확장기능의 업데이트가 있습니다. 업데이트하시겠습니까?"))
			window.open("https://github.com/kimtaeyoon49/JoaraExtend/raw/master/JoaraExtend.user.js", "_blank").focus();
		
		else s.s("JoaraExtendVer", Data);
	}
});

$.get("http://www.joara.com/modules/json/mana_check.php?mode=mana");

