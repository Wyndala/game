(function (window) {
    function Hud() {
        this.initialize();
    }

    Hud.prototype = new createjs.Container();

    // save the original initialize-method so it won't be gone after
    // overwriting it
    Hud.prototype._initialize = Hud.prototype.initialize;

    // initialize the object
    Hud.prototype.initialize = function () {
        this._initialize();
        this.name = 'Hud';
        this.snapToPixel = true;

        var coinIcon = new createjs.Bitmap('assets/apple.png');
        coinIcon.x = 10;
        coinIcon.y = 8;
        this.addChild(coinIcon);

        this.coinText = new createjs.Text("x 0", "20px Arial", "#fff");
        this.coinText.x = 38;
        this.coinText.y = 30;
        this.coinText.textBaseline = "alphabetic";
        this.addChild(this.coinText);

        var lifeIcon = new createjs.Bitmap('assets/lifeIcon.png');
        lifeIcon.x = 100;
        lifeIcon.y = 10;
        this.addChild(lifeIcon);

        this.lifeText = new createjs.Text("x 5", "20px Arial", "#fff");
        this.lifeText.x = 133;
        this.lifeText.y = 30;
        this.lifeText.textBaseline = "alphabetic";
        this.addChild(this.lifeText);
    }

    Hud.prototype.update = function() {
        if (collects > 99) {
            life++;
            collects = 0;
        }

        this.coinText.text = "x " + collects;
        this.lifeText.text = "x " + life;
    }

    window.Hud = Hud;
} (window));