var gameManager;

$( document ).ready(function() 
{
	gameManager = new Game();
	gameManager.loadLocalSave();
	loadLang();
	$("#middle-panel-title").html('Hangar');
	$("#middle-panel-content").html('<img draggable="false" src="../img/hangar.jpg"/>');

	start();

	$(document).ajaxSend(function(e, xhr, opt)
	{
    	$("#loading").css("display", "block");
	});

	$(document).ajaxSuccess(function()
	{
    	$("#loading").css("display", "none");
	});

	$(document).ajaxError(function()
	{
		$("#loading").css("display", "none");
    	notification("error", "An error occurred while trying to contact the server");
	});

	$("#content").click(function()
	{
		$("#login-form").slideUp();	
		$("#register-form").slideUp();
	});
   	
   	$("#nav-login-btn").click(function()
	{
		$("#login-form").slideToggle();
		$("#register-form").hide();
	});

	$("#close-login-form").click(function()
	{
		$("#login-form").slideUp();
	});

	$("#login-btn").click(function()
	{
		var username = $("#login-username").val();
		var password = $("#login-password").val();

		if(username != "" && password != "")
		{
			$.post("data/users/users.json", function(data)
			{
				console.log(data);
			});
		}
	});

	$("#nav-register-btn").click(function()
	{
		$("#register-form").slideToggle();
		$("#login-form").hide();
	});

	$("#close-register-form").click(function()
	{
		$("#register-form").slideUp();
	});

	$("#leaderboards-btn").click(function()
	{
		$(".modal").hide();
		$("#leaderboards-modal").toggle();
	});

	$("#stats-btn").click(function()
	{
		$(".modal").hide();
		$("#stats-modal").toggle();
	});

	$("#achievements-btn").click(function()
	{
		$(".modal").hide();
		$("#achievements-modal").toggle();
	});

	$("#settings-icon").click(function()
	{
		$(".modal").hide();
		$("#options-modal").toggle();
	});

	$(".close-modal").click(function()
	{
		$(".modal").hide();
	});

	$("#reset-btn").click(function()
	{
		if(confirm("Are you sure you want to reset all your progression in the game ? (all the data will be lost forever !)"))
		{
			gameManager.reset();
		}
	});

	$("#btn-map").click(function()
	{
		$(".modal").hide();
		$("#map-modal").toggle();
	});

	$("#btn-inv").click(function()
	{
		$(".modal").hide();
		$("#inv-modal").toggle();
	});

	$("#click-btn").click(function()
	{
		gameManager.addClickCoins();
	});

	$("#load-btn").click(function()
	{
		$("#save-select").click();
	});	

	$("#save-btn").click(function()
	{
		gameManager.save();
		notification('info', 'Game saved');
	});

	$("#export-btn").click(function()
	{
		var tempPass = "pass";
		var data = gameManager.getGameData();
		var element = document.createElement('a');
  		element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(CryptoJS.AES.encrypt(JSON.stringify(data), tempPass)));
  		element.setAttribute('download', "space-clicker.sav");

  		element.style.display = 'none';
  		document.body.appendChild(element);

		element.click();

		document.body.removeChild(element);
	});

	$("#buy-click-btn").click(function()
	{
		gameManager.buyClick();
	});

	$("#buy-worker-btn").click(function()
	{
		gameManager.buyWorker();
	});

	$("#upgrade-click-btn").click(function()
	{
		gameManager.upgradeClickProfit();
	});

	$("#upgrade-workers-btn").click(function()
	{
		gameManager.upgradeWorkersEfficiency();
	});

	$("#btn-lang-en").click(function()
	{
		setLang("en");
	});

	$("#btn-lang-fr").click(function()
	{
		setLang("fr");
	});

	$("#btn-dev-1").click(function()
	{
		gameManager.addCoins(100);
	});

	$("#btn-dev-2").click(function()
	{
		gameManager.addCoins(100000);
	});

	$("#btn-dev-3").click(function()
	{
		gameManager.addCoins(1000000);
	});

	$("#btn-dev-4").click(function()
	{
		gameManager.addRequiredXp();
	});

	$("body").contextmenu(function(e)
	{
		e.preventDefault();
	});

});

function notification(type, message)
{
	$('body').append("<div class='notification notification-"+type+"'>"+message+"</div>");
	$('body').delay(2500).queue(function()
	{
		$('.notification').fadeOut(
		{
			'duration':"slow",
			'complete':function(){$('.notification').remove();}
		});
		
		$(this).dequeue();
	});
}

function loadLang()
{
	if(localStorage.getItem("space_clicker_lang") != null)
	{
		$("[data-localize]").localize("data/localize/space_clicker", { language: localStorage.getItem("space_clicker_lang") });
	}
	else
	{
		$("[data-localize]").localize("data/localize/space_clicker", { language: "en" });
	}

}

function setLang(lang)
{
	$("[data-localize]").localize("data/localize/space_clicker", { language: lang });

	saveLang(lang);
}

function saveLang(lang)
{
	localStorage.setItem("space_clicker_lang", lang);
}

var lastRender = 0;
var workersTimer = 0;
var autoSaveTimer = 0;
var gameManager;

function start()
{
	window.requestAnimationFrame(loop);
}

function update(progress) 
{
	// Update the state of the world for the elapsed time since last render
	workersTimer += progress;
	autoSaveTimer += progress;

	if(workersTimer >= 1000)
	{
		gameManager.collectWorkersCoins();
		workersTimer = 0;
	}

	if(autoSaveTimer >= gameManager.autoSaveFrequency)
	{
		gameManager.save();
		notification('info', 'Game saved');
		autoSaveTimer = 0;
	}
}

function draw() 
{
	// Draw the state of the world
	gameManager.updateUI();
}

function loop(timestamp) 
{
  	var progress = timestamp - lastRender;

  	update(progress);
  	draw();

  	lastRender = timestamp;
  	window.requestAnimationFrame(loop)
}