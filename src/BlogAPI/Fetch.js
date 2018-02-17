/*
 * BlogAPI.Fetch
 *
 * This module provides a facade in front of the API accessor (fetch).
 *
 * This is where you inject a proof of authorization token 
 *
 * This implementation also allows a test to setFetchFunction(function). This
 * means tests can "make api requests" without actually interacting with the
 * remote API.
 *
 * Usage:
 *      import apiFetch from 'BlogAPI';
 *      apiFetch(target, { fetch args })
 *        .then(do stuff)
 *
 *      import setFetchFunction from 'BlogAPI.Fetch';
 *      setFetchFunction((target, args)=> {
 *          return new Promise(...); 
 *      })
 *
 */
import 'whatwg-fetch' 
import apiConfig from './Config';

var gFetchFunction = fetch;

export function setFetchFunction(fn) {
    gFetchFunction = fn;
}

export function apiFetch(target, args={}) {
    target = apiConfig.apiEndpoint + target;
    return gFetchFunction(target, args);
}
