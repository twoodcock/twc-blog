/*
 * MockFetch.js
 *
 * This file contains a replacement for the API's fetch routine.
 * 
 * Using this allows the application to interact with the API code during
 * testing without interacting with the remote implementation.
 *
 * We could do this with static files, however, we would not be able to
 * simulate failure cases as easily, and some effort might have to be put in
 * to stop these static files from being put into the production release.
 * (That said, tests should run on the production server, so no harm in
 * putting the files there.)
 *
 * The API's fetch implementation is something I port around between
 * aplications. Having this automation is zero effort.
 *
 * *** USAGE ***
 *
 * We export the responses structure so you can specify the responses your
 * test needs.
 * 
 */
import Route from 'route-parser';
import { setFetchFunction } from '../BlogAPI/Fetch';

var responses = {};

function _mkNode(obj, node, content) {
    if (!(node in obj)) {
        obj[node] = content
    }
}
function _getNode(obj, node) {
    if (node in obj) {
        return obj[node];
    }
    return undefined;
}

/* addResponse(location, responseObject)
 * 
 * Add the response you want to set for this location.
 *
 * Location templates that are supported:
 *
 * /r/
 * /r/index
 * /r/index/p/:pageNumber
 * /r/category/:slug
 * /r/category/:slug/p/:pageNumber
 * /r/tag/:slug
 * /r/tag/:slug/p/:pageNumber
 * /r/page/:slug
 * /r/post/:year/:month/:slug
 */
export function addResponse(location, response) {
    const matched = parseRoute(location);
    _mkNode(responses, matched.name, {})
    if (matched.name === 'post') {
        _mkNode(responses[matched.name], matched.year, {})
        _mkNode(responses[matched.name][matched.year], matched.month, {})
        responses[matched.name][matched.year][matched.month][matched.slug] = response;
    } else {
        responses[matched.name][matched.slug] = response;
    }
}

/* getResponse(location)
 *
 * Return the current response for the given location.
 */
export function getResponse(location) {
    const matched = parseRoute(location);
    try {
        var responseObj;
        if (matched.name === 'post') {
            responseObj = responses[matched.name][matched.year][matched.month][matched.slug];
        } else {
            responseObj = responses[matched.name][matched.slug];
        }
        if (!responseObj) {
            return undefined;
        }
        // Don't allow the calller to interact with the stored response.
        // Use JSON to copy it (deeply).
        return JSON.parse(JSON.stringify(responseObj));
    } catch (error) {
        if (error instanceof TypeError && error.message.match(/undefined/)) {
            // in this case, we want ot return an undefined response.
            return undefined;
        }
        // When we don't recognize the failure, we re-throw it.
        console.log("getResponse got an exception it did not know how to handle!", location, error)
        throw error;
    }
}

/* mockSuccessResponse
 *
 * Class used to provide a successful response.
 *
 * Pass an object on instantiation.
 *
 * r.json() must return a promise resolving to that object.
 * r.text() must return a promise resolving to that object in JSON stringified form.
 * r.ok() must return true.
 */
class mockSuccessResponse {
    constructor(props) {
        this.response = props.response?props.response:{};
    }
    text() {
        return new Promise((resolve, reject)=>{
            return resolve(JSON.stringify(this.response));
        });
    }
    json() {
        return new Promise((resolve, reject)=>{
            return resolve(this.response);
        });
    }
    ok() {
        return true;
    }
}

/* mockFailureResponse
 *
 * Class used to provide a failure response.
 *
 * Pass an error string on instantiation.
 *
 * r.json() must not be a method.
 * r.text() must return a promise resolving to the error string.
 * r.ok() must return false.
 */
class mockFailureResponse {
    constructor(location) {
        this.location = location;
    }
    text() {
        return new Promise((resolve, reject)=>{
            return resolve("failed to get data from location: "+this.location);
        });
    }
    ok() {
        return false;
    }
}

/* parseRoute(location)
 *
 * Parse the given route and return the match object. The route matches here
 * are probably identical to the ones used by the application proper.
 *
 * The match object returned contains these properties:
 *
 *      name: the name of the widget the app will render for.
 *      slug: the slug for that thing.
 *      page: the page number or undefined.
 *      year: for posts.
 *      month: for posts.
 */
function parseRoute(location) {
    const routes = {
        category: new Route("/r/categor(y)(ies)/:slug(/p/:page)"),
        tag: new Route("/r/tag(s)/:slug(/p/:page)"),
        post: new Route("/r/post(s)/:year/:month/:slug"),
        page: new Route("/r/page(s)/:slug"),
        postList: new Route("/r/(index)(/p/:page)"),
    };
    var matched;
    for (let key in routes) {
        matched = routes[key].match(location);
        if (matched) {
            matched.name = key;
            break;
        }
    }
    return matched;
}

// Set the fetch function for the BlogAPI
setFetchFunction((location, args) => {
    location = location.replace(/\.(html|json)$/, "")
    const response = getResponse(location);
    if (response) {
        return new Promise((resolve, reject)=>{
            return resolve(new mockSuccessResponse({ response: response}))
        })
    } else {
        return new Promise((resolve, reject)=>{
            return resolve(new mockFailureResponse(location))
        })
    }
});