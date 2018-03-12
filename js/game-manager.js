var Game = function()
{
	this.playerName = "DEFAULT";
	this.playerLevel = 1;
	this.maxLevel = 999;
	this.playerXp = 0;
	this.xpToNextLevel = 100;
	this.xpFactor = 1.10;
	this.clickValue = 1;
	this.coins = 0;
	this.workers = 0;
	this.workerCoins = 1;
	this.coinsPerSecond = 0;
	this.totalClicks = 0;
	this.totalCoins = 0;
	this.buyClickPrice = 50;
	this.buyWorkerPrice = 1000;
	this.clickBuyMult = 1;
	this.workersBuyMult = 1;
	this.clickUpgradePrice = 10000;
	this.workersUpgradePrice = 50000;
	this.clickUpgradeMult = 2;
	this.workersUpgradeMult = 2;
	this.priceFactor = 1.05;
	this.upgradePriceFactor = 1.50;

	this.autoSave = true;
	this.autoSaveFrequency = 30000; // 30s
	this.questsManager = new QuestsManager();

	this.addClickCoins = function()
	{
		this.coins += this.clickValue;
		this.totalCoins += this.clickValue;
		this.totalClicks++;
	}

	this.updateUI = function()
	{
		$("#ui-coins").html(this.formatNumber(this.coins)+" coins");
		$("#ui-workers").html(this.formatNumber(this.workers)+" workers");
		$("#ui-coins-sec").html(this.formatNumber(this.coinsPerSecond)+" coins/s");
		$("#ui-level").html(this.playerLevel);
		$("#ui-total-clicks").html("Total clicks: "+this.formatNumber(this.totalClicks));
		$("#ui-total-coins").html("Total coins: "+this.formatNumber(this.totalCoins));
		$("#buy-click-btn").html("Buy click: "+this.colorizeNumber(this.buyClickPrice, this.formatNumber(this.buyClickPrice))+"<img class='shop-btn-img' src='img/coin.png' width='16' height='16'>");
		$("#buy-worker-btn").html("Buy worker: "+this.colorizeNumber(this.buyWorkerPrice, this.formatNumber(this.buyWorkerPrice))+"<img class='shop-btn-img' src='img/coin.png' width='16' height='16'>");
		$("#click-btn").html("Click +"+this.formatNumber(this.clickValue)+"<img src='img/coin.png' width='16' height='16'>");
		$("#upgrade-click-btn").html("Click profit * 2: "+this.colorizeNumber(this.clickUpgradePrice, this.formatNumber(this.clickUpgradePrice))+"<img src='img/coin.png' width='16' height='16'>");
		$("#upgrade-workers-btn").html("Workers efficiency * 2: "+this.colorizeNumber(this.workersUpgradePrice, this.formatNumber(this.workersUpgradePrice))+"<img src='img/coin.png' width='16' height='16'>");
	}

	this.save = function()
	{
		var data = 
		{
			'playerName': this.playerName,
			'playerLevel': this.playerLevel,
			'clickValue': this.clickValue,
			'coins': this.coins,
			'workers': this.workers,
			'workerCoins': this.workerCoins,
			'totalClicks': this.totalClicks,
			'totalCoins': this.totalCoins,
			'buyClickPrice': this.buyClickPrice,
			'buyWorkerPrice': this.buyWorkerPrice,
			'clickBuyMult' : this.clickBuyMult,
			'workersBuyMult' : this.WorkersBuyMult,
			'clickUpgradePrice' : this.clickUpgradePrice,
			'workersUpgradePrice' : this.workersUpgradePrice,
			'clickUpgradeMult' : this.clickUpgradeMult,
			'workersUpgradeMult' : this.workersUpgradeMult,
			'autoSave':this.autoSave,
			'autoSaveFrequency':this.autoSaveFrequency
		}

		localStorage.setItem('space-clicker-save', JSON.stringify(data));

		console.log("Saved game: "+JSON.stringify(data));
	}

	this.loadLocalSave = function()
	{
		var data = JSON.parse(localStorage.getItem('space-clicker-save'));

		if (data != null)
		{
			this.playerName = data.playerName;
			this.playerLevel = data.playerLevel;
			this.clickValue = data.clickValue;
			this.coins = data.coins;
			this.workers = data.workers;
			this.workerCoins = data.workerCoins;
			this.totalClicks = data.totalClicks;
			this.totalCoins = data.totalCoins;
			this.buyClickPrice = data.buyClickPrice;
			this.buyWorkerPrice = data.buyWorkerPrice;
			this.clickBuyMult = data.clickBuyMult;
			this.workersBuyMult = data.WorkersBuyMult;
			this.clickUpgradePrice = data.clickUpgradePrice;
			this.workersUpgradePrice = data.workersUpgradePrice;
			this.clickUpgradeMult = data.clickUpgradeMult;
			this.workersUpgradeMult = data.workersUpgradeMult;
			this.autoSave = data.autoSave;
			this.autoSaveFrequency = data.autoSaveFrequency;

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
		if(this.canBuy(this.buyClickPrice))
		{
			this.clickValue += this.clickBuyMult;
			this.coins -= this.buyClickPrice;
			this.updateClickPrice();
		}
	}

	this.buyWorker = function()
	{
		if(this.canBuy(this.buyWorkerPrice))
		{
			this.workers++;
			this.coins -= this.buyWorkerPrice;
			this.updateWorkerPrice();
			this.calcCoinsPerSecond();
		}
	}

	this.updateClickPrice = function()
	{
		this.buyClickPrice = Math.ceil(this.buyClickPrice * this.priceFactor);
	}

	this.updateWorkerPrice = function()
	{
		this.buyWorkerPrice = Math.floor(this.buyWorkerPrice * this.priceFactor);
	}

	this.updateWorkersUpgradePrice = function()
	{
		this.workersUpgradePrice *= this.upgradePriceFactor;
	}

	this.updateClickUpgradePrice = function()
	{
		this.clickUpgradePrice *= this.upgradePriceFactor;
	}

	this.upgradeWorkersEfficiency = function()
	{
		if(this.canBuy(this.workersUpgradePrice))
		{
			this.coins -= this.workersUpgradePrice;
			this.workerCoins *= this.workersUpgradeMult;
			this.calcCoinsPerSecond();
			this.updateWorkersUpgradePrice();
		}
	}

	this.upgradeClickProfit = function()
	{
		if(this.canBuy(this.clickUpgradePrice))
		{
			this.coins -= this.clickUpgradePrice;
			this.clickValue *= this.clickUpgradeMult;
			this.updateClickUpgradePrice();
		}		
	}

	this.canBuy = function(price)
	{
		return this.coins >= price;
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
		if(n > this.coins)
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
		this.coinsPerSecond = this.workers * this.workerCoins;
	}

	this.collectWorkersCoins = function()
	{
		this.coins += this.coinsPerSecond;
		this.totalCoins += this.coinsPerSecond;
	}

	this.addCoins = function(val)
	{
		this.coins += val;
	}

	this.addXp = function(amount)
	{
		this.playerXp += amount;

		if(this.playerXp >= this.xpToNextLevel)
		{
			this.levelUp();
			this.playerXp = this.playerXp - this.xpToNextLevel;
			this.xpToNextLevel *= this.xpFactor;
		}
	}

	this.levelUp = function()
	{
		this.playerLevel++;
	}

}