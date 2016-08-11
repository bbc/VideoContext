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
    * @param {number} currentValue - The value to start the transition at.
    * @param {number} targetValue - The value to transition to by endTime.
    * @param {String} propertyName - The name of the property to clear transitions on, if undefined default to "mix".
    */
    transition(startTime, endTime, currentValue, targetValue, propertyName="mix"){
        let transition = {start:startTime + this._currentTime, end:endTime + this._currentTime, current:currentValue, target:targetValue, property:propertyName};
        if (!this._doesTransitionFitOnTimeline(transition))return false;
        this._insertTransitionInTimeline(transition);
        return true;
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
    
    /**
    * Clear a transistion on the passed property that the specified time lies within.
    * 
    * @param {String} propertyName - The name of the property to clear a transition on.
    * @param {number} time - A time which lies within the property you're trying to clear.
    */
    clearTransition(propertyName, time){
        let transitionIndex = undefined;
        for (var i = 0; i < this._transitions[propertyName].length; i++) {
            let transition = this._transitions[propertyName][i];
            if (time > transition.start && time < transition.end){
                transitionIndex = i;
            }
        }
        if(transitionIndex !== undefined){
            this._transitions[propertyName].splice(transitionIndex, 1);
            return true;
        }
        return false;
    }

    _update(currentTime){
        super._update(currentTime);
        for (let propertyName in this._transitions){
            let value = this[propertyName];
            if (this._transitions[propertyName].length > 0){
                value = this._transitions[propertyName][0].current;
            }
            let transitionActive = false;

            for (var i = 0; i < this._transitions[propertyName].length; i++) {
                let transition = this._transitions[propertyName][i];
                if (currentTime > transition.end){
                    value = transition.target;
                    continue;
                }

                if (currentTime > transition.start && currentTime < transition.end){
                    let difference = transition.target - transition.current;
                    let progress = (this._currentTime - transition.start)/(transition.end - transition.start);
                    transitionActive = true;
                    this[propertyName] = transition.current + (difference * progress);
                    break;
                }
            }

            if(!transitionActive)this[propertyName] = value;
        }
    }
}
