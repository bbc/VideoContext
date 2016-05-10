//Matthew Shotton, R&D User Experience,© BBC 2015
import EffectNode from "./effectnode";

export default class TransitionNode extends EffectNode{
    /**
    * Initialise an instance of a TransitionNode. You should not instantiate this directly, but use VideoContest.createTransitonNode().
    */
    constructor(gl, renderGraph, definition){
        super(gl, renderGraph, definition);
        this._transitions = {};
        
        //save a version of the original property values
        this._initialPropertyValues = {};
        for (let propertyName in this._properties){
            this._initialPropertyValues[propertyName] = this._properties[propertyName].value;
        }
    }

    _doesTransitionFitOnTimeline(testTransition){
        if (this._transitions[testTransition.property] === undefined) return true;
        for (let transition of this._transitions[testTransition.property]) {
            if (testTransition.start > transition.start && testTransition.start < transition.end)return false;
            if (testTransition.end > transition.start && testTransition.end < transition.end)return false;
            if(transition.start > testTransition.start && transition.start <  testTransition.end) return false;
            if(transition.end > testTransition.start && transition.end <  testTransition.end) return false;
        }
        return true;
    }

    _insertTransitionInTimeline(transition){
        if (this._transitions[transition.property] === undefined) this._transitions[transition.property] = [];
        this._transitions[transition.property].push(transition);

        this._transitions[transition.property].sort(function(a,b){
            return a.start - b.start;
        });
    }

    /**
    * Create a transition on the timeline.
    * 
    * @param {number} startTime - The time at which the transition should start (relative to currentTime of video context).
    * @param {number} endTime - The time at which the transition should be completed by (relative to currentTime of video context).
    * @param {number} targetValue - The value to transition to by endTime.
    * @param {String} propertyName - The name of the property to clear transitions on, if undefined clear all transitions on the node.
    */
    transition(startTime, endTime, targetValue, propertyName="mix"){
        let transition = {start:startTime + this._currentTime, end:endTime + this._currentTime, target:targetValue, property:propertyName};
        if (!this._doesTransitionFitOnTimeline(transition))return false;
        this._insertTransitionInTimeline(transition);
    }

    /**
    * Clear all transistions on the passed property. If no property is defined clear all transitions on the node.
    * 
    * @param {String} propertyName - The name of the property to clear transitions on, if undefined clear all transitions on the node.
    */
    clearTransitions(propertyName){
        if (propertyName === undefined){
            this._transitions = {};
        }else{
            this._transitions[propertyName] = [];
        }
    }
    
    _update(currentTime){
        super._update(currentTime);
        for (let propertyName in this._transitions){
            let value = this._initialPropertyValues[propertyName];
            let transitionActive = false;

            for (var i = 0; i < this._transitions[propertyName].length; i++) {
                let transition = this._transitions[propertyName][i];
                if (currentTime > transition.end){
                    value = transition.target;
                    continue;
                }

                if (currentTime > transition.start && currentTime < transition.end){
                    let difference = transition.target - value;
                    let progress = (this._currentTime - transition.start)/(transition.end - transition.start);
                    transitionActive = true;
                    this[propertyName] = value + (difference * progress);
                    break;
                }
            }

            if(!transitionActive)this[propertyName] = value;
        }
    }
}
