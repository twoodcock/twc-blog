/*
 * Fetch is a plug-in replacement for the fetch() routing (either built in
 * or the polyfill).
 *
 * This file tests the apiFetch routine.
 *
 * We are checking that the routine implements something approximiating the
 * standard fetch API. It needs to be able to send headers, for example. This
 * is not used in our current implementation, but an implementation that needs
 * authentication, for example, needs to add header information.
 *
 * Note: We are using a trimmed version of the original module that doesn't
 * automatically add a JWT header.
 */

import { apiFetch, setFetchFunction } from '../Fetch';
import config from '../Config';

/* mockFetch(target, args)
 *
 * Our replacement for the JavaScript fetch routine.
 *
 * We just need to return the arguments we are given. This allows the test to
 * check that the implementation correctly passes the arguments through.
 */
function mockFetch(target, args) {
    return [target, args];
}

// The fetch function needs to be set only once - it always returns the
// parameters we would normally use to call fetch.
setFetchFunction(mockFetch);

// We need to know what the endpoint is because this will be added to the
// route we pass to apiFetch().
let apiEndpoint = config['test'].apiEndpoint;

// define a function that will invoke our fetch fuction with the correct
// arguments.
function mkFetchFunction(url, args) {
    if (args != null) {
        return () => { return apiFetch(url, args); };
    }
    return () => { return apiFetch(url); };
};

// Define a function to handle testing.
function TH(tag, invoke, expectThis) {
    let rv = invoke();
    test(tag, () => {
        expect(rv).toEqual(expectThis)
    });
}

TH(
    "fetch without arguments: ",
    mkFetchFunction("noargs", null),
    [apiEndpoint + "noargs", {  }]
);

TH(
    "fetch, set header X-TEST: BLAH!: ",
    mkFetchFunction("hasHeaders", {
        headers: {
            'X-TEST': "BLAH!"
        },
        moreArgs: "here"
    }),
    [apiEndpoint+"hasHeaders", {
        headers: {
            'X-TEST': 'BLAH!'
        },
        moreArgs: 'here'
    }]
);
