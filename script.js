!function ($) {
    var World = function () {
        this.pressedKey = {};
        this.currentMotion = {};
        this.objects = [];
        this.windSpeed = Math.random() * 6 - 3;
    };
    World.prototype.renderEverything = function () {
        var objs = this.objects;
        for (var i = 0; i < objs.length; i++) {
            $('#world').append(objs[i].html);
        }
    };
    World.prototype.getObjectByType = function (type) {
        var objs = this.objects;
        var ret = [];
        for (var i = 0; i < objs.length; i++) {
            if (objs[i].type == type) {
                ret.push(objs[i]);
            }
        }
        return ret;
    }
    World.prototype.updateMoves = function () {
        var koinichi = this.getObjectByType('koinichi')[0];
        var pressedKey = this.pressedKey;
        var currentMotion = this.currentMotion;
        var createInterval = function (Duration, stepDuration, moveFunction, motion) {
            currentMotion[motion] = true;
            var step = 0;
            var timer = setInterval(function () {
                moveFunction(step++);
                if (step > Duration) {
                    clearInterval(timer);
                    currentMotion[motion] = false;
                }
            }, stepDuration);
        };
        if (pressedKey[37]) { koinichi.move(-3); } // move left
        if (pressedKey[39]) { koinichi.move(3); } // move right
        if (pressedKey[38]) { koinichi.moveArm(-1); } // arm up
        if (pressedKey[40]) { koinichi.moveArm(1); }  // arm down
        if (pressedKey[88] && !currentMotion["shaking"]) { // shake antenna
            var shakeDuration = 100;
            var stepDuration = 1;
            createInterval(shakeDuration, stepDuration, koinichi.shakeAntenna, "shaking");
        }
        if (pressedKey[90] && !currentMotion["jumping"]) { // jump
            var jumpDuration = 100;
            var stepDuration = 10;
            createInterval(jumpDuration, stepDuration, koinichi.jump, "jumping");
        }

        var clouds = this.getObjectByType('cloud');
        for (var i = 0; i < clouds.length; i++) {
            clouds[i].move(this.windSpeed);
        }
    };


    var WorldObject = function (type, x, y) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.width = 0;
        this.height = 0;
        this.html = $('<div>')
            .addClass(type)
            .css('left', x)
            .css('bottom', y)
            .css('z-index', type == 'koinichi' ? 999 : document.world.objects.length);
    };
    WorldObject.prototype.move = function (velocity) {
        var pos = this.x;
        pos += velocity;
        if (pos < -this.width) {
            pos = $(window).width();
        }
        if (pos > $(window).width()) {
            pos = -this.width;
        }
        this.x = pos;
        $(this.html).css("left", pos + 'px');
    };
    WorldObject.prototype.getWidth = function () {
        return this.width;
    };
    WorldObject.prototype.getHeight = function () {
        return this.height;
    };

    function KOINICHI(x, y) {
        WorldObject.call(this, 'koinichi', x, y);
        this.width = 140;
        this.height = 135;
        this.html.html($(
            '<div class="top"> \
			    <div class="antenna left-antenna float-left" style="transform: rotate(45deg);"></div> \
			    <div class="antenna right-antenna float-right" style="transform: rotate(-45deg);"></div> \
		    </div> \
		    <div class="middle"> \
			    <div class="arm left-arm float-left" style=" transform: rotate(-50deg);"></div> \
			    <div class="face"> \
				    <div class="eye left-eye float-left"></div> \
				    <div class="eye right-eye float-right"></div> \
				    <div style="clear: both;"></div> \
				    <div class="mouth"></div> \
			    </div> \
			    <div class="arm right-arm float-right" style="transform: rotate(-50deg);"></div> \
			    <div class="clear"></div> \
		    </div> \
		    <div class="bottom"> \
			    <div class="leg left-leg float-left"></div> \
			    <div class="leg right-leg float-right"></div> \
			    <div style="clear: both;"></div> \
		    </div>'))
            .css('width', this.width)
            .css('height', this.height);
    };
    KOINICHI.prototype = Object.create(WorldObject.prototype);
    KOINICHI.prototype.constructor = KOINICHI;
    KOINICHI.prototype.moveArm = function (sign) {
        var MAX_ANGLE = Math.PI / 3, MIN_ANGLE = -MAX_ANGLE, SPEED = 0.05;
        var leftarm = $(".koinichi").find(".left-arm");
        var rightarm = $(".koinichi").find(".right-arm");

        var angle = Math.asin(leftarm.css("transform").split('(')[1].split(',')[1]);

        if (sign < 0) angle = Math.max(MIN_ANGLE, angle + (SPEED * sign));
        if (sign > 0) angle = Math.min(MAX_ANGLE, angle + (SPEED * sign));

        leftarm.css("transform", "rotate(" + angle + "rad)");
        rightarm.css("transform", "rotate(" + angle + "rad)");

        //console.log("degree : " + degree)
    };
    KOINICHI.prototype.jump = function (step) {
        var pos = $(".koinichi").css("bottom");
        var HEIGHT = 490.5;
        pos = (HEIGHT * step - 0.5 * 9.81 * step * step) / 400;
        $(".koinichi").css("bottom", pos);
    };
    KOINICHI.prototype.shakeAntenna = function (step) {
        var MAX_ANGLE = Math.PI / 3, MIN_DEG = Math.PI / 6, DEF_ANGLE = Math.PI / 4;

        var leftantenna = $(".koinichi").find(".left-antenna");
        var rightantenna = $(".koinichi").find(".right-antenna");

        //var angle = Math.asin(leftantenna.css("transform").split('(')[1].split(',')[1]);

        var angle = Math.sin(Math.PI * step / 25) / 16 + DEF_ANGLE;

        leftantenna.css("transform", "rotate(" + angle + "rad)");
        rightantenna.css("transform", "rotate(" + -angle + "rad)");

        //console.log("angle: " + angle + " " + step);
    };

    function Tree(x, y) {
        WorldObject.call(this, 'tree', x, y);
        this.width = 130;
        this.height = 140;
        this.html.html($(
            '<div class="top"> \
                <div class="leaf leaf-top"> </div> \
                <div class="leaf leaf-left"> </div> \
                <div class="leaf leaf-right"> </div> \
		    </div> \
		    <div class="bottom"> \
		    </div>'))
            .css('width', this.width)
            .css('height', this.height);
    };
    Tree.prototype = Object.create(WorldObject.prototype);
    Tree.prototype.constructor = Tree;

    function Cloud(x, y) {
        WorldObject.call(this, 'cloud', x, y);
        this.width = 200;
        this.height = 100;
        this.html.html($(
		    '<div class="clump" style="width: 30px; height: 20px; top: 0px; left: 5px; border-bottom: none"> </div> \
		    <div class="clump" style="width: 34px; height: 16px; top: 4px; left: 31px; border-bottom: none"> </div> \
		    <div class="clump" style="width: 28px; height: 18px; top: 3px; left: 61px; border-bottom: none"> </div> \
		    <div class="clump" style="width: 18px; height: 34px; top: 8px; left: 89px; border-left: none"> </div> \
		    <div class="clump" style="width: 26px; height: 18px; top: 42px; left: 73px; border-top: none"> </div> \
		    <div class="clump" style="width: 30px; height: 24px; top: 42px; left: 47px; border-top: none"> </div> \
		    <div class="clump" style="width: 22px; height: 18px; top: 40px; left: 29px; border-top: none"> </div> \
		    <div class="clump" style="width: 26px; height: 20px; top: 44px; left: 7px; border-top: none"> </div> \
		    <div class="clump" style="width: 24px; height: 30px; top: 20px; left: -7px; border-right: none"> </div>'))
            .css('width', this.width)
            .css('height', this.height);
    };
    Cloud.prototype = Object.create(WorldObject.prototype);
    Cloud.prototype.constructor = Tree;


    document.world = new World();

    $(document).on('ready', function (e) {
        var width = $(window).width();
        var height = 400;
        var centerX = width / 2;
        this.world.objects.push(new KOINICHI(centerX - 70, 0));

        var nTrees = Math.random() * 4, nClouds = Math.random() * 4;
        for (var i = 0; i <= nTrees; i++) { // 1 ~ 4 trees
            this.world.objects.push(new Tree(Math.random() * width, 0)); // at (0 ~ width, 0)
        }
        x = 0;
        for (var i = 0; i <= nClouds; i++) { // 1 ~ 4 clouds
            this.world.objects.push(new Cloud(Math.random() * width, Math.random() * 150 + 150)); // at (0 ~ width, 150 ~ 300)
        }

        this.world.renderEverything();

        setInterval(function () { document.world.updateMoves(); }, 25);
    });

    $(document).keydown(function (e) {
        this.world.pressedKey[e.which] = true;
        //console.log(keys)
    });

    $(document).keyup(function (e) {
        this.world.pressedKey[e.which] = false;
    });
}(jQuery)