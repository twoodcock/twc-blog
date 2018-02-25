/*
 * API/BaseClasses
 *
 * This file defines generic mixins for APIItem and APIList models.
 *
 */
import defaultWorker from "./APIWorker";


/* joinRoute(list, of, args)
 *
 * Join the given arguments together with '/' for use in a URL. Attempt to
 * avoid generating '//' in the route by stripping trailing slashes from
 * values being joined.
 *
 * If the last argument has a trailing slash, the resulting route will have
 * a trailing slash.
 */
function defaultJoinRoute(...args) {
    // Note: add a trailing "" to get a trailing "/"
    var route = [];
    for (var i = 0; i < args.length; i++) {
            var value = args[i];
            if (i >= args.length - 1) {
                    // skip the last argument; we want to preserve a trailing slash if
                    // we are given one.
            } else if (!isNaN(value - parseFloat(value))) {
                    // Numbers don't have trailing slashes (and don't have a replace method.
            } else {
                    value = value.replace(/\/$/, "");
            }
            route.push(value);
    }
    return route.join("/");
}

/* APIComposable
 *
 * This is our root mixin.
 *
 * Classes mixed with this will get data for known properties and will be able
 * to interact with the API provided by the worker. Data is stored internally
 * inside a data object. This implementation provides only getters for values.
 *
 * Our Jobs:
 *
 * 1. Make sure there is an API worker to send requests.
 * 2. When we are given props, pick the attributes that we know about and
 *    store values in the data object.
 * 3  Convert values from props into objects as specified by myClasses()
 *    as we load them.
 *
 * Utility Methods:
 *
 *      joinRoute(...args):
 *
 *          Takes a list of route components and joins them with '/',
 *          attempting to make sure there is only 1 '/' between each
 *          component. (An attempt to replace python's os.path.join.)
 *
 * The subclass must provide:
 *
 *      route(props):
 *
 *          A routine to provide the base route for API interaction. By
 *          default, getRoute() calls this.
 *
 *      get myAttributes():
 *
 *          Return a list of valid properties that will be stored in the
 *          internal data object from the props object passed on
 *          instantiation.
 * 
 *          Values are converted to classes if they are present in the
 *          myClasses property.
 *
 * The subclass may provide:
 *
 *      get myClasses():
 *  
 *          Return a dictionary mapping properites to classes. Each class
 *          should instantiate by accepting a set of properties as
 *          APIComposable does.
 *
 *          The implementation accepts [ClassName] to allow for a list of
 *          instances. The implementation accepts { valueClass: ClassName } to
 *          allow for a dictionary of instances.
 *
 *          eg:
 *
 *          {
 *              'propertyName': SimpleClass
 *              'arrayPropertyName': [SomeClass]
 *              'dictPropertyName': { valueClass: SomeClass }
 *          }
 *
 *      getRoute(props): 
 *
 *          The routine to invoke a GET request. This is here because the next
 *          stage in API implementation is adding POST, PUT, and DELETE, which
 *          may have other routing information.
 *
 *          (This implementation has been stripped of these routines to reduce
 *          it to basics. The resulting refactoring will make the final full
 *          implementation stronger.)
 * 
 */
class APIComposable {
    constructor(props, worker=null) {
        // Compose with the API
        this.worker = worker?worker:defaultWorker;
        this.builtFrom=null;
        // Data is stored in the data attribute - not strictly necessary, but
        // it avoids confusion between attributes fetched and object control
        // attributes when examining this object.
        this.data = {};
        // Keep a record of operations completed.
        this.opCount = {
            get: 0,
        };
        // Load passed properties into the data object.
        if (props) {
            // Let's put all the data into the object; not all of it will be accessible.
            // When we send data, we only send valid fields.
            //this.data = props;
            this._setAttributesFromData(props);
        }
        for (var attr of this.myAttributes) {
            if (!this[attr]){
                var defn;
                defn = { get: this.getValue.bind(this, attr) }
                Object.defineProperty(this, attr, defn)
            }
        }
    }

    getValue(key) { return this.data[key]; }
    setValue(key, value) {
        const rv = this.data[key];
        this.data[key] = value;
        return rv;
    }

    get myAttributes() {return []}
    get apiUrl() {
        const url = this.data.url;
        if (url && !url.match(/\.json$/)) {
            // remember not to don't return ".json" if we don't have a url.
            return url + ".json";
        }
        return url;
    }

