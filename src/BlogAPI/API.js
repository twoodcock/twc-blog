/*
 * API.js
 *
 * This file provides the API interaction class.
 * API data classes are composed with an API, making testing simpler.
 *
 * Exports:
 *
 * default: The API instance.
 */

import { apiFetch } from './Fetch';

/*
 * API
 * 
 * Provides methods:
 * promise = obj.get(route);
 *
 * Not yet Implemented:
 * promise = obj.update(route, data);
 * promise = obj.create(route, data);
 * promise = obj.delete(route);
 */

export class API {
    constructor() {
        this.verbose = 0;
        this.opCount = {
            get: 0, update: 0, create: 0, delete: 0
        }
    }

    get logPrefix() { return " === API === "+this.constructor.name+" === " }

    get(route) { return this._send('get',  route); }

    _send(method, route, data=null) {
        /* 
         *  Send a update request, deliver content.
         */
        var params = {
            method: method,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        }
        if (data) {
            params.body = JSON.stringify(data);
        }
        console.log(this.logPrefix + " --- "+method+" --- send("+route+") ", params)
        return apiFetch(route, params).then((response) => {
            this.opCount[method]++;
            if (!response.ok) {
                console.log(this.logPrefix+" --- "+method+" response not ok --- ", response)
                throw response;
            }
            // response.text().then((text)=>
            // console.log(this.logPrefix+" *** "+method+" complete *** ", text)
            //     )
            return response.json();
        }).catch((error) => {
            // refetch to get the json text.
            apiFetch(route, params).then((response) => {
                response.text().then((text) => {
                    console.log(this.logPrefix+" --- "+method+" json --- ", text)
                })
            });
            console.log(this.logPrefix+" --- "+method+" error --- ", error)
            throw (error);
        })
    }
};

export default new API();