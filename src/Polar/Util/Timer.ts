

export class Timer {

	// Delay the timer will wait before returning true.
	private delay: number;
	// Boolean to hold if the timer repeats/loops or not.
	private repeat: boolean;
	// Current elapsed time in seconds, reset on every completion.
	private elapsed: number = 0;
	// Boolean to hold if the timer has completed its cycle, for non-repeat timers.
	private completed: boolean = false;
	// Boolean to hold the value that will be returned when a non-repeat timer has completed.
	private completionValue: boolean;

	/**
	 * Create a new timer.
	 * @param {number} delay How long the timer takes to complete in seconds.
	 * @param {boolean} completionValue The value the timer update will return once the timer is completed.
	 * @param {boolean} repeat Whether the timer will reset and repeat on completion.
	 */
	public constructor(delay: number = 1, completionValue: boolean = false, repeat: boolean = false) {
		this.delay = delay;
		this.completionValue = completionValue;
		this.repeat = repeat;
	}

	/**
	 * Update the timer and check to see if it is completed.
	 * @param {number} deltaTime The time elapsed since the previous frame.
	 * @returns {boolean} Whether the timer is activated.
	 */
	public update(deltaTime: number): boolean {
		if (this.completed)
			return this.completionValue;
		
		this.elapsed += deltaTime;

		if (this.elapsed >= this.delay) {
			if (!this.repeat)
				this.completed = true;
			
			this.elapsed = 0;
			return true;
		}
		return false;
	}

	/**
	 * Get the delay of the camera in seconds.
	 * @returns {number} The delay of the camera in seconds.
	 */
	public getDelay(): number {
		return this.delay;
	}

	/**
	 * Get the elapsed time in seconds.
	 * @returns {number} The elapsed time in seconds.
	 */
	public getElapsed(): number {
		return this.elapsed;
	}

	/**
	 * Get the completion percentage of the timer between 0 and 1.
	 * @returns {number} Completion percentage.
	 */
	public getPercentage(): number {
		return this.elapsed / this.delay;
	}

	/**
	 * Set the time it will take until the timer finishes / resets.
	 * @param delay The delay time in seconds.
	 */
	public setDelay(delay: number) {
		this.delay = delay;
	}
}