    urlFor(props) {
        props = Object.assign({}, props);
        if (!('slug' in props)) {
            props.slug = this.data.slug;
        }
        if (!('page' in props)) {
            props.page = 1;
        }
        var url = this.url_fmt.replace("{slug}", props.slug)
        const page = props.page?props.page:1;
        url = url.replace("{N}", (page === "1" || page === 1)?"":"/p/"+page);
        if (!url.match(/^\//)) {
            return "/"+url;
        }
        return url;
    }

    /* joinRoute(list, of, args)
     *
     * Join the given arguments together with '/' for use in a URL. Attempt to
     * avoid generating '//' in the route by stripping trailing slashes from
     * values being joined.
     *
     * If the last argument has a trailing slash, the resulting route will have
     * a trailing slash.
     */
    joinRoute(...args) {
        return defaultJoinRoute(...args)
    }

    /* getRoute(props)
     *
     * Return the route for the API get call.
     */
    getRoute(props) { return this.route(props); }

    /*
     * Define your own myClasses attribute to return an object showing what
     * keys are to be instantiated using a class.
     */
    get myClasses() {
        return {}
    }

    /*
     * classify - use classes to compose objects from raw input values.
     */
    classify(key, value) {
        var thingy = this.myClasses[key]
        // * thingy might be an array containing a single element: the class
        //   that should be instantiated for each value in the array.
        // * thingy might be an object with attribute valueClass, which will
        //   be used to provide class to the value of each attribute in the
        //   object.
        // * thingy is otherwise assumed to be a class.
        if (!thingy) {
            // we do not have a class defined for this key.
            return value;
        } else if (thingy instanceof Array) {
            // This is an array of thingies.
            const klass = thingy[0];
            return value.map((obj) => {
                return new klass(obj);
            })
        } else if (thingy instanceof Object && thingy['valueClass']) {
            // This is an array of thingies.
            const klass = thingy.valueClass;
            for (var property in value) {
                value[property] = new klass(value[property]);
            }
            return value;
        } else {
            // instantiate the singular thingy.
            return new thingy(value);
        }
    }

    /* _setAttributesFromData(data)
     *
     * Take only this.myAttributes from data and store them in this object.
     * Update our understanding of the original values of updatable attributes.
     */
    _setAttributesFromData(data) {
        // for debugging
        this.builtFrom=data;
        for (var key of this.myAttributes) {
            if (key in data) {
                this.data[key] = this.classify(key, data[key]);
            }
        }
    }
}

/* APIItem - Provides generic requests for an object.
 *
 * This is a trimmed version that only implements get requests.
 *
 * APIItem is a mixin class designed to be subclassed into objects that
 * interact iwth the API, usually representing a row in a database table.
 *
 *      obj = new APItem(props)
 *
 * Pass in attributes of the object. Some attributes will be used to compose
 * routes for API queries (as defined in route).
 *
 *
 * You interact with the API through this object.
 *
 *      promise = obj.get()
 *
 * When the promise is fulfilled the function called should accept an APIItem
 * object.
 *
 *      prmoise.then((item)=>{
 *          // do things with item
 *          // assert(item === this)
 *      })
 *
 * You should define 'getter's in myAttributes.
 * This is empty by default, and no data will be stored from the request.
 *
 *      get myAttributes() {}
 *          returns a list of all attributes returned from the API.
 *
 * You need to provide a route() method to provide the API with the default
 *
 *      route. route(props) {} returns the default route
 *
 * You may pass an API parameter on construction. This is an object that
 * provides this interface:
 * 
 *      obj = new APItem(props, API)
 *
 *  API Interface:   promise = api.get(route)
 */
export class APIItem extends APIComposable {
    // getRoute comes from APIComposable; it is used by APIList as well.

    /* get(props)
     *
     * Send an HTTP GET request. props may affect the request.
     * returns a promise returning this instance.
     */
    get(props) {
        return this.worker.get(this.getRoute(props))
        .then((data)=>{
            // Set the attributes in this object from the remote source.
            this._setAttributesFromData(data);
            return this;
        });
    }
}

/* APIList - Provides a way to get a list of things from the API.
 *
 * This class provides an interface for requests that return a list of
 * objects. When you use this mixin, you define a myListItemClass property
 * that is used to instantiate objects as found in the response.
 *
 * The interaface is slightly clumsy in order to allow for subclasses to
 * provide an observable interface. When you use APIList as a mixin and you
 * want to get items from the list, you need to iterate over obj.list:
 * 
 *      obj = new APIList();
 *      obj.get()
 *      .then((obj) => {
 *          for(var item of obj.list)  {
 *              // do things with items in the list.
 *          }
 *      })
 * 
 * Items in the list are in the class returned by the myListItemClass getter
 * that you must define in your subclass.
 *
 * What you need to do to use this mixin:
 *
 * 1. define a route method.
 *      route(props) { return "/my/api/route"}
 *      // Note the route should be reltative the API endpoint defined in Config.js.
 * 2. define a myListItemClass attribute. eg using 'get' to define a getter:
 *      get myListItemClass() { return MyClass }
 *
 * Eg:
 *
 *      class myClass extends APIList {
 *          get myListItemClass() { return ListItemClass; }
 *          route() {
 *              return "/list/route";
 *          }
 *      }
 */
export class APIList extends APIComposable {
    constructor(props, worker=null) {
        super(props, worker);
        this.data = [];
    }

    get list() { return this.data }
    get length() { return this.list.length; }

    hasItem(props) {
        for (var item of this.data) {
            var itemMatches = true;
            for (var key in props) {
                if (item[key] !== props[key]) {
                    itemMatches = false;
                    break;
                }
            }
            if (itemMatches) {
                return true;
            }
        }
        return false;
    }

    get(props) {
        return this.worker.get(this.getRoute(props))
        .then((list) => {
            var rv = [];
            // Convert raw items into objects of the right class.
            // (We should be making read-only objects from list items.)
            for (var item of list) {
                rv.push(new this.myListItemClass(item));
            }
            this.data = rv;
            return this;
        });
    }
}