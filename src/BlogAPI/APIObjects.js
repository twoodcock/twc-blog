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
        return [ 'name', 'url' ]
    }
}

/*
 * APIPage
 *
 * APIPage has keys to identify it:
 *      slug: The file name, without the json suffix.
 *      year: The year of the post
 *      month: The month of the post,
 *
 * APIPage has these attributes:
 *      title:      string
 *      date:       date object?
 *      authors:    a list of APIAuthor objects.
 *      category:   The post category, an APICategory.
 *      tags:       The list of tags, a list of APITag.
 *      content:    String, probably containing raw HTML.
 */
export class APIPage extends APIItem {
    get myAttributes() {
        // This tells the superclass what to attributes exist.
        return [
            'slug',
            'title',
            'date',
            'authors',
            'categories',
            'cssid',
            'content',
            'url',  // this is not useful for the user, but may be for us.
        ]
    }

    get myClasses() {
        return {
            authors: [APIAuthor],
            categories: [APICategory],
        }
    }

    get url_fmt() { return "/pages/{slug}" }
    route() {
        return "pages"
    }

    getRoute() {
        var route;
        if (this.data.url) {
            route = this.data.url;
        } else {
            route = this.joinRoute(this.route, this.year, this.month, this.slug+".json");
        }
        return route;
    }
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
            date: Date,
            authors: [APIAuthor],
            categories: [APICategory],
            tags: [APITag],
        }
    }

    get url_fmt() { return "/posts/{year}/{month}/{slug}" }
    urlFor(props) {
        props = Object.assign({}, props);
        var dateArr = [];
        if (!('year' in props) || !('month' in props)) {
            const dateStr = this.date.toISOString();
            dateArr = dateStr.split('-');
        }
        if (!('year' in props)) {
            props.year = dateArr[0];
        }
        if (!('month' in props)) {
            props.month = dateArr[1];
        }
        if (!('slug' in props)) {
            props.slug = this.slug;
        }
        var url = this.url_fmt.replace("{slug}", props.slug)
        url = url.replace("{year}", props.year);
        url = url.replace("{month}", props.month);
        if (!url.match(/^\//)) {
            return "/"+url;
        }
        return url;
    }
    route() {
        return "posts"
    }

    getRoute() {
        var route;
        if (this.data.url) {
            route = this.data.url;
        } else {
            route = this.joinRoute(this.route, this.year, this.month, this.slug+".json");
        }
        return route;
    }
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
            'posts',
            'slug'
        ]
    }

    get myClasses() {
        return {
            posts: [APIPost],
        }
    }
    get length() {
        return this.data.posts.length;
    }

    get url_fmt() { return "/index{N}" }

    route() {
        return "index.json";
    }

    getRoute() {
        var route;
        route = this.apiUrl
        if (!route) {
            route = this.route();
        }
        return route;
    }
}

export class APICategory extends APIPostList {
    get myAttributes() {
        // FIXME: Ideally we should be able to get the list of attributes from the superclass.
        return super.myAttributes.concat([
            'name',
            'shortname',
            'url',
        ]);
    }

    get url_fmt() { return "/category/{slug}{N}" }

    getRoute() {
        return this.apiUrl;
    }

    get shortname() {
        if (this.data.shortname) {
            return this.data.shortname;
        }
        return this.data.name;
    }
}

export class APICategoryBranch extends APIItem {
    // You'll never 'get' this one; this is used as infrastructure.
}
export class APICategoryTree extends APIItem {
    get myAttributes() {
        return [
            'tree',
            'categories',
        ]
    }
    get myClasses() {
        return {
            'categories': { valueClass: APICategory }
        }
    }
    get length() {
        if (this.data.categories) {
            return this.data.categories.length;
        }
        return 0;
    }
    getRoute() {
        return 'category/index__tree.json'
    }
}

export class APICategoryList extends APIList {
    get myAttributes() {
        // FIXME: Ideally we should be able to get the list of attributes from the superclass.
        return [
            'name',
            'shortname',
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

    get url_fmt() { return "/category/{slug}{N}" }

    route() { return "category"; }

    getRoute() {
        var route;
        if (this.data.url) {
            route = this.data.url;
        } else {
            route = this.joinRoute(this.route, this.slug+".json");
        }
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
        return super.myAttributes.concat([
            'name',
            'url',
        ]);
    }

    get url_fmt() { return "/tag/{slug}{N}" }

    getRoute() {
        var route;
        if (this.data.url) {
            route = this.data.url;
        } else {
            route = this.joinRoute(this.route, this.slug+".json");
        }
        return route;
    }
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
        return APITag;
    }

    route() {
        return "tag";
    }
    getRoute() {
        return this.joinRoute(this.route(), "index.json")
    }
}

const BlogAPI = {
    PostList: APIPostList,
    Post: APIPost, 
    Page: APIPage,
    Category: APICategory,
    Tag: APITag,
    TagList: APITagList,
    CategoryTree: APICategoryTree
}

export default BlogAPI;