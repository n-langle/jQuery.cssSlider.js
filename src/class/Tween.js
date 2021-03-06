import MainLoopEntry from './MainLoopEntry';
import assign from '../function/assign';
import noop from '../function/noop';
import easings from '../object/easings';


function Tween(options) {
	var settings = assign({}, Tween.defaults, options);

	this._range = 1;
	this._executed = 0;
	this._direction = settings.reverse ? 1 : 0;

	MainLoopEntry.call(this, settings);
}

Tween.defaults = {
	duration: 1000,
	easing: 'linear',
	loop: 0,
	reverse: false
};

assign(Tween.prototype, 
	MainLoopEntry.prototype, {

	start: function(delay) {
		
		if (this.reverse) {
			this._range = compute[this._direction](this._executed);
			this._direction = (this._direction + 1) % 2;
		}

		return MainLoopEntry.prototype.start.call(this, delay, 1 - this._range);
	},

	update: function(timestamp, tick) {
		var result = (easings[this.easing]((timestamp - this._startTime) / (this.duration * this._range)) * this._range) + 1 - this._range,
			percent = compute[this._direction](result);

		this._executed = percent;

		this.onUpdate(timestamp, tick, percent);
		return this;
	},

	complete: function(timestamp, tick) {
		var lastValue = (this._direction + 1) % 2;

		this.onUpdate(timestamp, tick, lastValue);
		this.onComplete(timestamp, tick, lastValue);

		if (this.loop > 0) {
			this.loop--;
			this.start();
		}

		return this;
	},

	needsUpdate: function(timestamp) {
		return timestamp - this._startTime < this.duration * this._range;
	}
});

var compute = [
	// forward
	function(value) {
		return value;
	},
	// backward
	function(value) {
		return 1 - value;
	}
];

export default Tween;