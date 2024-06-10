import { randomCirclePoint } from 'random-location'
import { isInCircle } from './map_utils.js';
import { map } from './util.js';
import { playersBroadcast } from './team_socket.js';
import { secureAdminBroadcast } from './admin_socket.js';

export default {
    //Setings storing where the zone will start, end and how it should evolve
    //The zone will start by staying at its mzx value for reductionInterval minutes
    //and then reduce during reductionDuration minutes, then wait again...
    //The reduction factor is such that after reductionCount the zone will be the min zone
    //a call to onZoneUpdate will be made every updateIntervalSeconds when the zone is changing
    //a call to onNextZoneUpdate will be made when the zone reduction ends and a new next zone is announced
    zoneSettings: {
        min: { center: null, radius: null },
        max: { center: null, radius: null },
        reductionCount: 2,
        reductionDuration: 1,
        reductionInterval: 1,
        updateIntervalSeconds: 1,
    },

    nextZoneDecrement: null,
    //Live location of the zone
    currentZone: { center: null, radius: null },

    //If the zone is shrinking, this is the target of the current shrinking
    //If the zone is not shrinking, this will be the target of the next shrinking
    nextZone: { center: null, radius: null },

    //Zone at the begining of the shrinking
    currentStartZone: { center: null, radius: null },

    startDate: null,
    started: false,
    updateIntervalId: null,
    nextZoneTimeoutId: null,

    /**
     * Test if a given configuration object is valid, i.e if all needed values are well defined
     * @param {Object} settings Settings object describing a config of a zone manager
     * @returns if the config is correct
     */
    validateSettings(settings) {
        if (settings.reductionCount && (typeof settings.reductionCount != "number" || settings.reductionCount <= 0)) { return false }
        if (settings.reductionDuration && (typeof settings.reductionDuration != "number" || settings.reductionDuration < 0)) { return false }
        if (settings.reductionInterval && (typeof settings.reductionInterval != "number" || settings.reductionInterval < 0)) { return false }
        if (settings.updateIntervalSeconds && (typeof settings.updateIntervalSeconds != "number" || settings.updateIntervalSeconds <= 0)) { return false }
        if (settings.max && (typeof settings.max.radius != "number" || typeof settings.max.center.lat != "number" || typeof settings.max.center.lng != "number")) { return false }
        if (settings.min && (typeof settings.min.radius != "number" || typeof settings.min.center.lat != "number" || typeof settings.min.center.lng != "number")) { return false }
        return true;
    },
    /**
     *  Test if the zone manager is ready to start 
     * @returns true if the zone manager is ready to be started, false otherwise
     */
    ready() {
        return this.validateSettings(this.zoneSettings);
    },

    /**
     * Update the settings of the zone, this can be done by passing an object containing the settings to change.
     * Unless specified, the durations are in minutes
     * Default config :
     * `this.zoneSettings = {
     *      min: {center: null, radius: null},
     *      max: {center: null, radius: null},
     *      reductionCount: 2,
     *      reductionDuration: 10,
     *      reductionInterval: 10,
     *      updateIntervalSeconds: 10,
     *  }`
     * @param {Object} newSettings The fields of the settings to udpate
     * @returns 
     */
    udpateSettings(newSettings) {
        //validate settings
        this.zoneSettings = { ...this.zoneSettings, ...newSettings };
        this.nextZoneDecrement = (this.zoneSettings.max.radius - this.zoneSettings.min.radius) / this.zoneSettings.reductionCount;
        return true;
    },

    /**
     * Reinitialize the object and stop all the tasks
     */
    reset() {
        this.currentZoneCount = 0;
        this.started = false;
        if (this.updateIntervalId != null) {
            clearInterval(this.updateIntervalId);
            this.updateIntervalId = null;
        }
        if (this.nextZoneTimeoutId != null) {
            clearTimeout(this.nextZoneTimeoutId);
            this.nextZoneTimeoutId = null;
        }
    },

    /**
     * Start the zone reduction sequence
    */
    start() {
        this.started = true;
        this.startDate = new Date();
        //initialize the zone to its max value
        this.nextZone = JSON.parse(JSON.stringify(this.zoneSettings.max));
        this.currentStartZone = JSON.parse(JSON.stringify(this.zoneSettings.max));
        this.currentZone = JSON.parse(JSON.stringify(this.zoneSettings.max));
        return this.setNextZone();

    },

    /**
     * Get the center of the next zone, this center need to satisfy two properties
     * - it needs to be included in the current zone, this means that this new point should lie in the circle of center currentZone.center and radius currentZone.radius - newRadius
     * - it needs to include the last zone, which means that the center must lie in the center of center min.center and of radius newRadius - min.radius 
     * @param newRadius the radius that the new zone will have
     * @returns the coordinates of the new center as an object with lat and long fields
     */
    getRandomNextCenter(newRadius) {
        let ok = false;
        let res = null
        let tries = 0;
        const MAX_TRIES = 100000
        //take a random point satisfying both conditions
        while (tries++ < MAX_TRIES && !ok) {
            res = randomCirclePoint({ latitude: this.currentZone.center.lat, longitude: this.currentZone.center.lng }, this.currentZone.radius - newRadius);
            ok = (isInCircle({ lat: res.latitude, lng: res.longitude }, this.zoneSettings.min.center, newRadius - this.zoneSettings.min.radius))
        }
        if (tries >= MAX_TRIES) {
            return false;
        }
        return {
            lat: res.latitude,
            lng: res.longitude
        }
    },

    /**
     * Compute the next zone satifying the given settings, update the nextZone and currentStartZone
     * Wait for the appropriate duration before starting a new zone reduction if needed
     */
    setNextZone() {
        //At this point, nextZone == currentZone, we need to update the next zone, the raidus decrement, and start a timer before the next shrink
        //last zone
        if (this.currentZoneCount == this.zoneSettings.reductionCount) {
            this.nextZone = JSON.parse(JSON.stringify(this.zoneSettings.min))
            this.currentStartZone = JSON.parse(JSON.stringify(this.zoneSettings.min))
        } else if (this.currentZoneCount == this.zoneSettings.reductionCount - 1) {
            this.currentStartZone = JSON.parse(JSON.stringify(this.currentZone))
            this.nextZone = JSON.parse(JSON.stringify(this.zoneSettings.min))
            this.nextZoneTimeoutId = setTimeout(() => this.startShrinking(), 1000 * 60 * this.zoneSettings.reductionInterval)
            this.currentZoneCount++;
        } else if (this.currentZoneCount < this.zoneSettings.reductionCount) {
            this.nextZone.center = this.getRandomNextCenter(this.nextZone.radius - this.nextZoneDecrement)
            //Next center cannot be found
            if (this.nextZone.center === false) {
                console.log("no center")
                return false;
            }
            this.nextZone.radius -= this.nextZoneDecrement;
            this.currentStartZone = JSON.parse(JSON.stringify(this.currentZone))
            this.nextZoneTimeoutId = setTimeout(() => this.startShrinking(), 1000 * 60 * this.zoneSettings.reductionInterval)
            this.currentZoneCount++;
        }
        this.onZoneUpdate(JSON.parse(JSON.stringify(this.currentStartZone)))
        this.onNextZoneUpdate({
            begin: JSON.parse(JSON.stringify(this.currentStartZone)),
            end: JSON.parse(JSON.stringify(this.nextZone))
        })
        return true;
    },

    /*
     * Start a task that will run periodically updatinng the zone size, and calling the onZoneUpdate callback
     * This will also periodically check if the reduction is over or not
     * If the reduction is over this function will call setNextZone
     */
    startShrinking() {
        const startTime = new Date();
        this.updateIntervalId = setInterval(() => {
            const completed = ((new Date() - startTime) / (1000 * 60)) / this.zoneSettings.reductionDuration;
            this.currentZone.radius = map(completed, 0, 1, this.currentStartZone.radius, this.nextZone.radius)
            this.currentZone.center.lat = map(completed, 0, 1, this.currentStartZone.center.lat, this.nextZone.center.lat)
            this.currentZone.center.lng = map(completed, 0, 1, this.currentStartZone.center.lng, this.nextZone.center.lng)
            this.onZoneUpdate(JSON.parse(JSON.stringify(this.currentZone)))
            //Zone shrinking is over
            if (completed >= 1) {
                clearInterval(this.updateIntervalId);
                this.updateIntervalId = null;
                this.setNextZone();
                return;
            }
        }, this.zoneSettings.updateIntervalSeconds * 1000);
    },

    onNextZoneUpdate(newZone) {
        playersBroadcast("new_zone", newZone)
        secureAdminBroadcast("new_zone", newZone)
    },

    onZoneUpdate(zone) {
        playersBroadcast("zone", zone)
        secureAdminBroadcast("zone", zone)
    },

}