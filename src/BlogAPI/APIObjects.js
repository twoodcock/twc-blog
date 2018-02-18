import { APIItem, APIList } from './Mixins';

/*
 * APIObjects - a set of objects to provide data to the application.
 * 
 * APIObjects are together in a single file out of necessity because they are
 * codependent.
 *
 *      APIPost is composed with APICategory
 *      APIPostList is composed with APIPost
 *      APICategory is based on APIPostList
 */

class APIAuthor extends APIItem {
    get myAttributes() {
        return [
            'name',
            'url'
        ]
    }

    get name() { return this.data.name }
    get url() { return this.data.url }
}

/*
 * APIPost
 *
 * APIPost has keys to identify it:
 *      slug: The file name, without the json suffix.
 *      year: The year of the post
 *      month: The month of the post,
 *
 * APIPost has these attributes:
 *      title:      string
 *      date:       date object?
 *      authors:    a list of APIAuthor objects.
 *      category:   The post category, an APICategory.
 *      tags:       The list of tags, a list of APITag.
 *      content:    String, probably containing raw HTML.
 */
export class APIPost extends APIItem {
    get myAttributes() {
        // This tells the superclass what to attributes exist.
        return [
            'slug',
            'title',
            'date',
            'authors',
            'summary',
            'categories',
            'tags',
            'content',
            'url',  // this is not useful for the user, but may be for us.
        ]
    }

    get myClasses() {
        return {
            authors: [APIAuthor],
            categories: [APICategory],
            tags: [APITag],
        }
    }

    route() {
        return "posts"
    }

    getRoute() {
        var route;
        console.log("getRoute called ", this)
        if (this.data.url) {
            route = this.data.url;
        } else {
            route = this.joinRoute(this.route, this.year, this.month, this.slug+".json");
        }
        console.log("getRoute: ", route)
        return route;
    }

    get url() { return this.data.url }
    get slug() { return this.data.slug }
    get title() { return this.data.title }
    get date() { return this.data.date }
    get authors() { return this.data.authors }
    get summary() { return this.data.summary }
    get categories() { return this.data.categories }
    get tags() { return this.data.tags }
    get content() { return this.data.content }
}

export class APIPostList extends APIItem {
    get myAttributes() {
        // This tells the superclass what to attributes exist.
        return [
            'next_url',
            'previous_url',
            'page_count',
            'page_number',
            'per_page',
            'post_count',
            'posts'
        ]
    }

    get myClasses() {
        return {
            posts: [APIPost],
        }
    }

    route() {
        return "index.json";
    }

    getRoute() {
        var route;
        console.log("getRoute called ", this)
        if (this.data.url) {
            route = this.data.url;
        } else {
            route = this.route();
        }
        console.log("getRoute: ", route)
        return route;
    }

    get url_fmt() { return "/index{N}.json" }
    get next_url() { return this.data.next_url }
    get previous_url() { return this.data.previous_url }
    get page_count() { return this.data.page_count }
    get page_number() { return this.data.page_number }
    get per_page() { return this.data.year }
    get post_count() { return this.data.post_count }
    get posts() { return this.data.posts }
}

export class APICategory extends APIPostList {
    get myAttributes() {
        // FIXME: Ideally we should be able to get the list of attributes from the superclass.
        return [
            'name',
            'shortname',
            'slug',
            'url',
            // generic post list attributes:
            'next_url',
            'previous_url',
            'page_count',
            'page_number',
            'per_page',
            'post_count',
            'posts'
        ];
    }

    get url_fmt() { return "/categories/{slug}{N}.json" }
    get slug() { return this.data.slug }

    route() { return "category"; }

    getRoute() {
        var route;
        console.log("getRoute called ", this)
        if (this.data.url) {
            route = this.data.url;
        } else {
            route = this.joinRoute(this.route, this.slug+".json");
        }
        console.log("getRoute: ", route)
        return route;
    }

    get shortname() {
        if (this.data.shortname) {
            return this.data.shortname;
        }
        return this.data.name;
    }
}

export class APITag extends APIPostList {
    get myAttributes() {
        const list = super.myAttributes;
        var newList = [
            'name',
            'url',
            'slug',
        ];
        newList.push(...list);
        return newList;
    }

    get url_fmt() { return "/tag/{slug}{N}.json" }
    get slug() { return this.data.slug }

    getRoute() {
        var route;
        if (this.data.url) {
            route = this.data.url;
        } else {
            route = this.joinRoute(this.route, this.slug+".json");
        }
        console.log("getRoute: ", route)
        return route;
    }

    get name() { return this.data.name }
    get url() { return this.data.url }
}

/*
 * APITagList - get a list of tags.
 * 
 * list = null;
 * tagList = new APITagList();
 * taglist.get().then(()=>{
 *      list = tagList.list;
 * })
 *
 * Note: If you want to make this observable, compose it with an obserable
 * class:
 *      constructor(props) {
 *           super(props);
 *           this.events = new Observable();
 *      }
 */
export class APITagList extends APIList {
    get myListItemClass() {
        return APIItem;
    }

    route() {
        return this.joinRoute(this.route, "tags/index.json")
    }

    get name() { return this.data.name }
    get url() { return this.data.url }
}