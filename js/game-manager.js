var Game = function()
{
	this.gameData = 
	{
		playerName : "DEFAULT",
		playerLevel : 1,
		maxLevel : 999,
		playerXp : 0,
		xpToNextLevel : 100,
		xpFactor : 1.10,
		clickValue : 1,
		coins : 0,
		workers : 0,
		workerCoins : 1,
		coinsPerSecond : 0,
		totalClicks : 0,
		totalCoins : 0,
		buyClickPrice : 50,
		buyWorkerPrice : 1000,
		clickBuyMult : 1,
		workersBuyMult : 1,
		clickUpgradePrice : 10000,
		workersUpgradePrice : 50000,
		clickUpgradeMult : 2,
		workersUpgradeMult : 2,
		priceFactor : 1.05,             // move
		upgradePriceFactor : 1.50,		// move
		autoSave : true,
		autoSaveFrequency : 30000, // 30s
		questsManager : undefined
	}

	this.gameData.questsManager = new QuestsManager();

	this.addClickCoins = function()
	{
		this.gameData.coins += this.gameData.clickValue;
		this.gameData.totalCoins += this.gameData.clickValue;
		this.gameData.totalClicks++;
	}

	this.updateUI = function()
	{
		$("#ui-coins").html(this.formatNumber(this.gameData.coins)+" coins");
		$("#ui-workers").html(this.formatNumber(this.gameData.workers)+" workers");
		$("#ui-coins-sec").html(this.formatNumber(this.gameData.coinsPerSecond)+" coins/s");
		$("#ui-level").html(this.gameData.playerLevel);
		$("#ui-total-clicks").html("Total clicks: "+this.formatNumber(this.gameData.totalClicks));
		$("#ui-total-coins").html("Total coins: "+this.formatNumber(this.gameData.totalCoins));
		$("#buy-click-btn").html("Buy click: "+this.colorizeNumber(this.gameData.buyClickPrice, this.formatNumber(this.gameData.buyClickPrice))+"<img class='shop-btn-img' draggable='false' src='img/coin.png' width='16' height='16'>");
		$("#buy-worker-btn").html("Buy worker: "+this.colorizeNumber(this.gameData.buyWorkerPrice, this.formatNumber(this.gameData.buyWorkerPrice))+"<img class='shop-btn-img' draggable='false' src='img/coin.png' width='16' height='16'>");
		$("#click-btn").html("Click +"+this.formatNumber(this.gameData.clickValue)+"<img src='img/coin.png' draggable='false' width='16' height='16'>");
		$("#upgrade-click-btn").html("Click profit * 2: "+this.colorizeNumber(this.gameData.clickUpgradePrice, this.formatNumber(this.gameData.clickUpgradePrice))+"<img src='img/coin.png' draggable='false' width='16' height='16'>");
		$("#upgrade-workers-btn").html("Workers efficiency * 2: "+this.colorizeNumber(this.gameData.workersUpgradePrice, this.formatNumber(this.gameData.workersUpgradePrice))+"<img src='img/coin.png' draggable='false' width='16' height='16'>");
		$("#ui-xp-bar").attr("data-label", this.gameData.playerXp+"/"+this.gameData.xpToNextLevel);
		$("#ui-xp-bar").attr("value", this.gameData.playerXp/this.gameData.xpToNextLevel);
	}

	this.save = function()
	{
		localStorage.setItem('space-clicker-save', JSON.stringify(this.gameData));
		console.log("Saved game: "+JSON.stringify(this.gameData));
	}

	this.loadLocalSave = function()
	{
		if (localStorage.getItem('space-clicker-save'))
		{
			this.gameData = JSON.parse(localStorage.getItem('space-clicker-save'));
			this.calcCoinsPerSecond();
		}
		else
		{
			console.log("No local save found. Starting new game");
		}
	}

	this.reset = function()
	{
		localStorage.removeItem('space-clicker-save');

		window.location.reload();
	}

	this.buyClick = function()
	{
		if(this.canBuy(this.gameData.buyClickPrice))
		{
			this.gameData.clickValue += this.gameData.clickBuyMult;
			this.gameData.coins -= this.gameData.buyClickPrice;
			this.updateClickPrice();
		}
	}

	this.buyWorker = function()
	{
		if(this.canBuy(this.gameData.buyWorkerPrice))
		{
			this.gameData.workers++;
			this.gameData.coins -= this.gameData.buyWorkerPrice;
			this.updateWorkerPrice();
			this.calcCoinsPerSecond();
		}
	}

	this.updateClickPrice = function()
	{
		this.gameData.buyClickPrice = Math.ceil(this.gameData.buyClickPrice * this.gameData.priceFactor);
	}

	this.updateWorkerPrice = function()
	{
		this.gameData.buyWorkerPrice = Math.floor(this.gameData.buyWorkerPrice * this.gameData.priceFactor);
	}

	this.updateWorkersUpgradePrice = function()
	{
		this.gameData.workersUpgradePrice *= this.gameData.upgradePriceFactor;
	}

	this.updateClickUpgradePrice = function()
	{
		this.gameData.clickUpgradePrice *= this.gameData.upgradePriceFactor;
	}

	this.upgradeWorkersEfficiency = function()
	{
		if(this.canBuy(this.gameData.workersUpgradePrice))
		{
			this.gameData.coins -= this.gameData.workersUpgradePrice;
			this.gameData.workerCoins *= this.gameData.workersUpgradeMult;
			this.calcCoinsPerSecond();
			this.updateWorkersUpgradePrice();
		}
	}

	this.upgradeClickProfit = function()
	{
		if(this.canBuy(this.gameData.clickUpgradePrice))
		{
			this.gameData.coins -= this.gameData.clickUpgradePrice;
			this.gameData.clickValue *= this.gameData.clickUpgradeMult;
			this.updateClickUpgradePrice();
		}		
	}

	this.canBuy = function(price)
	{
		return this.gameData.coins >= price;
	}

	this.formatNumber = function(n)
	{
		if(n < 1000)
		{
			return n;
		}
		if(n < 10000)
		{
			return n.toString().slice(0, 1)+"."+n.toString().slice(1, 3)+"K";
		}
		if(n < 100000)
		{
			return n.toString().slice(0, 2)+"."+n.toString().slice(2, 3)+"K";
		}
		if(n < 1000000)
		{
			return n.toString().slice(0, 3)+"."+n.toString().slice(3, 4)+"K";
		}
		if(n < 10000000)
		{
			return n.toString().slice(0, 1)+"."+n.toString().slice(1, 3)+"M";
		}
		return n;
	}

	this.colorizeNumber = function(n, displayed)
	{
		if(n > this.gameData.coins)
		{
			return "<font color='#e74c3c'>"+displayed+"</font>";
		}
		return displayed;
	}

	this.colorizeLevel = function()
	{
		//TODO change level border color every 10? level
	}

	this.calcCoinsPerSecond = function()
	{
		this.gameData.coinsPerSecond = this.gameData.workers * this.gameData.workerCoins;
	}

	this.collectWorkersCoins = function()
	{
		this.gameData.coins += this.gameData.coinsPerSecond;
		this.gameData.totalCoins += this.gameData.coinsPerSecond;
	}

	this.addCoins = function(val)
	{
		this.gameData.coins += val;
	}

	this.addXp = function(amount)
	{
		this.gameData.playerXp += amount;

		if(this.gameData.playerXp >= this.gameData.xpToNextLevel)
		{
			this.levelUp();
		}
	}

	this.addRequiredXp = function()
	{
		this.addXp(this.requiredXp());
	}

	this.requiredXp = function()
	{
		return (this.gameData.xpToNextLevel - this.gameData.playerXp);
	}

	this.levelUp = function()
	{
		this.gameData.playerLevel++;
		this.gameData.playerXp = this.gameData.playerXp - this.gameData.xpToNextLevel;
		this.gameData.xpToNextLevel = Math.floor(this.gameData.xpToNextLevel * this.gameData.xpFactor);
	}

	this.getGameData = function()
	{
		return this.gameData;
	}
}