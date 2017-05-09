var IMGplayer = {
    version: '1.2',
};


(function(argument) {
/**
 * Binary Search Stubs for JS Arrays
 * @license MIT
 * @author Jim Chen
 */
var BinArray = (function() {
    var BinArray = {};
    BinArray.bsearch = function(arr, what, how) {
        if (arr.length === 0) {
            return 0;
        }
        if (how(what, arr[0]) < 0) {
            return 0;
        }
        if (how(what, arr[arr.length - 1]) >= 0) {
            return arr.length;
        }
        var low = 0;
        var i = 0;
        var count = 0;
        var high = arr.length - 1;
        while (low <= high) {
            i = Math.floor((high + low + 1) / 2);
            count++;
            if (how(what, arr[i - 1]) >= 0 && how(what, arr[i]) < 0) {
                return i;
            }
            if (how(what, arr[i - 1]) < 0) {
                high = i - 1;
            } else if (how(what, arr[i]) >= 0) {
                low = i;
            } else {
                console.error('Program Error');
            }
            if (count > 1500) {
                console.error('Too many run cycles.');
            }
        }
        return -1; // Never actually run
    };
    BinArray.binsert = function(arr, what, how) {
        var index = BinArray.bsearch(arr, what, how);
        arr.splice(index, 0, what);
        return index;
    };
    return BinArray;
})();

var __extends = (this && this.__extends) || function(d, b) {
    for (var p in b)
        if (b.hasOwnProperty(p))
            d[p] = b[p];
    function __() {
        this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var CommentSpaceAllocator = ( function() {
    function CommentSpaceAllocator(width, height) {
        if (width === void 0) {
            width = 0;
        }
        if (height === void 0) {
            height = 0;
        }
        this._pools = [
            []
        ];
        this.avoid = 1;
        this._width = width;
        this._height = height;
    }
    CommentSpaceAllocator.prototype.willCollide = function(existing, check) {
        return existing.stime + existing.ttl >= check.stime + check.ttl / 2;
    };
    CommentSpaceAllocator.prototype.pathCheck = function(y, comment, pool) {
        var bottom = y + comment.height;
        var right = comment.right;
        for (var i = 0; i < pool.length; i++) {
            if (pool[i].y > bottom || pool[i].bottom < y) {
                continue;
            } else if (pool[i].right < comment.x || pool[i].x > right) {
                if (this.willCollide(pool[i], comment)) {
                    return false;
                } else {
                    continue;
                }
            } else {
                return false;
            }
        }
        return true;
    };
    CommentSpaceAllocator.prototype.assign = function(comment, cindex) {
        while (this._pools.length <= cindex) {
            this._pools.push([]);
        }
        var pool = this._pools[cindex];
        if (pool.length === 0) {
            comment.cindex = cindex;
            return 0;
        } else if (this.pathCheck(0, comment, pool)) {
            comment.cindex = cindex;
            return 0;
        }
        var y = 0;
        for (var k = 0; k < pool.length; k++) {
            y = pool[k].bottom + this.avoid;
            if (y + comment.height > this._height) {
                break;
            }
            if (this.pathCheck(y, comment, pool)) {
                comment.cindex = cindex;
                return y;
            }
        }
        return this.assign(comment, cindex + 1);
    };
    CommentSpaceAllocator.prototype.add = function(comment) {
        if (comment.height > this._height) {
            comment.cindex = -2;
            comment.y = 0;
        } else {
            comment.y = this.assign(comment, 0);
            BinArray.binsert(this._pools[comment.cindex], comment, function(a, b) {
                if (a.bottom < b.bottom) {
                    return -1;
                } else if (a.bottom > b.bottom) {
                    return 1;
                } else {
                    return 0;
                }
            });
        }
    };
    CommentSpaceAllocator.prototype.remove = function(comment) {
        if (comment.cindex < 0) {
            return;
        }
        if (comment.cindex >= this._pools.length) {
            throw new Error("cindex out of bounds");
        }
        var index = this._pools[comment.cindex].indexOf(comment);
        if (index < 0)
            return;
        this._pools[comment.cindex].splice(index, 1);
    };
    CommentSpaceAllocator.prototype.setBounds = function(width, height) {
        this._width = width;
        this._height = height;
    };
    return CommentSpaceAllocator;
}());
var AnchorCommentSpaceAllocator = ( function(_super) {
    __extends(AnchorCommentSpaceAllocator, _super);
    function AnchorCommentSpaceAllocator() {
        _super.apply(this, arguments);
    }
    AnchorCommentSpaceAllocator.prototype.add = function(comment) {
        _super.prototype.add.call(this, comment);
        comment.x = (this._width - comment.width) / 2;
    };
    AnchorCommentSpaceAllocator.prototype.willCollide = function(a, b) {
        return true;
    };
    AnchorCommentSpaceAllocator.prototype.pathCheck = function(y, comment, pool) {
        var bottom = y + comment.height;
        for (var i = 0; i < pool.length; i++) {
            if (pool[i].y > bottom || pool[i].bottom < y) {
                continue;
            } else {
                return false;
            }
        }
        return true;
    };
    return AnchorCommentSpaceAllocator;
}(CommentSpaceAllocator));
//# sourceMappingURL=CommentSpaceAllocator.js.map
var __extends = (this && this.__extends) || function(d, b) {
    for (var p in b)
        if (b.hasOwnProperty(p))
            d[p] = b[p];
    function __() {
        this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var CoreComment = ( function() {
    function CoreComment(parent, init) {
        if (init === void 0) {
            init = {};
        }
        this.mode = 1;
        this.stime = 0;
        this.text = "";
        this.ttl = 4000;
        this.dur = 4000;
        this.cindex = -1;
        this.motion = [];
        this.movable = true;
        this._alphaMotion = null;
        this.absolute = true;
        this.align = 0;
        this._alpha = 1;
        this._size = 25;
        this._color = 0xffffff;
        this._border = false;
        this._shadow = true;
        this._font = "";
        if (!parent) {
            throw new Error("Comment not bound to comment manager.");
        } else {
            this.parent = parent;
        }
        if (init.hasOwnProperty("stime")) {
            this.stime = init["stime"];
        }
        if (init.hasOwnProperty("mode")) {
            this.mode = init["mode"];
        } else {
            this.mode = 1;
        }
        if (init.hasOwnProperty("dur")) {
            this.dur = init["dur"];
            this.ttl = this.dur;
        }
        this.dur *= this.parent.options.global.scale;
        this.ttl *= this.parent.options.global.scale;
        if (init.hasOwnProperty("text")) {
            this.text = init["text"];
        }
        if (init.hasOwnProperty("motion")) {
            this._motionStart = [];
            this._motionEnd = [];
            this.motion = init["motion"];
            var head = 0;
            for (var i = 0; i < init["motion"].length; i++) {
                this._motionStart.push(head);
                var maxDur = 0;
                for (var k in init["motion"][i]) {
                    var m = init["motion"][i][k];
                    maxDur = Math.max(m.dur, maxDur);
                    if (m.easing === null || m.easing === undefined) {
                        init["motion"][i][k]["easing"] = CoreComment.LINEAR;
                    }
                }
                head += maxDur;
                this._motionEnd.push(head);
            }
            this._curMotion = 0;
        }
        if (init.hasOwnProperty("color")) {
            this._color = init["color"];
        }
        if (init.hasOwnProperty("size")) {
            this._size = init["size"];
        }
        if (init.hasOwnProperty("border")) {
            this._border = init["border"];
        }
        if (init.hasOwnProperty("opacity")) {
            this._alpha = init["opacity"];
        }
        if (init.hasOwnProperty("alpha")) {
            this._alphaMotion = init["alpha"];
        }
        if (init.hasOwnProperty("font")) {
            this._font = init["font"];
        }
        if (init.hasOwnProperty("x")) {
            this._x = init["x"];
        }
        if (init.hasOwnProperty("y")) {
            this._y = init["y"];
        }
        if (init.hasOwnProperty("shadow")) {
            this._shadow = init["shadow"];
        }
        if (init.hasOwnProperty("position")) {
            if (init["position"] === "relative") {
                this.absolute = false;
                if (this.mode < 7) {
                    console.warn("Using relative position for CSA comment.");
                }
            }
        }
    }
    CoreComment.prototype.init = function(recycle) {
        if (recycle === void 0) {
            recycle = null;
        }
        if (recycle !== null) {
            this.dom = recycle.dom;
        } else {
            this.dom = document.createElement("div");
        }
        this.dom.className = this.parent.options.global.className;
        this.dom.appendChild(document.createTextNode(this.text));
        this.dom.textContent = this.text;
        this.dom.innerText = this.text;
        this.size = this._size;
        if (this._color != 0xffffff) {
            this.color = this._color;
        }
        this.shadow = this._shadow;
        if (this._border) {
            this.border = this._border;
        }
        if (this._font !== "") {
            this.font = this._font;
        }
        if (this._x !== undefined) {
            this.x = this._x;
        }
        if (this._y !== undefined) {
            this.y = this._y;
        }
        if (this._alpha !== 1 || this.parent.options.global.opacity < 1) {
            this.alpha = this._alpha;
        }
        if (this.motion.length > 0) {
            this.animate();
        }
    };
    Object.defineProperty(CoreComment.prototype, "x", {
        get: function() {
            if (this._x === null || this._x === undefined) {
                if (this.align % 2 === 0) {
                    this._x = this.dom.offsetLeft;
                } else {
                    this._x = this.parent.width - this.dom.offsetLeft - this.width;
                }
            }
            if (!this.absolute) {
                return this._x / this.parent.width;
            }
            return this._x;
        },
        set: function(x) {
            this._x = x;
            if (!this.absolute) {
                this._x *= this.parent.width;
            }
            if (this.align % 2 === 0) {
                this.dom.style.left = this._x + "px";
            } else {
                this.dom.style.right = this._x + "px";
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CoreComment.prototype, "y", {
        get: function() {
            if (this._y === null || this._y === undefined) {
                if (this.align < 2) {
                    this._y = this.dom.offsetTop;
                } else {
                    this._y = this.parent.height - this.dom.offsetTop - this.height;
                }
            }
            if (!this.absolute) {
                return this._y / this.parent.height;
            }
            return this._y;
        },
        set: function(y) {
            this._y = y;
            if (!this.absolute) {
                this._y *= this.parent.height;
            }
            if (this.align < 2) {
                this.dom.style.top = this._y + "px";
            } else {
                this.dom.style.bottom = this._y + "px";
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CoreComment.prototype, "bottom", {
        get: function() {
            return this.y + this.height;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CoreComment.prototype, "right", {
        get: function() {
            return this.x + this.width;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CoreComment.prototype, "width", {
        get: function() {
            if (this._width === null || this._width === undefined) {
                this._width = this.dom.offsetWidth;
            }
            return this._width;
        },
        set: function(w) {
            this._width = w;
            this.dom.style.width = this._width + "px";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CoreComment.prototype, "height", {
        get: function() {
            if (this._height === null || this._height === undefined) {
                this._height = this.dom.offsetHeight;
            }
            return this._height;
        },
        set: function(h) {
            this._height = h;
            this.dom.style.height = this._height + "px";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CoreComment.prototype, "size", {
        get: function() {
            return this._size;
        },
        set: function(s) {
            this._size = s;
            this.dom.style.fontSize = this._size + "px";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CoreComment.prototype, "color", {
        get: function() {
            return this._color;
        },
        set: function(c) {
            this._color = c;
            var color = c.toString(16);
            color = color.length >= 6 ? color : new Array(6 - color.length + 1).join("0") + color;
            this.dom.style.color = "#" + color;
            if (this._color === 0) {
                this.dom.className = this.parent.options.global.className + " rshadow";
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CoreComment.prototype, "alpha", {
        get: function() {
            return this._alpha;
        },
        set: function(a) {
            this._alpha = a;
            this.dom.style.opacity = Math.min(this._alpha, this.parent.options.global.opacity) + "";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CoreComment.prototype, "border", {
        get: function() {
            return this._border;
        },
        set: function(b) {
            this._border = b;
            if (this._border) {
                this.dom.style.border = "1px solid #00ffff";
            } else {
                this.dom.style.border = "none";
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CoreComment.prototype, "shadow", {
        get: function() {
            return this._shadow;
        },
        set: function(s) {
            this._shadow = s;
            if (!this._shadow) {
                this.dom.className = this.parent.options.global.className + " noshadow";
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CoreComment.prototype, "font", {
        get: function() {
            return this._font;
        },
        set: function(f) {
            this._font = f;
            if (this._font.length > 0) {
                this.dom.style.fontFamily = this._font;
            } else {
                this.dom.style.fontFamily = "";
            }
        },
        enumerable: true,
        configurable: true
    });
    CoreComment.prototype.time = function(time) {
        this.ttl -= time;
        if (this.ttl < 0) {
            this.ttl = 0;
        }
        if (this.movable) {
            this.update();
        }
        if (this.ttl <= 0) {
            this.finish();
        }
    };
    CoreComment.prototype.update = function() {
        this.animate();
    };
    CoreComment.prototype.invalidate = function() {
        this._x = null;
        this._y = null;
        this._width = null;
        this._height = null;
    };
    CoreComment.prototype._execMotion = function(currentMotion, time) {
        for (var prop in currentMotion) {
            if (currentMotion.hasOwnProperty(prop)) {
                var m = currentMotion[prop];
                this[prop] = m.easing(Math.min(Math.max(time - m.delay, 0), m.dur), m.from, m.to - m.from, m.dur);
            }
        }
    };
    CoreComment.prototype.animate = function() {
        if (this._alphaMotion) {
            this.alpha = (this.dur - this.ttl) * (this._alphaMotion["to"] - this._alphaMotion["from"]) / this.dur + this._alphaMotion["from"];
        }
        if (this.motion.length === 0) {
            return;
        }
        var ttl = Math.max(this.ttl, 0);
        var time = (this.dur - ttl) - this._motionStart[this._curMotion];
        this._execMotion(this.motion[this._curMotion], time);
        if (this.dur - ttl > this._motionEnd[this._curMotion]) {
            this._curMotion++;
            if (this._curMotion >= this.motion.length) {
                this._curMotion = this.motion.length - 1;
            }
            return;
        }
    };
    CoreComment.prototype.finish = function() {
        this.parent.finish(this);
    };
    CoreComment.prototype.toString = function() {
        return ["[", this.stime, "|", this.ttl, "/", this.dur, "]", "(", this.mode, ")", this.text].join("");
    };
    CoreComment.LINEAR = function(t, b, c, d) {
        return t * c / d + b;
    };
    return CoreComment;
}());
var ScrollComment = ( function(_super) {
    __extends(ScrollComment, _super);
    function ScrollComment(parent, data) {
        _super.call(this, parent, data);
        this.dur *= this.parent.options.scroll.scale;
        this.ttl *= this.parent.options.scroll.scale;
    }
    Object.defineProperty(ScrollComment.prototype, "alpha", {
        set: function(a) {
            this._alpha = a;
            this.dom.style.opacity = Math.min(Math.min(this._alpha, this.parent.options.global.opacity), this.parent.options.scroll.opacity) + "";
        },
        enumerable: true,
        configurable: true
    });
    ScrollComment.prototype.init = function(recycle) {
        if (recycle === void 0) {
            recycle = null;
        }
        _super.prototype.init.call(this, recycle);
        this.x = this.parent.width;
        if (this.parent.options.scroll.opacity < 1) {
            this.alpha = this._alpha;
        }
        this.absolute = true;
    };
    ScrollComment.prototype.update = function() {
        this.x = (this.ttl / this.dur) * (this.parent.width + this.width) - this.width;
    };
    return ScrollComment;
}(CoreComment));
//# sourceMappingURL=Comment.js.map
/** 
 * Comment Filters Module Simplified (only supports modifiers & types)
 * @license MIT
 * @author Jim Chen
 */
function CommentFilter() {
    this.modifiers = [];
    this.runtime = null;
    this.allowTypes = {
        "1": true,
        "4": true,
        "5": true,
        "6": true,
        "7": true,
        "8": true,
        "17": true
    };
    this.doModify = function(cmt) {
        for (var k = 0; k < this.modifiers.length; k++) {
            cmt = this.modifiers[k](cmt);
        }
        return cmt;
    };
    this.beforeSend = function(cmt) {
        return cmt;
    }
    this.doValidate = function(cmtData) {
        if (!this.allowTypes[cmtData.mode])
            return false;
        return true;
    };
    this.addRule = function(rule) {};
    this.addModifier = function(f) {
        this.modifiers.push(f);
    };
    this.runtimeFilter = function(cmt) {
        if (this.runtime == null)
            return cmt;
        return this.runtime(cmt);
    };
    this.setRuntimeFilter = function(f) {
        this.runtime = f;
    }
}

/*!
 * Comment Core Library CommentManager
 * @license MIT
 * @author Jim Chen
 *
 * Copyright (c) 2014 Jim Chen
 */
var CommentManager = (function() {
    var getRotMatrix = function(yrot, zrot) {
        // Courtesy of @StarBrilliant, re-adapted to look better
        var DEG2RAD = Math.PI / 180;
        var yr = yrot * DEG2RAD;
        var zr = zrot * DEG2RAD;
        var COS = Math.cos;
        var SIN = Math.sin;
        var matrix = [
            COS(yr) * COS(zr), COS(yr) * SIN(zr), SIN(yr), 0,
            (-SIN(zr)), COS(zr), 0, 0,
            (-SIN(yr) * COS(zr)) , (-SIN(yr) * SIN(zr)), COS(yr), 0,
            0, 0, 0, 1
        ];
        // CSS does not recognize scientific notation (e.g. 1e-6), truncating it.
        for (var i = 0; i < matrix.length; i++) {
            if (Math.abs(matrix[i]) < 0.000001) {
                matrix[i] = 0;
            }
        }
        return "matrix3d(" + matrix.join(",") + ")";
    };

    function CommentManager(stageObject) {
        var __timer = 0;

        this._listeners = {};
        this._lastPosition = 0;

        this.stage = stageObject;
        this.options = {
            global: {
                opacity: 1,
                scale: 1,
                className: "cmt"
            },
            scroll: {
                opacity: 1,
                scale: 1
            },
            limit: 0
        };
        this.timeline = [];
        this.runline = [];
        this.position = 0;
        this.limiter = 0;
        this.filter = null;
        this.csa = {
            scroll: new CommentSpaceAllocator(0, 0),
            top: new AnchorCommentSpaceAllocator(0, 0),
            bottom: new AnchorCommentSpaceAllocator(0, 0),
            reverse: new CommentSpaceAllocator(0, 0),
            scrollbtm: new CommentSpaceAllocator(0, 0)
        };

        /** Precompute the offset width **/
        this.width = this.stage.offsetWidth;
        this.height = this.stage.offsetHeight;
        this.startTimer = function() {
            if (__timer > 0)
                return;
            var lastTPos = new Date().getTime();
            var cmMgr = this;
            __timer = window.setInterval(function() {
                var elapsed = new Date().getTime() - lastTPos;
                lastTPos = new Date().getTime();
                cmMgr.onTimerEvent(elapsed, cmMgr);
            }, 10);
        };
        this.stopTimer = function() {
            window.clearInterval(__timer);
            __timer = 0;
        };
    }

    /** Public **/
    CommentManager.prototype.stop = function() {
        this.stopTimer();
    };

    CommentManager.prototype.start = function() {
        this.startTimer();
    };

    CommentManager.prototype.seek = function(time) {
        this.position = BinArray.bsearch(this.timeline, time, function(a, b) {
            if (a < b.stime) return -1
            else if (a > b.stime) return 1;
            else return 0;
        });
    };

    CommentManager.prototype.validate = function(cmt) {
        if (cmt == null)
            return false;
        return this.filter.doValidate(cmt);
    };

    CommentManager.prototype.load = function(a) {
        this.timeline = a;
        this.timeline.sort(function(a, b) {
            if (a.stime > b.stime) return 2;
            else if (a.stime < b.stime) return -2;
            else {
                if (a.date > b.date) return 1;
                else if (a.date < b.date) return -1;
                else if (a.dbid != null && b.dbid != null) {
                    if (a.dbid > b.dbid) return 1;
                    else if (a.dbid < b.dbid) return -1;
                    return 0;
                } else
                    return 0;
            }
        });
        this.dispatchEvent("load");
    };

    CommentManager.prototype.insert = function(c) {
        var index = BinArray.binsert(this.timeline, c, function(a, b) {
            if (a.stime > b.stime) return 2;
            else if (a.stime < b.stime) return -2;
            else {
                if (a.date > b.date) return 1;
                else if (a.date < b.date) return -1;
                else if (a.dbid != null && b.dbid != null) {
                    if (a.dbid > b.dbid) return 1;
                    else if (a.dbid < b.dbid) return -1;
                    return 0;
                } else
                    return 0;
            }
        });
        if (index <= this.position) {
            this.position++;
        }
        this.dispatchEvent("insert");
    };

    CommentManager.prototype.clear = function() {
        while (this.runline.length > 0) {
            this.runline[0].finish();
        }
        this.dispatchEvent("clear");
    };

    CommentManager.prototype.setBounds = function() {
        this.width = this.stage.offsetWidth;
        this.height = this.stage.offsetHeight;
        this.dispatchEvent("resize");
        for (var comAlloc in this.csa) {
            this.csa[comAlloc].setBounds(this.width, this.height);
        }
        // Update 3d perspective
        this.stage.style.perspective = this.width * Math.tan(40 * Math.PI / 180) / 2 + "px";
        this.stage.style.webkitPerspective = this.width * Math.tan(40 * Math.PI / 180) / 2 + "px";
    };
    CommentManager.prototype.init = function() {
        this.setBounds();
        if (this.filter == null) {
            this.filter = new CommentFilter(); //Only create a filter if none exist
        }
    };
    CommentManager.prototype.time = function(time) {
        time = time - 1;
        if (this.position >= this.timeline.length || Math.abs(this._lastPosition - time) >= 2000) {
            this.seek(time);
            this._lastPosition = time;
            if (this.timeline.length <= this.position) {
                return;
            }
        } else {
            this._lastPosition = time;
        }
        for (; this.position < this.timeline.length; this.position++) {
            if (this.timeline[this.position]['stime'] <= time) {
                if (this.options.limit > 0 && this.runline.length > this.limiter) {
                    continue; // Skip comments but still move the position pointer
                } else if (this.validate(this.timeline[this.position])) {
                    this.send(this.timeline[this.position]);
                }
            } else {
                break;
            }
        }
    };
    CommentManager.prototype.rescale = function() {};
    CommentManager.prototype.send = function(data) {
        if (data.mode === 8) {
            console.log(data);
            if (this.scripting) {
                console.log(this.scripting.eval(data.code));
            }
            return;
        }
        if (this.filter != null) {
            data = this.filter.doModify(data);
            if (data == null) return;
        }
        if (data.mode === 1 || data.mode === 2 || data.mode === 6) {
            var cmt = new ScrollComment(this, data);
        } else {
            var cmt = new CoreComment(this, data);
        }
        switch (cmt.mode) {
        case 1:
            cmt.align = 0;
            break;
        case 2:
            cmt.align = 2;
            break;
        case 4:
            cmt.align = 2;
            break;
        case 5:
            cmt.align = 0;
            break;
        case 6:
            cmt.align = 1;
            break;
        }
        cmt.init();
        this.stage.appendChild(cmt.dom);
        switch (cmt.mode) {
        default:
        case 1: {
            this.csa.scroll.add(cmt);
        }
        break;
        case 2: {
            this.csa.scrollbtm.add(cmt);
        }
        break;
        case 4: {
            this.csa.bottom.add(cmt);
        }
        break;
        case 5: {
            this.csa.top.add(cmt);
        }
        break;
        case 6: {
            this.csa.reverse.add(cmt);
        }
        break;
        case 17:
        case 7: {
            if (data.rY !== 0 || data.rZ !== 0) {
                /** TODO: revise when browser manufacturers make up their mind on Transform APIs **/
                cmt.dom.style.transform = getRotMatrix(data.rY, data.rZ);
                cmt.dom.style.webkitTransform = getRotMatrix(data.rY, data.rZ);
                cmt.dom.style.OTransform = getRotMatrix(data.rY, data.rZ);
                cmt.dom.style.MozTransform = getRotMatrix(data.rY, data.rZ);
                cmt.dom.style.MSTransform = getRotMatrix(data.rY, data.rZ);
            }
        }
        break;
        }
        cmt.y = cmt.y;
        this.dispatchEvent("enterComment", cmt);
        this.runline.push(cmt);
    };
    CommentManager.prototype.sendComment = function(data) {
        console.log("CommentManager.sendComment is deprecated. Please use send instead");
        this.send(data); // Wrapper for Backwards Compatible APIs
    };
    CommentManager.prototype.finish = function(cmt) {
        this.dispatchEvent("exitComment", cmt);
        this.stage.removeChild(cmt.dom);
        var index = this.runline.indexOf(cmt);
        if (index >= 0) {
            this.runline.splice(index, 1);
        }
        switch (cmt.mode) {
        default:
        case 1: {
            this.csa.scroll.remove(cmt);
        }
        break;
        case 2: {
            this.csa.scrollbtm.remove(cmt);
        }
        break;
        case 4: {
            this.csa.bottom.remove(cmt);
        }
        break;
        case 5: {
            this.csa.top.remove(cmt);
        }
        break;
        case 6: {
            this.csa.reverse.remove(cmt);
        }
        break;
        case 7:
            break;
        }
    };
    CommentManager.prototype.addEventListener = function(event, listener) {
        if (typeof this._listeners[event] !== "undefined") {
            this._listeners[event].push(listener);
        } else {
            this._listeners[event] = [listener];
        }
    };
    CommentManager.prototype.dispatchEvent = function(event, data) {
        if (typeof this._listeners[event] !== "undefined") {
            for (var i = 0; i < this._listeners[event].length; i++) {
                try {
                    this._listeners[event][i](data);
                } catch ( e ) {
                    console.err(e.stack);
                }
            }
        }
    };
    /** Static Functions **/
    CommentManager.prototype.onTimerEvent = function(timePassed, cmObj) {
        for (var i = 0; i < cmObj.runline.length; i++) {
            var cmt = cmObj.runline[i];
            if (cmt.hold) {
                continue;
            }
            cmt.time(timePassed);
        }
    };
    return CommentManager;
})();

/** 
 * AcFun Format Parser
 * @license MIT License
 * An alternative format comment parser
 */
function AcfunParser(jsond) {
    var list = [];
    try {
        var jsondt = JSON.parse(jsond);
    } catch ( e ) {
        console.log('Error: Could not parse json list!');
        return [];
    }
    for (var i = 0; i < jsondt.length; i++) {
        //Read each comment and generate a correct comment object
        var data = {};
        var xc = jsondt[i]['c'].split(',');
        if (xc.length > 0) {
            data.stime = parseFloat(xc[0]) * 1000;
            data.color = parseInt(xc[1])
            data.mode = parseInt(xc[2]);
            data.size = parseInt(xc[3]);
            data.hash = xc[4];
            data.date = parseInt(xc[5]);
            data.position = "absolute";
            if (data.mode != 7) {
                data.text = jsondt[i].m.replace(/(\/n|\\n|\n|\r\n|\\r)/g, "\n");
                data.text = data.text.replace(/\r/g, "\n");
                data.text = data.text.replace(/\s/g, "\u00a0");
            } else {
                data.text = jsondt[i].m;
            }
            if (data.mode == 7) {
                //High level positioned dm
                try {
                    var x = JSON.parse(data.text);
                } catch ( e ) {
                    console.log('[Err] Error parsing internal data for comment');
                    console.log('[Dbg] ' + data.text);
                    continue;
                }
                data.position = "relative";
                data.text = x.n; /*.replace(/\r/g,"\n");*/
                data.text = data.text.replace(/\ /g, "\u00a0");
                if (x.a != null) {
                    data.opacity = x.a;
                } else {
                    data.opacity = 1;
                }
                if (x.p != null) {
                    data.x = x.p.x / 1000; // relative position
                    data.y = x.p.y / 1000;
                } else {
                    data.x = 0;
                    data.y = 0;
                }
                data.shadow = x.b;
                data.dur = 4000;
                if (x.l != null)
                    data.moveDelay = x.l * 1000;
                if (x.z != null && x.z.length > 0) {
                    data.movable = true;
                    data.motion = [];
                    var moveDuration = 0;
                    var last = {
                        x: data.x,
                        y: data.y,
                        alpha: data.opacity,
                        color: data.color
                    };
                    for (var m = 0; m < x.z.length; m++) {
                        var dur = x.z[m].l != null ? (x.z[m].l * 1000) : 500;
                        moveDuration += dur;
                        var motion = {
                            x: {
                                from: last.x,
                                to: x.z[m].x / 1000,
                                dur: dur,
                                delay: 0
                            },
                            y: {
                                from: last.y,
                                to: x.z[m].y / 1000,
                                dur: dur,
                                delay: 0
                            }
                        };
                        last.x = motion.x.to;
                        last.y = motion.y.to;
                        if (x.z[m].t !== last.alpha) {
                            motion.alpha = {
                                from: last.alpha,
                                to: x.z[m].t,
                                dur: dur,
                                delay: 0
                            };
                            last.alpha = motion.alpha.to;
                        }
                        if (x.z[m].c != null && x.z[m].c !== last.color) {
                            motion.color = {
                                from: last.color,
                                to: x.z[m].c,
                                dur: dur,
                                delay: 0
                            };
                            last.color = motion.color.to;
                        }
                        data.motion.push(motion);
                    }
                    data.dur = moveDuration + (data.moveDelay ? data.moveDelay : 0);
                }
                if (x.r != null && x.k != null) {
                    data.rX = x.r;
                    data.rY = x.k;
                }

            }
            list.push(data);
        }
    }
    return list;
}

/** 
 * Bilibili Format Parser
 * @license MIT License
 * Takes in an XMLDoc/LooseXMLDoc and parses that into a Generic Comment List
 **/
function BilibiliParser(xmlDoc, text, warn) {
    function format(string) {
        // Format the comment text to be JSON Valid.
        return string.replace(/\t/, "\\t");
    }

    if (xmlDoc !== null) {
        var elems = xmlDoc.getElementsByTagName('d');
    } else {
        if (!document || !document.createElement) {
            // Maybe we are in a restricted context? Bail.
            return [];
        }
        if (warn) {
            if (!confirm("XML Parse Error. \n Allow tag soup parsing?\n[WARNING: This is unsafe.]")) {
                return [];
            }
        } else {
            // TODO: Make this safer in the future
            text = text.replace(new RegExp("</([^d])", "g"), "</disabled $1");
            text = text.replace(new RegExp("</(\S{2,})", "g"), "</disabled $1");
            text = text.replace(new RegExp("<([^d/]\W*?)", "g"), "<disabled $1");
            text = text.replace(new RegExp("<([^/ ]{2,}\W*?)", "g"), "<disabled $1");
        }
        var tmp = document.createElement("div");
        tmp.innerHTML = text;
        var elems = tmp.getElementsByTagName('d');
    }

    var tlist = [];
    for (var i = 0; i < elems.length; i++) {
        if (elems[i].getAttribute('p') != null) {
            var opt = elems[i].getAttribute('p').split(',');
            if (!elems[i].childNodes[0])
                continue;
            var text = elems[i].childNodes[0].nodeValue;
            var obj = {};
            obj.stime = Math.round(parseFloat(opt[0]) * 1000);
            obj.size = parseInt(opt[2]);
            obj.color = parseInt(opt[3]);
            obj.mode = parseInt(opt[1]);
            obj.date = parseInt(opt[4]);
            obj.pool = parseInt(opt[5]);
            obj.position = "absolute";
            if (opt[7] != null)
                obj.dbid = parseInt(opt[7]);
            obj.hash = opt[6];
            obj.border = false;
            if (obj.mode < 7) {
                obj.text = text.replace(/(\/n|\\n|\n|\r\n)/g, "\n");
            } else {
                if (obj.mode == 7) {
                    try {
                        adv = JSON.parse(format(text));
                        obj.shadow = true;
                        obj.x = parseFloat(adv[0]);
                        obj.y = parseFloat(adv[1]);
                        if (Math.floor(obj.x) < obj.x || Math.floor(obj.y) < obj.y) {
                            obj.position = "relative";
                        }
                        obj.text = adv[4].replace(/(\/n|\\n|\n|\r\n)/g, "\n");
                        obj.rZ = 0;
                        obj.rY = 0;
                        if (adv.length >= 7) {
                            obj.rZ = parseInt(adv[5], 10);
                            obj.rY = parseInt(adv[6], 10);
                        }
                        obj.motion = [];
                        obj.movable = false;
                        if (adv.length >= 11) {
                            obj.movable = true;
                            var singleStepDur = 500;
                            var motion = {
                                x: {
                                    from: obj.x,
                                    to: parseFloat(adv[7]),
                                    dur: singleStepDur,
                                    delay: 0
                                },
                                y: {
                                    from: obj.y,
                                    to: parseFloat(adv[8]),
                                    dur: singleStepDur,
                                    delay: 0
                                },
                            };
                            if (adv[9] !== '') {
                                singleStepDur = parseInt(adv[9], 10);
                                motion.x.dur = singleStepDur;
                                motion.y.dur = singleStepDur;
                            }
                            if (adv[10] !== '') {
                                motion.x.delay = parseInt(adv[10], 10);
                                motion.y.delay = parseInt(adv[10], 10);
                            }
                            if (adv.length > 11) {
                                obj.shadow = adv[11];
                                if (obj.shadow === "true") {
                                    obj.shadow = true;
                                }
                                if (obj.shadow === "false") {
                                    obj.shadow = false;
                                }
                                if (adv[12] != null) {
                                    obj.font = adv[12];
                                }
                                if (adv.length > 14) {
                                    // Support for Bilibili Advanced Paths
                                    if (obj.position === "relative") {
                                        console.log("Cannot mix relative and absolute positioning");
                                        obj.position = "absolute";
                                    }
                                    var path = adv[14];
                                    var lastPoint = {
                                        x: motion.x.from,
                                        y: motion.y.from
                                    };
                                    var pathMotion = [];
                                    var regex = new RegExp("([a-zA-Z])\\s*(\\d+)[, ](\\d+)", "g");
                                    var counts = path.split(/[a-zA-Z]/).length - 1;
                                    var m = regex.exec(path);
                                    while (m !== null) {
                                        switch (m[1]) {
                                        case "M": {
                                            lastPoint.x = parseInt(m[2], 10);
                                            lastPoint.y = parseInt(m[3], 10);
                                        }
                                        break;
                                        case "L": {
                                            pathMotion.push({
                                                "x": {
                                                    "from": lastPoint.x,
                                                    "to": parseInt(m[2], 10),
                                                    "dur": singleStepDur / counts,
                                                    "delay": 0
                                                },
                                                "y": {
                                                    "from": lastPoint.y,
                                                    "to": parseInt(m[3], 10),
                                                    "dur": singleStepDur / counts,
                                                    "delay": 0
                                                }
                                            });
                                            lastPoint.x = parseInt(m[2], 10);
                                            lastPoint.y = parseInt(m[3], 10);
                                        }
                                        break;
                                        }
                                        m = regex.exec(path);
                                    }
                                    motion = null;
                                    obj.motion = pathMotion;
                                }
                            }
                            if (motion !== null) {
                                obj.motion.push(motion);
                            }
                        }
                        obj.dur = 2500;
                        if (adv[3] < 12) {
                            obj.dur = adv[3] * 1000;
                        }
                        var tmp = adv[2].split('-');
                        if (tmp != null && tmp.length > 1) {
                            var alphaFrom = parseFloat(tmp[0]);
                            var alphaTo = parseFloat(tmp[1]);
                            obj.opacity = alphaFrom;
                            if (alphaFrom !== alphaTo) {
                                obj.alpha = {
                                    from: alphaFrom,
                                    to: alphaTo
                                }
                            }
                        }
                    } catch ( e ) {
                        console.log('[Err] Error occurred in JSON parsing');
                        console.log('[Dbg] ' + text);
                    }
                } else if (obj.mode == 8) {
                    obj.code = text; //Code comments are special
                }
            }
            if (obj.text != null)
                obj.text = obj.text.replace(/\u25a0/g, "\u2588");
            tlist.push(obj);
        }
    }
    return tlist;
}

// console.log(require("./CommentCoreLibrary.js"))
var CommentLoader = (function() {

    var Loader = function Loader(commentManager) {
        this._commentManager = commentManager;
        this._parser = function() {
            throw new Error('Format parser undefined.');
        };
        this._type = 'XML';
        this._data = null;
    };

    Loader.prototype.setParser = function(parser) {
        if (typeof parser !== 'function') {
            throw new Error('Parser expected to be a function.');
        }
        this._parser = parser;
        return this;
    };

    Loader.prototype.setType = function(type) {
        if (type === 'XML' || type === 'JSON' || type === 'RAW') {
            this._type = type;
        } else {
            throw new Error('Unrecognized type : ' + type);
        }
        return this;
    };

    Loader.prototype.download = function(method, url) {
        return new Promise((function(resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = (function() {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    if (xhr.status !== 200) {
                        reject();
                    } else {
                        if (this._type === 'XML') {
                            this._data = this._parser(xhr.responseXML);
                        } else if (this._type === 'JSON') {
                            this._data = this._parser(JSON.parse(xhr.responseText));
                        } else {
                            this._data = this._parser(xhr.responseText);
                        }
                        resolve(this._data);
                    }
                }
            }).bind(this);
            xhr.open(method, url, true);
            xhr.send();
        }).bind(this));
    };

    Loader.prototype.load = function(method, url) {
        return this.download(method, url).then((function(data) {
            this._commentManager.load(data);
        }).bind(this));
    };

    return Loader;
})();
if (!IMGplayer) return;
var _ = function(type, props, children, callback) {
    var elem = null;
    if (type === 'text') {
        return document.createTextNode(props);
    } else {
        elem = document.createElement(type);
    }
    for (var n in props) {
        if (n !== 'style' && n !== 'className') {
            elem.setAttribute(n, props[n]);
        } else if (n === 'className') {
            elem.className = props[n];
        } else {
            for (var x in props.style) {
                elem.style[x] = props.style[x];
            }
        }
    }
    if (children) {
        for (var i = 0; i < children.length; i++) {
            if (children[i] != null)
                elem.appendChild(children[i]);
        }
    }
    if (callback && typeof callback === 'function') {
        callback(elem);
    }
    return elem;
};
var addClass = function(elem, className) {
    if (elem == null) return;
    var oldClass = elem.className.split(' ');
    if (oldClass.indexOf(className) < 0) {
        oldClass.push(className);
    }
    elem.className = oldClass.join(' ');
};
var hasClass = function(elem, className) {
    if (elem == null) return false;
    var oldClass = elem.className.split(' ');
    return oldClass.indexOf(className) >= 0;
}
var removeClass = function(elem, className) {
    if (elem == null) return;
    var oldClass = elem.className.split(' ');
    if (oldClass.indexOf(className) >= 0) {
        oldClass.splice(oldClass.indexOf(className), 1);
    }
    elem.className = oldClass.join(' ');
};
var buildFromDefaults = function(n, d) {
    var r = {};
    for (var i in d) {
        if (n && typeof n[i] !== 'undefined')
            r[i] = n[i];
        else
            r[i] = d[i];
    }
    return r;
}
var transTime = function(time) {
    var durationtime = time;
    var second = 1;
    var minute = 60 * second;
    var hours = 60 * minute;
    var echohours = parseInt(durationtime / hours);
    if (echohours >= 1) {
        durationtime -= echohours * hours;
    }
    var echominute = parseInt(durationtime / minute);
    if (echominute >= 1) {
        durationtime -= echominute * minute;
    }
    var echosecond = parseInt(durationtime / second);
    return echohours + ':' + echominute + ':' + echosecond;
}

function launchFullscreen(element) {
    if (element.requestFullscreen) {
        element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
    }
}

function exitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    }
}
IMGplayer = {
    audio: '',
    CM: '',
    Player: document.getElementById('IMGplayer'),
    container: document.getElementById('IMGplayerContainer'),
    imgsContainer: document.getElementById('imgsContainer'),
    state: buildFromDefaults({}, {
        fullscreen: false,
        commentVisible: true,
        allowRescale: false,
        playing: false,
        dragging: false,
    }),
    playerControl: '',
    barTime: '',
    timeline: '',
    cmplayBtn: '',
    imgsSource: '',
    init: function(imgsSource, audioSource, danmakuSource, callback) {
        var danmakulist = (danmakuSource) ? danmakuSource : '';
        try {
            IMGplayer.initImgs(imgsSource, danmakulist, function() {
                IMGplayer.initAudio(audioSource, callback)
                IMGplayer.initDm(IMGplayer.CM, danmakuSource)
                IMGplayer.bindControl()
            });
        } catch ( e ) {
            console.error(e)
        }
        IMGplayer.imgsSource = imgsSource;
    // console.log(IMGplayer.Player)
    // console.log(IMGplayer.Player.innerHTML)
    },
    uninstall: function() {},
    initAudio: function(audioSource, callback) {
        var audio = document.getElementById('IMGplayerAudio')
        var audioSrc = document.getElementById('IMGplayerAudioSrc')
        audioSrc.src = audioSource;
        audio.preload = 'auto';
        audio.autobuffer = 'true';
        audio.load()
        try {
            // IMGplayer.Player.appendChild(audio)
            IMGplayer.bindAudio(audio, callback)
            IMGplayer.audio = audio
        } catch ( e ) {
            alert(e)
        }
    },
    bindAudio: function(audio, callback) {
        try {
            var abptime;
            abptime = document.getElementsByClassName('ABP-Playtime')[0];
            var pbars = document.getElementsByClassName('bar dark');
            IMGplayer.barTime = pbars[0];
            audio.addEventListener('ended', function(argument) {
                IMGplayer.restoreImgs(IMGplayer.imgsSource.length - 1);
                removeClass(IMGplayer.playerControl, 'hide');
                IMGplayer.state.playing = false;
                IMGplayer.barTime.style.width = '0%';
                IMGplayer.cmplayBtn.className = 'button ABP-Play'
                IMGplayer.CM.clear();
                IMGplayer.CM.time(0);
            })
            audio.addEventListener('pause', function(argument) {
                removeClass(IMGplayer.playerControl, 'hide');
                IMGplayer.state.playing = false;
            })
            audio.addEventListener('play', function(argument) {
                IMGplayer.state.playing = true;
            })
        } catch ( e ) {
            alert(e)
        }
        var barloaded = document.getElementsByClassName('barloaded')[0]
        audio.addEventListener('progress', function() {
            if (this.buffered != null) {
                try {
                    var s = this.buffered.start(0);
                    var e = this.buffered.end(0);
                } catch ( err ) {
                    return;
                }
                var dur = this.duration;
                var perc = (e / dur) * 100;
                barloaded.style.width = perc + '%';
            }
        });
        audio.addEventListener('loadedmetadata', function() {
            try {
                if (this.buffered != null) {
                    try {
                        var s = this.buffered.start(0);
                        var e = this.buffered.end(0);
                    } catch ( err ) {
                        return;
                    }
                    var dur = this.duration;
                    var perc = (e / dur) * 100;
                    barloaded.style.width = perc + '%';
                }
            } catch ( e ) {
                alert(e)
            }
        });
        audio.addEventListener('timeupdate', function(argument) {
            var currentTime = audio.currentTime;
            var duration = audio.duration;
            try {
                IMGplayer.updateImg(currentTime, IMGplayer.imgsSource)
            } catch ( e ) {
                audio.pause()
                console.info(e)
                return
            }
            if (IMGplayer.CM.display !== false) {
                IMGplayer.CM.time(currentTime * 1000);
            }
            abptime.innerHTML = '<span>' + transTime(currentTime) + '</span><span class="total">/' + transTime(duration) + '</span>';
            if (!IMGplayer.state.dragging) {
                IMGplayer.barTime.style.width = ((currentTime / duration) * 100) + '%';
            }
        })
        audio.addEventListener('canplay', function() {
            abptime.innerHTML = '<span>' + transTime(audio.currentTime) + '</span><span class="total">/' + transTime(audio.duration) + '</span>';
            callback();
        });
    },
    bindControl: function(argument) {
        // 弹幕开关
        var cmbtn = document.getElementsByClassName('ABP-CommentShow');
        if (cmbtn.length > 0) {
            var btnDm = cmbtn[0];
            btnDm.addEventListener('click', function(argument) {
                if (IMGplayer.CM.display == false) {
                    IMGplayer.CM.display = true;
                    IMGplayer.CM.start();
                    this.className = 'button ABP-CommentShow';
                } else {
                    IMGplayer.CM.display = false;
                    IMGplayer.CM.clear();
                    IMGplayer.CM.stop();
                    this.className = 'button ABP-CommentShow ABP-noDM';
                }
            })
        }
        // 控制台显示状态
        var tempControl = document.getElementsByClassName('ABP-Control');
        if (tempControl.length > 0) {
            var playerControl = tempControl[0];
            IMGplayer.playerControl = playerControl;
        }
        // 播放按钮
        var playbtn = document.getElementsByClassName('ABP-Play');
        if (playbtn.length > 0) {
            var cmplayBtn = playbtn[0]
            IMGplayer.cmplayBtn = cmplayBtn
            cmplayBtn.addEventListener('click', function(argument) {
                if (IMGplayer.audio.paused) {
                    try {
                        IMGplayer.audio.play();
                    } catch ( e ) {}
                    this.className = 'button ABP-Play ABP-Pause';
                } else {
                    IMGplayer.audio.pause();
                    this.className = 'button ABP-Play';
                }
            })
        }
        // 自动隐藏控制台
        var timer;
        document.getElementById('IMGplayer').addEventListener('click', function(argument) {
            clearTimeout(timer)
            timer = setTimeout(function(argument) {
                if (IMGplayer.state.playing) {
                    addClass(IMGplayer.playerControl, 'hide');
                }
            }, 3000)
            if (hasClass(argument.target, 'ABP-Play') || hasClass(argument.target, 'ccl-progress-bar') || hasClass(argument.target, 'ABP-Playtime') || hasClass(argument.target, 'ABP-FullScreen') || hasClass(argument.target, 'ABP-CommentShow')) {
                return
            }
            if (hasClass(IMGplayer.playerControl, 'hide')) {
                removeClass(IMGplayer.playerControl, 'hide');
            } else {
                addClass(IMGplayer.playerControl, 'hide');
            }
        })
        // 全屏按键
        var btnFull = document.getElementsByClassName('ABP-FullScreen');
        if (btnFull.length > 0) {
            var cmbtnFull = btnFull[0]
            cmbtnFull.addEventListener('click', function() {
                IMGplayer.state.fullscreen = hasClass(IMGplayer.Player, 'ABP-FullScreen');
                if (!IMGplayer.state.fullscreen) {
                    launchFullscreen(IMGplayer.Player);
                    addClass(IMGplayer.Player, 'ABP-FullScreen');
                } else {
                    removeClass(IMGplayer.Player, 'ABP-FullScreen');
                    exitFullscreen();
                }
                IMGplayer.state.fullscreen = !IMGplayer.state.fullscreen;
                if (IMGplayer.CM)
                    IMGplayer.CM.setBounds();
                if (!IMGplayer.state.allowRescale) return;
                if (IMGplayer.state.fullscreen) {
                    if (IMGplayer.defaults.w > 0) {
                        IMGplayer.CM.def.scrollScale = IMGplayer.Player.offsetWidth / IMGplayer.defaults.w;
                    }
                } else {
                    IMGplayer.CM.def.scrollScale = 1;
                }
            });
        }
        // 控制播放进度
        var templine = document.getElementsByClassName('ccl-progress-bar')
        if (templine.length > 0) {
            IMGplayer.timeline = templine[0];
            IMGplayer.timeline.addEventListener('mousedown', function(e) {
                IMGplayer.state.dragging = true;
            });
            document.addEventListener('mouseup', function(e) {
                IMGplayer.state.dragging = false;
            });
            IMGplayer.timeline.addEventListener('mouseup', function(e) {
                IMGplayer.state.dragging = false;
                var newTime = ((e.layerX) / this.offsetWidth) * IMGplayer.audio.duration;
                if (Math.abs(newTime - IMGplayer.audio.currentTime) > 4) {
                    if (IMGplayer.CM)
                        IMGplayer.CM.clear();
                }
                IMGplayer.CM.clear();
                IMGplayer.audio.currentTime = newTime;
            });
            IMGplayer.timeline.addEventListener('mousemove', function(e) {
                if (IMGplayer.state.dragging) {
                    IMGplayer.barTime.style.width = ((e.layerX) * 100 / this.offsetWidth) + '%';
                }
            });



            var temppercent
            IMGplayer.timeline.addEventListener('touchmove', function(e) {
                IMGplayer.state.dragging = true;
                var tempx = e.touches[0].clientX - this.offsetLeft
                temppercent = ((tempx) * 100 / this.offsetWidth)
                if (temppercent > 100)
                    temppercent = 100
                if (temppercent < 0)
                    temppercent = 0;
                IMGplayer.barTime.style.width = temppercent + '%';
                event.preventDefault();
            });
            var _touch = null;
            IMGplayer.timeline.addEventListener('touchstart', function(e) {
                if (e.targetTouches.length > 0) {
                    //Determine whether we want to start or stop
                    _touch = e.targetTouches[0];
                }
            });
            IMGplayer.timeline.addEventListener('touchend', function(e) {
                if (IMGplayer.state.dragging) {
                    var newTime = temppercent / 100 * IMGplayer.audio.duration;
                    if (newTime > IMGplayer.audio.duration) {
                        newTime = IMGplayer.audio.duration
                    }
                    if (newTime < 0) {
                        newTime = 0
                    }
                    IMGplayer.CM.clear();
                    IMGplayer.audio.currentTime = newTime;
                }
                IMGplayer.state.dragging = false;
                IMGplayer.CM.clear();
                if (e.changedTouches.length > 0) {
                    if (_touch != null) {
                        var diffx = e.changedTouches[0].pageX - _touch.pageX;
                        var diffy = e.changedTouches[0].pageY - _touch.pageY;
                        if (Math.abs(diffx) < 20 && Math.abs(diffy) < 20) {
                            _touch = null;
                            return;
                        }
                        if (Math.abs(diffx) > 3 * Math.abs(diffy)) {
                            if (diffx > 0) {
                                return
                                if (IMGplayer.audio.paused) {
                                    IMGplayer.btnPlay.click();
                                }
                            } else {
                                return
                                if (!IMGplayer.audio.paused) {
                                    IMGplayer.btnPlay.click();
                                }
                            }
                        } else if (Math.abs(diffy) > 3 * Math.abs(diffx)) {

                        }
                        _touch = null;
                    }
                }
            });
        }
        removeClass(IMGplayer.playerControl, 'hide')
    },
    initImgs: function(imgsSource, danmakuSource, callback) {
        var html = '';
        var images = [];
        for (var i = 0; i < imgsSource.length; i++) {
            images.push('' + imgsSource[i].url + '');
            html += '<div class="frame" id="IMGplayerImgid' + i + '" style="background-image:url(' + imgsSource[i].url + ')"></div>';
        }
        document.getElementById('imgsContainer').innerHTML = html
        // IMGplayer.imgsContainer.innerHTML = html
        document.getElementById('IMGplayer').appendChild(_('div', {
            'className': 'ABP-Control hide'
        }, [
            _('div', {
                'className': 'ABP-Playtime'
            }),
            _('div', {
                'className': 'ABP-Play'
            }),
            _('div', {
                'className': 'ccl-progress-bar'
            }, [
                _('div', {
                    'className': 'bar dark'
                }),
                _('div', {
                    'className': 'bar barloaded'
                })
            ]),
            _('div', {
                'className': 'button ABP-CommentShow'
            }),
            _('div', {
                'className': 'button ABP-FullScreen'
            })
        ]));
        // 初始化时间
        // console.log(document)
        // console.log(document.getElementsByClassName('ABP-Playtime')[0])
        var abptime = document.getElementsByClassName('ABP-Playtime')[0];
        abptime.innerHTML = '<span>0:0:0</span><span class="total">/0:0:0</span>';
        IMGplayer.checkImgsValid(images, function(argument) {
            callback();
        })
    },
    initDm: function(CM, danmakuSource) {
        CM = new CommentManager(IMGplayer.container);
        CM.init(); // 初始化
        // 载入弹幕列表
        var loader = (new CommentLoader(CM)).setParser(BilibiliParser);
        loader.load('GET', danmakuSource);
        // 启动播放弹幕（在未启动状态下弹幕不会移动）
        CM.start();
        // 停止播放（停止弹幕移动）
        // CM.stop();
        IMGplayer.CM = CM;
    },
    restoreImgs: function(final) {
        document.getElementsByClassName('frame')[final].style.display = 'none';
        document.getElementById('IMGplayerImgid0').style.display = 'block';
    },
    checkImgsValid: function(imgUrls, callback) {
        // 加载图片数组，加载完成执行回调
        var templen = 0;
        var len = imgUrls.length;
        for (var i = 0; i < len; i++) {
            (function loadimg(url) {
                var img = new Image();
                img.src = url;
                img.onload = function() {
                    if (this.complete) {
                        templen++;
                        if (templen >= len) {
                            callback();
                        }
                    }
                }
            })(imgUrls[i])
        }
    },
    updateImg: function(currentTime, imgsSource) {
        // 假设所有图片都已经加载完
        var tempshow = 0;
        var hasperfet = false;
        try {
            for (var i = 0; i < imgsSource.length; i++) {
                document.getElementById('IMGplayerImgid' + i + '').style.display = 'none';
                if (!hasperfet) {
                    if (imgsSource[i].timer >= currentTime) {
                        try {
                            if (i >= 1 && imgsSource[i - 1].timer < currentTime) {
                                tempshow = i - 1;
                                hasperfet = true;
                            } else {
                                tempshow = i;
                                hasperfet = true;
                            }
                        } catch ( e ) {
                            console.log(e);
                        }
                    } else {
                        hasperfet = false;
                        tempshow = imgsSource.length - 1;
                    }
                }
            }
            document.querySelector('#IMGplayerImgid' + tempshow + '').style.display = 'block';
        } catch ( e ) {
            console.info(e)
        }
    },
}
})()
export default IMGplayer;